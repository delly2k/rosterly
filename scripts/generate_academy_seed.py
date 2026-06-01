"""Generate academy re-seed migration SQL."""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT_FILE = ROOT / "supabase/migrations/20250208500000_academy_module_content.sql"
OUT = ROOT / "supabase/migrations/20250208600000_academy_reseed.sql"

LEVEL_IDS = [
    "a1000000-0000-0000-0000-000000000001",
    "a1000000-0000-0000-0000-000000000002",
    "a1000000-0000-0000-0000-000000000003",
]

LEVEL_META = [
    (1, "Rosterly Certified", "Level 1", "Foundation training for brand ambassadors and event staff in Jamaica.", True, "gold"),
    (2, "Advanced Brand Ambassador", "Level 2", "Advanced techniques for premium activations and lead roles.", False, "green"),
    (3, "Master Promoter", "Level 3", "Elite certification for senior promoters and team leads.", False, "blue"),
]

MODULES = [
    # level 1
    (1, 1, "What Is A Brand Ambassador?", "Understand your role as the face of a brand.", True),
    (1, 2, "Professional Appearance", "Presentation standards for every activation.", True),
    (1, 3, "Punctuality And Reliability", "Why being on time protects your reputation.", True),
    (1, 4, "Customer Service Fundamentals", "The S.E.R.V.E method for customer interactions.", True),
    (1, 5, "Communication Skills", "Speak clearly, listen actively, and close confidently.", True),
    (1, 6, "Workplace Ethics", "Integrity rules that protect your career.", True),
    # level 2
    (2, 1, "Understanding Premium Activations", "Standards for flagship stores and launch events.", True),
    (2, 2, "Advanced Product Knowledge", "Master specs, benefits, and demonstrations.", True),
    (2, 3, "Handling Objections", "Use the L.A.R.A framework with confidence.", True),
    (2, 4, "Upselling Techniques", "Recommend options that genuinely help customers.", True),
    (2, 5, "Campaign Reporting", "Accurate reporting that builds trust.", True),
    (2, 6, "Leading Your Team", "On-site leadership for promotional teams.", True),
    # level 3
    (3, 1, "Building Your Reputation", "How your track record becomes your CV.", True),
    (3, 2, "Training New Promoters", "Coach others effectively on activations.", True),
    (3, 3, "Crisis Management", "Stay calm when things go wrong.", True),
    (3, 4, "Strategic Campaign Thinking", "Think like the brand manager.", True),
    (3, 5, "Working With Difficult Clients", "Professional distance under pressure.", True),
    (3, 6, "High-Volume Events", "Systems for festivals and roadshows.", True),
    (3, 7, "Team Lead Certification", "Coordinate people, not just sell product.", True),
]

ASSESSMENT_IDS = [
    "c1000000-0000-0000-0000-000000000001",
    "c1000000-0000-0000-0000-000000000002",
    "c1000000-0000-0000-0000-000000000003",
]

ASSESSMENT_TITLES = [
    "Rosterly Certified Final Assessment",
    "Advanced Brand Ambassador Final Assessment",
    "Master Promoter Final Assessment",
]


def module_id(level: int, order: int) -> str:
    n = (level - 1) * 10 + order
    return f"b1000000-0000-0000-0000-{n:012d}"


def question_id(kind: str, index: int) -> str:
    prefix = "d1" if kind == "module" else "d2"
    return f"{prefix}000000-0000-0000-0000-{index:012d}"


def assessment_question_id(assessment: int, order: int) -> str:
    base = assessment * 100 + order
    return f"e1000000-0000-0000-0000-{base:012d}"


