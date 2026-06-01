import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { anthropic } from "@/lib/anthropic";
import { createClient, createAdminClient } from "@/lib/auth";
import { VERIFICATION_DOCS_BUCKET } from "@/lib/storage";
import { prepareVerificationImageForAi } from "@/lib/prepare-verification-image";

export const maxDuration = 60;
export const runtime = "nodejs";

const AI_SYSTEM_PROMPT = `You are a document verification assistant for Rosterly, a professional gig platform in Jamaica.

Your job is to analyse identity documents and selfie photos submitted for account verification.

You are NOT making a final decision — a human admin will review your analysis and make the final call.

Analyse the documents and return ONLY a JSON object in this exact format, no other text:
{
  "verdict": "pass" | "review" | "flag",
  "confidence": 0-100,
  "id_document": {
    "detected_type": "passport" | "drivers_licence" | "national_id" | "unknown",
    "text_visible": true | false,
    "appears_genuine": true | false,
    "anomalies": []
  },
  "selfie": {
    "face_clearly_visible": true | false,
    "good_lighting": true | false,
    "appears_genuine": true | false,
    "anomalies": []
  },
  "overall_anomalies": [],
  "recommendation": "brief plain-English summary for the admin"
}

Verdict guide:
- "pass" — documents look genuine, selfie clear, no concerns. Admin likely to approve quickly.
- "review" — minor issues worth a closer look (poor lighting, partial document, slightly blurry) but not necessarily fraudulent.
- "flag" — significant concerns detected (signs of tampering, edited pixels, mismatched document type, face not visible, suspected copy of a photo of a photo).

Anomaly examples to detect:
- Document appears to be a photograph of a photograph (common fraud attempt)
- Unusual pixelation or blurring around text or photo areas (possible digital editing)
- Document edges look cut off or artificially extended
- Selfie face not visible or obscured
- Selfie appears to be a photo of a photo or a screen
- Very low resolution suggesting the image was upscaled
- Inconsistent lighting between document background and text
- For Jamaican context: check for TRN card, passport, or driver's licence formats

If only an ID document is provided (no selfie), still analyse the ID and set selfie fields to null/false as appropriate with recommendation noting missing selfie.

Never include the person's actual name, ID number, or any personal data in your response.
Be conservative — err on the side of "review" rather than "flag" for borderline cases.`;

function storagePathFromStored(value: string): string {
  const marker = `/${VERIFICATION_DOCS_BUCKET}/`;
  const idx = value.indexOf(marker);
  if (idx >= 0) return value.slice(idx + marker.length);
  return value;
}

async function downloadPreparedImage(
  admin: ReturnType<typeof createAdminClient>,
  path: string
): Promise<{ base64: string; mediaType: "image/jpeg" } | null> {
  const storagePath = storagePathFromStored(path);
  const { data, error } = await admin.storage
    .from(VERIFICATION_DOCS_BUCKET)
    .download(storagePath);

  if (error || !data) return null;
  if (data.type === "application/pdf") return null;

  const buffer = Buffer.from(await data.arrayBuffer());
  return prepareVerificationImageForAi(buffer);
}

export async function POST(req: NextRequest) {
  try {
    const internalKey = req.headers.get("x-internal-key");
    const configuredKey = process.env.INTERNAL_API_KEY;
    const isInternalCall =
      !!configuredKey &&
      !!internalKey &&
      internalKey === configuredKey;

    let supabase: SupabaseClient;

    if (isInternalCall) {
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { verificationId } = await req.json();
    if (!verificationId || typeof verificationId !== "string") {
      return NextResponse.json({ error: "verificationId required" }, { status: 400 });
    }

    const { data: verification } = await supabase
      .from("verifications")
      .select("id, id_doc_url, selfie_url, type, user_id")
      .eq("id", verificationId)
      .single();

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    if (!verification.id_doc_url) {
      return NextResponse.json({ error: "No ID document on file" }, { status: 400 });
    }

    const admin = createAdminClient();

    const [idDoc, selfieDoc] = await Promise.all([
      downloadPreparedImage(admin, verification.id_doc_url),
      verification.selfie_url
        ? downloadPreparedImage(admin, verification.selfie_url)
        : Promise.resolve(null),
    ]);

    if (!idDoc) {
      return NextResponse.json(
        {
          error:
            "Could not load ID document for AI analysis (missing file or PDF format). Review manually.",
        },
        { status: 500 }
      );
    }

    const userContent: Array<
      | { type: "text"; text: string }
      | {
          type: "image";
          source: {
            type: "base64";
            media_type: "image/jpeg" | "image/png" | "image/webp";
            data: string;
          };
        }
    > = [
      {
        type: "text",
        text: selfieDoc
          ? "Please analyse these verification documents. First is the ID document, second is the selfie."
          : "Please analyse this verification ID document. No selfie was submitted (merchant officer verification).",
      },
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: idDoc.base64,
        },
      },
    ];

    if (selfieDoc) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: selfieDoc.base64,
        },
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system: AI_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    let analysis: Record<string, unknown>;
    try {
      analysis = JSON.parse(content.replace(/```json|```/g, "").trim()) as Record<
        string,
        unknown
      >;
    } catch {
      return NextResponse.json(
        { error: "AI analysis failed to parse" },
        { status: 500 }
      );
    }

    const verdict = analysis.verdict as string | undefined;
    if (!verdict || !["pass", "review", "flag"].includes(verdict)) {
      return NextResponse.json({ error: "Invalid AI verdict" }, { status: 500 });
    }

    const confidence =
      typeof analysis.confidence === "number"
        ? Math.round(analysis.confidence)
        : null;

    await supabase
      .from("verifications")
      .update({
        ai_verdict: verdict,
        ai_confidence: confidence,
        ai_analysis: analysis,
        ai_reviewed_at: new Date().toISOString(),
      })
      .eq("id", verificationId);

    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    console.error("AI verification error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
