-- Store ID document URL per responsible officer.
alter table public.merchant_responsible_officers
  add column if not exists id_doc_url text;

comment on column public.merchant_responsible_officers.id_doc_url is
  'Storage path for this officer''s ID document (e.g. passport, driver licence).';
