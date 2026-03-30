-- Extend merchant_profiles: address, TRn, payment method, officer contact/position.
alter table public.merchant_profiles
  add column if not exists address text,
  add column if not exists trn text,
  add column if not exists payment_method text,
  add column if not exists officer_position text,
  add column if not exists officer_email text,
  add column if not exists officer_phone text;

comment on column public.merchant_profiles.address is 'Business address.';
comment on column public.merchant_profiles.trn is 'Tax reference number (TRn).';
comment on column public.merchant_profiles.payment_method is 'Preferred payment: cash, bank_transfer, card.';
comment on column public.merchant_profiles.officer_position is 'Responsible officer job title/position.';
comment on column public.merchant_profiles.officer_email is 'Responsible officer email.';
comment on column public.merchant_profiles.officer_phone is 'Responsible officer phone number.';

-- Optional: constrain payment_method to known values (application can enforce too)
alter table public.merchant_profiles
  add constraint merchant_profiles_payment_method_check
  check (payment_method is null or payment_method in ('cash', 'bank_transfer', 'card'));
