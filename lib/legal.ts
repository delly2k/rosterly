/**
 * Legal acknowledgment document type and version.
 * When content or requirements change: increment PAYMENT_DISCLOSURE_VERSION
 * and force re-acknowledgment for users who accepted an older version.
 */
export const LEGAL_DOCUMENT_TYPE = "payment_disclosure_v1" as const;
export const PAYMENT_DISCLOSURE_VERSION = 1;

export const PAYMENT_DISCLOSURE_TITLE = "Payment & Liability Acknowledgment";

export const PAYMENT_DISCLOSURE_CONTENT = `The platform does not process, hold, or transfer payments between users.
All payment arrangements are made directly between merchants and participants.
The platform does not guarantee payment, enforce payment terms, or act as an escrow agent.
Users engage in gigs at their own discretion.
The platform may assist in logging attendance and disputes but is not responsible for collecting or disbursing funds.
Users are responsible for complying with applicable tax and financial laws.`;

export const PAYMENT_DISCLOSURE_CHECKBOX_LABEL =
  "I understand and accept these terms.";

/** Error message returned when user has not accepted the required disclosure. Do not change; client checks for it. */
export const LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE =
  "LEGAL_ACKNOWLEDGMENT_REQUIRED";