def sql_quote(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def parse_level1_html(content: str) -> dict[str, str]:
    out: dict[str, str] = {}
    parts = re.split(r"WHERE title = '([^']+)';", content)
    i = 1
    while i < len(parts):
        title = parts[i]
        html = parts[i + 1]
        m = re.search(r"SET content_html = \$html\$(.*?)\$html\$", html, re.DOTALL)
        if m:
            out[title] = m.group(1).strip()
        i += 2
    return out


def parse_level23_html(content: str) -> dict[tuple[int, int], str]:
    out: dict[tuple[int, int], str] = {}
    pattern = re.compile(
        r"UPDATE public\.academy_modules m\s+SET content_html = \$html\$(.*?)\$html\$\s+FROM public\.academy_levels l\s+WHERE m\.level_id = l\.id AND l\.order_index = (\d+) AND m\.order_index = (\d+);",
        re.DOTALL,
    )
    for m in pattern.finditer(content):
        out[(int(m.group(2)), int(m.group(3)))] = m.group(1).strip()
    return out


def main() -> None:
    raw = CONTENT_FILE.read_text(encoding="utf-8")
    l1 = parse_level1_html(raw)
    l23 = parse_level23_html(raw)

    lines: list[str] = [
        "-- Re-seed academy content (works on fresh and existing databases)",
        "",
        "-- Canonical level IDs",
    ]

    for lid, (oi, title, subtitle, desc, req, badge) in zip(LEVEL_IDS, LEVEL_META):
        lines.append(
            f"INSERT INTO public.academy_levels (id, order_index, title, subtitle, description, required_for_platform, badge_color)"
        )
        lines.append(
            f"VALUES ({sql_quote(lid)}, {oi}, {sql_quote(title)}, {sql_quote(subtitle)}, {sql_quote(desc)}, {str(req).lower()}, {sql_quote(badge)})"
        )
        lines.append("ON CONFLICT (id) DO UPDATE SET")
        lines.append(
            "  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,"
        )
        lines.append(
            "  required_for_platform = EXCLUDED.required_for_platform, badge_color = EXCLUDED.badge_color;"
        )
        lines.append("")

    lines.append("-- Reconcile modules on legacy level rows")
    for level_idx, lid in enumerate(LEVEL_IDS, start=1):
        lines.append(
            f"UPDATE public.academy_modules SET level_id = {sql_quote(lid)}::uuid"
        )
        lines.append(
            f"WHERE level_id IN (SELECT id FROM public.academy_levels WHERE order_index = {level_idx} AND id <> {sql_quote(lid)}::uuid);"
        )
        lines.append(
            f"UPDATE public.academy_assessments SET level_id = {sql_quote(lid)}::uuid"
        )
        lines.append(
            f"WHERE level_id IN (SELECT id FROM public.academy_levels WHERE order_index = {level_idx} AND id <> {sql_quote(lid)}::uuid);"
        )
        lines.append(
            f"DELETE FROM public.academy_levels WHERE order_index = {level_idx} AND id <> {sql_quote(lid)}::uuid;"
        )
    lines.append("")

    lines.append("-- Drop legacy modules/assessments on canonical levels (random UUIDs from initial seed block canonical slots)")
    lines.append("DELETE FROM public.academy_questions q")
    lines.append("USING public.academy_modules m")
    lines.append("WHERE q.module_id = m.id")
    lines.append("  AND m.level_id IN (")
    lines.append("    'a1000000-0000-0000-0000-000000000001'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000002'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000003'::uuid")
    lines.append("  )")
    lines.append("  AND m.id::text !~ '^b1000000-0000-0000-0000-';")
    lines.append("")
    lines.append("DELETE FROM public.academy_progress p")
    lines.append("USING public.academy_modules m")
    lines.append("WHERE p.module_id = m.id")
    lines.append("  AND m.level_id IN (")
    lines.append("    'a1000000-0000-0000-0000-000000000001'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000002'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000003'::uuid")
    lines.append("  )")
    lines.append("  AND m.id::text !~ '^b1000000-0000-0000-0000-';")
    lines.append("")
    lines.append("DELETE FROM public.academy_modules m")
    lines.append("WHERE m.level_id IN (")
    lines.append("    'a1000000-0000-0000-0000-000000000001'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000002'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000003'::uuid")
    lines.append("  )")
    lines.append("  AND m.id::text !~ '^b1000000-0000-0000-0000-';")
    lines.append("")
    lines.append("DELETE FROM public.academy_assessment_questions aq")
    lines.append("USING public.academy_assessments a")
    lines.append("WHERE aq.assessment_id = a.id")
    lines.append("  AND a.level_id IN (")
    lines.append("    'a1000000-0000-0000-0000-000000000001'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000002'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000003'::uuid")
    lines.append("  )")
    lines.append("  AND a.id::text !~ '^c1000000-0000-0000-0000-';")
    lines.append("")
    lines.append("DELETE FROM public.academy_assessment_attempts at")
    lines.append("USING public.academy_assessments a")
    lines.append("WHERE at.assessment_id = a.id")
    lines.append("  AND a.level_id IN (")
    lines.append("    'a1000000-0000-0000-0000-000000000001'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000002'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000003'::uuid")
    lines.append("  )")
    lines.append("  AND a.id::text !~ '^c1000000-0000-0000-0000-';")
    lines.append("")
    lines.append("DELETE FROM public.academy_assessments a")
    lines.append("WHERE a.level_id IN (")
    lines.append("    'a1000000-0000-0000-0000-000000000001'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000002'::uuid,")
    lines.append("    'a1000000-0000-0000-0000-000000000003'::uuid")
    lines.append("  )")
    lines.append("  AND a.id::text !~ '^c1000000-0000-0000-0000-';")
    lines.append("")

    lines.append("-- Modules")
    q_index = 1
    for level, order, title, desc, has_quiz in MODULES:
        mid = module_id(level, order)
        lid = LEVEL_IDS[level - 1]
        html = l1.get(title) or l23.get((level, order)) or f"<p>{desc}</p>"
        html_sql = "$html$" + html + "$html$"
        lines.append(
            f"INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)"
        )
        lines.append(
            f"VALUES ({sql_quote(mid)}::uuid, {sql_quote(lid)}::uuid, {order}, {sql_quote(title)}, {sql_quote(desc)}, {str(has_quiz).lower()}, true, {html_sql})"
        )
        lines.append("ON CONFLICT (id) DO UPDATE SET")
        lines.append(
            "  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,"
        )
        lines.append(
            "  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,"
        )
        lines.append("  content_html = EXCLUDED.content_html;")
        lines.append("")

        if has_quiz:
            opts = json.dumps(["A", "B", "C", "D"])
            for qi, (qtext, correct) in enumerate(
                [
                    (f"Which topic is central to \"{title}\"?", "A"),
                    (f"What is the best professional habit related to {title.split()[0]} work?", "B"),
                ],
                start=1,
            ):
                qid = question_id("module", q_index)
                q_index += 1
                lines.append(
                    "INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)"
                )
                lines.append(
                    f"VALUES ({sql_quote(qid)}::uuid, {sql_quote(mid)}::uuid, {qi}, {sql_quote(qtext)}, 'multiple_choice', '{opts}'::jsonb, {sql_quote(correct)}, {sql_quote('Review the lesson content.')})"
                )
                lines.append("ON CONFLICT (id) DO UPDATE SET")
                lines.append(
                    "  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,"
                )
                lines.append(
                    "  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;"
                )
                lines.append("")

    lines.append("-- Assessments")
    for i, (lid, aid, atitle) in enumerate(zip(LEVEL_IDS, ASSESSMENT_IDS, ASSESSMENT_TITLES), start=1):
        lines.append(
            "INSERT INTO public.academy_assessments (id, level_id, title, pass_mark, time_limit_minutes, is_published)"
        )
        lines.append(
            f"VALUES ({sql_quote(aid)}::uuid, {sql_quote(lid)}::uuid, {sql_quote(atitle)}, 80, 45, true)"
        )
        lines.append("ON CONFLICT (id) DO UPDATE SET")
        lines.append(
            "  level_id = EXCLUDED.level_id, title = EXCLUDED.title, pass_mark = EXCLUDED.pass_mark,"
        )
        lines.append(
            "  time_limit_minutes = EXCLUDED.time_limit_minutes, is_published = EXCLUDED.is_published;"
        )
        lines.append("")

        level_title = LEVEL_META[i - 1][1]
        for q in range(1, 26):
            qid = assessment_question_id(i, q)
            qtext = f"[{level_title}] Assessment question {q}: What is the most professional choice?"
            opts = json.dumps(
                [
                    "Follow campaign standards and communicate clearly",
                    "Ignore the brief and improvise",
                    "Leave early without telling anyone",
                    "Argue with customers who disagree",
                ]
            )
            lines.append(
                "INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)"
            )
            lines.append(
                f"VALUES ({sql_quote(qid)}::uuid, {sql_quote(aid)}::uuid, {q}, {sql_quote(qtext)}, '{opts}'::jsonb, {sql_quote('Follow campaign standards and communicate clearly')}, {sql_quote('Professional conduct protects your reputation and the brand.')})"
            )
            lines.append("ON CONFLICT (id) DO UPDATE SET")
            lines.append(
                "  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,"
            )
            lines.append(
                "  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;"
            )
            lines.append("")

    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(lines)} lines)")


if __name__ == "__main__":
    main()
