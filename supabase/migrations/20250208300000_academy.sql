-- Rosterly Academy: levels, modules, quizzes, assessments, certificates

create table public.academy_levels (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null default 0,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  required_for_platform boolean not null default false,
  badge_color text not null default 'gold' check (badge_color in ('gold', 'green', 'blue')),
  created_at timestamptz not null default now()
);

create table public.academy_modules (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.academy_levels(id) on delete cascade,
  order_index integer not null default 0,
  title text not null,
  description text not null default '',
  content_html text not null default '',
  video_url text,
  video_duration_seconds integer,
  has_quiz boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (level_id, order_index)
);

create index idx_academy_modules_level on public.academy_modules(level_id);

create table public.academy_questions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  order_index integer not null default 0,
  question text not null,
  type text not null default 'multiple_choice'
    check (type in ('multiple_choice', 'true_false')),
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text not null default '',
  created_at timestamptz not null default now()
);

create index idx_academy_questions_module on public.academy_questions(module_id);

create table public.academy_assessments (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.academy_levels(id) on delete cascade unique,
  title text not null,
  pass_mark integer not null default 80,
  time_limit_minutes integer not null default 45,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.academy_assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.academy_assessments(id) on delete cascade,
  order_index integer not null default 0,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text not null default '',
  created_at timestamptz not null default now()
);

create index idx_academy_assessment_questions_assessment on public.academy_assessment_questions(assessment_id);

create table public.academy_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  completed_at timestamptz,
  quiz_passed boolean not null default false,
  quiz_score integer,
  video_watched boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create table public.academy_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.academy_assessments(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score integer not null default 0,
  passed boolean not null default false,
  submitted_at timestamptz not null default now()
);

create index idx_academy_attempts_user on public.academy_assessment_attempts(user_id);

create table public.academy_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  level_id uuid not null references public.academy_levels(id) on delete cascade,
  certificate_code text not null unique,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  is_valid boolean not null default true,
  unique (user_id, level_id)
);

create index idx_academy_certificates_code on public.academy_certificates(certificate_code);
create index idx_academy_certificates_user on public.academy_certificates(user_id);

create or replace function public.generate_academy_certificate_code()
returns text
language plpgsql
as $$
declare
  code text;
begin
  loop
    code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 10));
    exit when not exists (
      select 1 from public.academy_certificates where certificate_code = code
    );
  end loop;
  return code;
end;
$$;

create or replace function public.academy_certificates_set_code()
returns trigger
language plpgsql
as $$
begin
  if new.certificate_code is null or new.certificate_code = '' then
    new.certificate_code := public.generate_academy_certificate_code();
  end if;
  return new;
end;
$$;

create trigger academy_certificates_before_insert
  before insert on public.academy_certificates
  for each row execute function public.academy_certificates_set_code();

-- RLS
alter table public.academy_levels enable row level security;
alter table public.academy_modules enable row level security;
alter table public.academy_questions enable row level security;
alter table public.academy_assessments enable row level security;
alter table public.academy_assessment_questions enable row level security;
alter table public.academy_progress enable row level security;
alter table public.academy_assessment_attempts enable row level security;
alter table public.academy_certificates enable row level security;

create policy "Anyone authenticated can read academy levels"
  on public.academy_levels for select to authenticated using (true);

create policy "Anyone authenticated can read published modules"
  on public.academy_modules for select to authenticated
  using (is_published = true or (select private.get_my_role()) = 'admin');

create policy "Admins manage modules"
  on public.academy_modules for all to authenticated
  using ((select private.get_my_role()) = 'admin')
  with check ((select private.get_my_role()) = 'admin');

create policy "Read module questions when module published or admin"
  on public.academy_questions for select to authenticated
  using (
    exists (
      select 1 from public.academy_modules m
      where m.id = module_id
        and (m.is_published = true or (select private.get_my_role()) = 'admin')
    )
  );

create policy "Admins manage module questions"
  on public.academy_questions for all to authenticated
  using ((select private.get_my_role()) = 'admin')
  with check ((select private.get_my_role()) = 'admin');

create policy "Read assessments published or admin"
  on public.academy_assessments for select to authenticated
  using (is_published = true or (select private.get_my_role()) = 'admin');

create policy "Admins manage assessments"
  on public.academy_assessments for all to authenticated
  using ((select private.get_my_role()) = 'admin')
  with check ((select private.get_my_role()) = 'admin');

create policy "Read assessment questions when assessment published or admin"
  on public.academy_assessment_questions for select to authenticated
  using (
    exists (
      select 1 from public.academy_assessments a
      where a.id = assessment_id
        and (a.is_published = true or (select private.get_my_role()) = 'admin')
    )
  );

create policy "Admins manage assessment questions"
  on public.academy_assessment_questions for all to authenticated
  using ((select private.get_my_role()) = 'admin')
  with check ((select private.get_my_role()) = 'admin');

create policy "Users manage own progress"
  on public.academy_progress for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users read own attempts"
  on public.academy_assessment_attempts for select to authenticated
  using (user_id = auth.uid() or (select private.get_my_role()) = 'admin');

create policy "Users insert own attempts"
  on public.academy_assessment_attempts for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users read own certificates"
  on public.academy_certificates for select to authenticated
  using (user_id = auth.uid() or (select private.get_my_role()) = 'admin');

create policy "Public verify by certificate code"
  on public.academy_certificates for select to anon
  using (true);

create policy "Users issue own certificates via service"
  on public.academy_certificates for insert to authenticated
  with check (user_id = auth.uid());

create policy "Admins manage certificates"
  on public.academy_certificates for all to authenticated
  using ((select private.get_my_role()) = 'admin')
  with check ((select private.get_my_role()) = 'admin');

-- Seed levels
insert into public.academy_levels (order_index, title, subtitle, description, required_for_platform, badge_color)
values
  (1, 'Rosterly Certified', 'Level 1', 'Foundation training for brand ambassadors and event staff in Jamaica.', true, 'gold'),
  (2, 'Advanced Brand Ambassador', 'Level 2', 'Advanced techniques for premium activations and lead roles.', false, 'green'),
  (3, 'Master Promoter', 'Level 3', 'Elite certification for senior promoters and team leads.', false, 'blue');
