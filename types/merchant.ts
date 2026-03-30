/** Allowed payment method values for merchant. */
export type MerchantPaymentMethod = "cash" | "bank_transfer" | "card";

/**
 * Merchant profile types (match DB).
 */
export type MerchantProfile = {
  user_id: string;
  business_name: string | null;
  business_type: string | null;
  address: string | null;
  trn: string | null;
  payment_method: string | null;
  disclaimer_accepted_at: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type MerchantProfileForm = {
  business_name: string | null;
  business_type: string | null;
  address: string | null;
  trn: string | null;
  payment_method: string | null;
  /** When true, store disclaimer_accepted_at on save so the checkbox persists. */
  accept_disclaimer?: boolean;
};

/** One responsible officer (merchant_responsible_officers). */
export type MerchantResponsibleOfficer = {
  id: string;
  user_id: string;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  id_doc_url: string | null;
  created_at: string;
};

export type MerchantResponsibleOfficerForm = {
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  id_doc_url?: string | null;
};
