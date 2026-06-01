-- Question type for module quizzes (multiple choice vs true/false)

alter table public.academy_questions
  add column if not exists type text;

update public.academy_questions
set type = 'multiple_choice'
where type is null;

alter table public.academy_questions
  alter column type set default 'multiple_choice',
  alter column type set not null;

alter table public.academy_questions
  drop constraint if exists academy_questions_type_check;

alter table public.academy_questions
  add constraint academy_questions_type_check
  check (type in ('multiple_choice', 'true_false'));
