-- Re-seed academy content (works on fresh and existing databases)

-- Canonical level IDs
INSERT INTO public.academy_levels (id, order_index, title, subtitle, description, required_for_platform, badge_color)
VALUES ('a1000000-0000-0000-0000-000000000001', 1, 'Rosterly Certified', 'Level 1', 'Foundation training for brand ambassadors and event staff in Jamaica.', true, 'gold')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  required_for_platform = EXCLUDED.required_for_platform, badge_color = EXCLUDED.badge_color;

INSERT INTO public.academy_levels (id, order_index, title, subtitle, description, required_for_platform, badge_color)
VALUES ('a1000000-0000-0000-0000-000000000002', 2, 'Advanced Brand Ambassador', 'Level 2', 'Advanced techniques for premium activations and lead roles.', false, 'green')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  required_for_platform = EXCLUDED.required_for_platform, badge_color = EXCLUDED.badge_color;

INSERT INTO public.academy_levels (id, order_index, title, subtitle, description, required_for_platform, badge_color)
VALUES ('a1000000-0000-0000-0000-000000000003', 3, 'Master Promoter', 'Level 3', 'Elite certification for senior promoters and team leads.', false, 'blue')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  required_for_platform = EXCLUDED.required_for_platform, badge_color = EXCLUDED.badge_color;

-- Reconcile modules on legacy level rows
UPDATE public.academy_modules SET level_id = 'a1000000-0000-0000-0000-000000000001'::uuid
WHERE level_id IN (SELECT id FROM public.academy_levels WHERE order_index = 1 AND id <> 'a1000000-0000-0000-0000-000000000001'::uuid);
UPDATE public.academy_assessments SET level_id = 'a1000000-0000-0000-0000-000000000001'::uuid
WHERE level_id IN (SELECT id FROM public.academy_levels WHERE order_index = 1 AND id <> 'a1000000-0000-0000-0000-000000000001'::uuid);
DELETE FROM public.academy_levels WHERE order_index = 1 AND id <> 'a1000000-0000-0000-0000-000000000001'::uuid;
UPDATE public.academy_modules SET level_id = 'a1000000-0000-0000-0000-000000000002'::uuid
WHERE level_id IN (SELECT id FROM public.academy_levels WHERE order_index = 2 AND id <> 'a1000000-0000-0000-0000-000000000002'::uuid);
UPDATE public.academy_assessments SET level_id = 'a1000000-0000-0000-0000-000000000002'::uuid
WHERE level_id IN (SELECT id FROM public.academy_levels WHERE order_index = 2 AND id <> 'a1000000-0000-0000-0000-000000000002'::uuid);
DELETE FROM public.academy_levels WHERE order_index = 2 AND id <> 'a1000000-0000-0000-0000-000000000002'::uuid;
UPDATE public.academy_modules SET level_id = 'a1000000-0000-0000-0000-000000000003'::uuid
WHERE level_id IN (SELECT id FROM public.academy_levels WHERE order_index = 3 AND id <> 'a1000000-0000-0000-0000-000000000003'::uuid);
UPDATE public.academy_assessments SET level_id = 'a1000000-0000-0000-0000-000000000003'::uuid
WHERE level_id IN (SELECT id FROM public.academy_levels WHERE order_index = 3 AND id <> 'a1000000-0000-0000-0000-000000000003'::uuid);
DELETE FROM public.academy_levels WHERE order_index = 3 AND id <> 'a1000000-0000-0000-0000-000000000003'::uuid;

-- Drop legacy modules/assessments on canonical levels (random UUIDs from initial seed block canonical slots)
DELETE FROM public.academy_questions q
USING public.academy_modules m
WHERE q.module_id = m.id
  AND m.level_id IN (
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000003'::uuid
  )
  AND m.id::text !~ '^b1000000-0000-0000-0000-';

DELETE FROM public.academy_progress p
USING public.academy_modules m
WHERE p.module_id = m.id
  AND m.level_id IN (
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000003'::uuid
  )
  AND m.id::text !~ '^b1000000-0000-0000-0000-';

DELETE FROM public.academy_modules m
WHERE m.level_id IN (
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000003'::uuid
  )
  AND m.id::text !~ '^b1000000-0000-0000-0000-';

DELETE FROM public.academy_assessment_questions aq
USING public.academy_assessments a
WHERE aq.assessment_id = a.id
  AND a.level_id IN (
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000003'::uuid
  )
  AND a.id::text !~ '^c1000000-0000-0000-0000-';

DELETE FROM public.academy_assessment_attempts at
USING public.academy_assessments a
WHERE at.assessment_id = a.id
  AND a.level_id IN (
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000003'::uuid
  )
  AND a.id::text !~ '^c1000000-0000-0000-0000-';

DELETE FROM public.academy_assessments a
WHERE a.level_id IN (
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000003'::uuid
  )
  AND a.id::text !~ '^c1000000-0000-0000-0000-';

-- Modules
INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 1, 'What Is A Brand Ambassador?', 'Understand your role as the face of a brand.', true, true, $html$<h3>Customers Form Opinions In Seconds</h3>
<p>Before you say a word, customers notice your clothing, grooming, posture, and facial expressions. <strong>Professional appearance creates trust</strong> — and trust drives sales.</p>

<h3>Appearance Guidelines</h3>
<ul>
  <li>Arrive in clean, pressed clothing that follows the campaign dress code</li>
  <li>Maintain good personal hygiene at all times</li>
  <li>Avoid chewing gum during any customer interaction</li>
  <li>Keep your phone out of sight during working hours</li>
  <li>Wear name badges or branded materials as instructed</li>
</ul>

<h3>Why This Matters</h3>
<p>A promoter who looks professional is far more likely to be approached by customers. More approaches means more interactions. More interactions means more sales. Your appearance is the first step in the sales process.</p>

<h3>Scenario</h3>
<blockquote>You arrive and notice your shirt is wrinkled. What should you do? Discuss options with your supervisor immediately — never ignore a presentation issue and hope no one notices.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000001'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 1, 'Which topic is central to "What Is A Brand Ambassador?"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000002'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 2, 'What is the best professional habit related to What work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 2, 'Professional Appearance', 'Presentation standards for every activation.', true, true, $html$<h3>The Easiest Way To Lose Promotional Work Is Being Late</h3>
<p>Brands invest thousands of dollars in promotional campaigns. When a promoter arrives late, customers are missed, sales are lost, and the brand looks unprofessional to the retailer.</p>

<h3>Best Practices</h3>
<ul>
  <li>Aim to arrive <strong>15 minutes before</strong> every activation starts</li>
  <li>Confirm your transportation the night before — not the morning of</li>
  <li>Save your supervisor''s contact and call immediately if anything changes</li>
  <li>Plan for traffic, weather, and other delays in advance</li>
</ul>

<h3>If You Are Running Late</h3>
<p>Call — never text. A phone call shows urgency and respect. It allows your supervisor to adjust the plan. Showing up late without any notice is significantly worse than being late with communication.</p>

<blockquote>Your reputation for reliability is built one activation at a time. One late appearance can cost you future bookings.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000003'::uuid, 'b1000000-0000-0000-0000-000000000002'::uuid, 1, 'Which topic is central to "Professional Appearance"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000004'::uuid, 'b1000000-0000-0000-0000-000000000002'::uuid, 2, 'What is the best professional habit related to Professional work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000003'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 3, 'Punctuality And Reliability', 'Why being on time protects your reputation.', true, true, $html$<h3>People Buy From People They Like</h3>
<p>The quality of your customer interaction determines whether someone tries a product, buys it, and recommends it. Use the <strong>S.E.R.V.E method</strong> to deliver consistent, professional service every time.</p>

<h3>The S.E.R.V.E Method</h3>
<ul>
  <li><strong>S — Smile:</strong> Greet every customer with a genuine, warm smile before you say a word</li>
  <li><strong>E — Engage:</strong> Make eye contact, move toward the customer, and initiate the conversation</li>
  <li><strong>R — Respond:</strong> Listen carefully and answer every question fully and honestly</li>
  <li><strong>V — Value:</strong> Clearly communicate the specific benefit the product offers this customer</li>
  <li><strong>E — End Positively:</strong> Close every interaction warmly regardless of whether they buy</li>
</ul>

<h3>See The Difference</h3>
<table>
  <tr><td><strong>Poor approach</strong></td><td>"Want a sample?"</td></tr>
  <tr><td><strong>Professional approach</strong></td><td>"Good afternoon. We are introducing a new tropical fruit beverage today. Would you like to try it?"</td></tr>
</table>
<p>The difference is tone, context, and genuine engagement. One invites, the other pushes.</p>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000005'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 1, 'Which topic is central to "Punctuality And Reliability"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000006'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 2, 'What is the best professional habit related to Punctuality work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000004'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 4, 'Customer Service Fundamentals', 'The S.E.R.V.E method for customer interactions.', true, true, $html$<h3>Strong Communicators Win More Sales</h3>
<p>Your words are your primary tool. A strong communicator speaks clearly, listens carefully, avoids slang in professional settings, and remains respectful even with difficult customers.</p>

<h3>Common Customer Questions — Be Ready</h3>
<ul>
  <li>"How much does it cost?"</li>
  <li>"Where can I buy it after today?"</li>
  <li>"What makes it different from what I currently use?"</li>
  <li>"Is it available in other sizes or flavours?"</li>
</ul>
<p>Study the product brief until you can answer these questions immediately and confidently without hesitation.</p>

<h3>Active Listening</h3>
<p>Listening is as important as speaking. When a customer talks, stop forming your next sentence and actually hear them. What they say tells you exactly what to say next.</p>

<h3>Exercise</h3>
<blockquote>Record yourself giving a 30-second product introduction. Listen back and honestly assess: Was your tone confident? Did you clearly mention the key benefit? Would you buy from yourself?</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000007'::uuid, 'b1000000-0000-0000-0000-000000000004'::uuid, 1, 'Which topic is central to "Customer Service Fundamentals"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000008'::uuid, 'b1000000-0000-0000-0000-000000000004'::uuid, 2, 'What is the best professional habit related to Customer work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000005'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 5, 'Communication Skills', 'Speak clearly, listen actively, and close confidently.', true, true, $html$<h3>Your Reputation Is Your Biggest Asset</h3>
<p>In the promotions industry, word travels fast. Brands and agencies maintain detailed records of promoters. One ethical violation can permanently close doors that took years to open.</p>

<h3>Never Do The Following</h3>
<ul>
  <li>Falsify campaign reports or inflate any numbers</li>
  <li>Leave an activation early without explicit supervisor authorisation</li>
  <li>Argue with customers — even when they are unreasonable</li>
  <li>Share confidential campaign information with anyone outside the team</li>
  <li>Claim sales or leads that you did not personally generate</li>
</ul>

<h3>The Long-Term View</h3>
<p>Employers and brands remember reliable, ethical workers. Being known for integrity leads directly to repeat bookings, higher pay rates, and supervisor roles. The promoters who build long careers are the honest ones.</p>

<blockquote>One dishonest report can end a career. One ethical stand builds a reputation that lasts years.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000009'::uuid, 'b1000000-0000-0000-0000-000000000005'::uuid, 1, 'Which topic is central to "Communication Skills"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000010'::uuid, 'b1000000-0000-0000-0000-000000000005'::uuid, 2, 'What is the best professional habit related to Communication work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000006'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 6, 'Workplace Ethics', 'Integrity rules that protect your career.', true, true, $html$<h3>What Makes A Premium Activation Different</h3>
<p>Level 2 work takes place at flagship stores, launch events, and high-visibility locations. <strong>Brands pay more because expectations are higher.</strong> You are representing a premium product in a premium environment.</p>

<h3>Premium Standards</h3>
<ul>
  <li>Arrive fully briefed on product specs, pricing, and competitor positioning</li>
  <li>Maintain elevated presentation — posture, tone, and dress code are stricter</li>
  <li>Engage fewer customers more deeply rather than rushing many shallow interactions</li>
  <li>Capture quality feedback, not just volume</li>
</ul>

<h3>Your Mindset</h3>
<p>Think consultant, not sampler. Customers at premium activations expect expertise. You should sound like someone who genuinely uses and believes in the product.</p>

<blockquote>Premium activations are where careers accelerate. One excellent shift here is worth ten average supermarket shifts on your record.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000011'::uuid, 'b1000000-0000-0000-0000-000000000006'::uuid, 1, 'Which topic is central to "Workplace Ethics"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000012'::uuid, 'b1000000-0000-0000-0000-000000000006'::uuid, 2, 'What is the best professional habit related to Workplace work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000011'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 1, 'Understanding Premium Activations', 'Standards for flagship stores and launch events.', true, true, $html$<h3>What Makes A Premium Activation Different</h3>
<p>Level 2 work takes place at flagship stores, launch events, and high-visibility locations. <strong>Brands pay more because expectations are higher.</strong> You are representing a premium product in a premium environment.</p>

<h3>Premium Standards</h3>
<ul>
  <li>Arrive fully briefed on product specs, pricing, and competitor positioning</li>
  <li>Maintain elevated presentation — posture, tone, and dress code are stricter</li>
  <li>Engage fewer customers more deeply rather than rushing many shallow interactions</li>
  <li>Capture quality feedback, not just volume</li>
</ul>

<h3>Your Mindset</h3>
<p>Think consultant, not sampler. Customers at premium activations expect expertise. You should sound like someone who genuinely uses and believes in the product.</p>

<blockquote>Premium activations are where careers accelerate. One excellent shift here is worth ten average supermarket shifts on your record.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000013'::uuid, 'b1000000-0000-0000-0000-000000000011'::uuid, 1, 'Which topic is central to "Understanding Premium Activations"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000014'::uuid, 'b1000000-0000-0000-0000-000000000011'::uuid, 2, 'What is the best professional habit related to Understanding work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000012'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 2, 'Advanced Product Knowledge', 'Master specs, benefits, and demonstrations.', true, true, $html$<h3>Know The Product Better Than The Customer</h3>
<p>Advanced promoters can explain features, benefits, and comparisons without reading from a script. <strong>Product mastery builds instant credibility.</strong></p>

<h3>What To Master Before Every Shift</h3>
<ul>
  <li>Top three features and the single strongest benefit for this audience</li>
  <li>Price, pack sizes, and where to buy after the activation</li>
  <li>Two honest comparisons to leading competitors</li>
  <li>Common objections and your best responses</li>
</ul>

<h3>Demonstration Technique</h3>
<p>Show the product when possible. Let customers touch, smell, taste, or try it. A 30-second demonstration often closes faster than five minutes of talking.</p>

<blockquote>If you cannot explain why this product is worth the price in one sentence, you are not ready for the activation floor.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000015'::uuid, 'b1000000-0000-0000-0000-000000000012'::uuid, 1, 'Which topic is central to "Advanced Product Knowledge"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000016'::uuid, 'b1000000-0000-0000-0000-000000000012'::uuid, 2, 'What is the best professional habit related to Advanced work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000013'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 3, 'Handling Objections', 'Use the L.A.R.A framework with confidence.', true, true, $html$<h3>Objections Are Not Rejections</h3>
<p>When a customer pushes back, they are often asking for more information. <strong>Stay calm, acknowledge, and respond.</strong></p>

<h3>The L.A.R.A Framework</h3>
<ul>
  <li><strong>Listen:</strong> Let them finish without interrupting</li>
  <li><strong>Acknowledge:</strong> Show you heard them — "I understand the price feels high"</li>
  <li><strong>Respond:</strong> Address the specific concern with facts</li>
  <li><strong>Ask:</strong> Check if they are ready to move forward</li>
</ul>

<h3>Common Objections</h3>
<ul>
  <li>"It is too expensive" — reframe around value per use or savings</li>
  <li>"I already use another brand" — highlight one clear differentiator</li>
  <li>"I need to think about it" — offer a sample and a clear next step</li>
</ul>

<blockquote>Never argue. The moment you sound defensive, the customer stops listening.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000017'::uuid, 'b1000000-0000-0000-0000-000000000013'::uuid, 1, 'Which topic is central to "Handling Objections"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000018'::uuid, 'b1000000-0000-0000-0000-000000000013'::uuid, 2, 'What is the best professional habit related to Handling work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000014'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 4, 'Upselling Techniques', 'Recommend options that genuinely help customers.', true, true, $html$<h3>Upselling Is About Helping, Not Pushing</h3>
<p>Upselling means recommending the option that genuinely fits the customer better — often a larger size, bundle, or complementary product. <strong>Done well, it increases sales and customer satisfaction.</strong></p>

<h3>When To Upsell</h3>
<ul>
  <li>The customer already shows buying intent</li>
  <li>A larger pack or bundle clearly saves them money</li>
  <li>You can explain the extra benefit in one sentence</li>
</ul>

<h3>Phrases That Work</h3>
<ul>
  <li>"Most families this week are taking the two-pack because it works out cheaper per unit"</li>
  <li>"If you like this flavour, the variety pack lets you try all three before committing"</li>
</ul>

<blockquote>If the upsell does not genuinely help the customer, do not offer it. Your reputation matters more than one extra sale.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000019'::uuid, 'b1000000-0000-0000-0000-000000000014'::uuid, 1, 'Which topic is central to "Upselling Techniques"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000020'::uuid, 'b1000000-0000-0000-0000-000000000014'::uuid, 2, 'What is the best professional habit related to Upselling work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000015'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 5, 'Campaign Reporting', 'Accurate reporting that builds trust.', true, true, $html$<h3>Accurate Reporting Protects Everyone</h3>
<p>Campaign reports inform brand decisions and your future bookings. <strong>Inflated numbers help no one and destroy trust when discovered.</strong></p>

<h3>What To Record Accurately</h3>
<ul>
  <li>Customer interactions and samples distributed</li>
  <li>Units sold or leads captured (only what you personally generated)</li>
  <li>Notable customer feedback — positive and negative</li>
  <li>Stock issues, equipment problems, or incidents</li>
</ul>

<h3>End-Of-Shift Checklist</h3>
<ul>
  <li>Complete your report before leaving the location</li>
  <li>Match numbers to any retailer or supervisor records</li>
  <li>Flag anything unusual while it is still fresh in your memory</li>
</ul>

<blockquote>Supervisors remember promoters who report honestly. That memory turns into repeat bookings.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000021'::uuid, 'b1000000-0000-0000-0000-000000000015'::uuid, 1, 'Which topic is central to "Campaign Reporting"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000022'::uuid, 'b1000000-0000-0000-0000-000000000015'::uuid, 2, 'What is the best professional habit related to Campaign work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000016'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 6, 'Leading Your Team', 'On-site leadership for promotional teams.', true, true, $html$<h3>Leading On Site Starts With Example</h3>
<p>When you are the senior promoter on an activation, the team watches how you work. <strong>Your behaviour sets the standard.</strong></p>

<h3>Leadership Responsibilities</h3>
<ul>
  <li>Arrive first and confirm setup, stock, and branding</li>
  <li>Brief the team on goals, messaging, and roles for the day</li>
  <li>Rotate positions so everyone stays fresh and engaged</li>
  <li>Debrief at the end — what worked, what to improve</li>
</ul>

<h3>Handling A Struggling Teammate</h3>
<p>Coach privately, never embarrass publicly. Offer to role-play a difficult approach or pair them with a stronger promoter for an hour.</p>

<blockquote>Teams follow promoters who work hardest, not those who talk loudest.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000023'::uuid, 'b1000000-0000-0000-0000-000000000016'::uuid, 1, 'Which topic is central to "Leading Your Team"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000024'::uuid, 'b1000000-0000-0000-0000-000000000016'::uuid, 2, 'What is the best professional habit related to Leading work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000021'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid, 1, 'Building Your Reputation', 'How your track record becomes your CV.', true, true, $html$<h3>Reputation Opens Doors Before You Apply</h3>
<p>At master level, merchants and agencies book people they already trust. <strong>Your track record is your CV.</strong></p>

<h3>What Builds Reputation</h3>
<ul>
  <li>Perfect attendance and early arrival over many activations</li>
  <li>Consistently strong sales and feedback scores</li>
  <li>Professional communication with supervisors and clients</li>
  <li>Zero integrity issues — ever</li>
</ul>

<h3>Protecting Your Name</h3>
<p>One public complaint, one falsified report, or one no-show without notice can undo years of work. Treat every shift as an interview for the next one.</p>

<blockquote>The best promoters in Jamaica are known by name. That starts with how you work today.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000025'::uuid, 'b1000000-0000-0000-0000-000000000021'::uuid, 1, 'Which topic is central to "Building Your Reputation"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000026'::uuid, 'b1000000-0000-0000-0000-000000000021'::uuid, 2, 'What is the best professional habit related to Building work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000022'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid, 2, 'Training New Promoters', 'Coach others effectively on activations.', true, true, $html$<h3>Teaching Others Multiplies Your Value</h3>
<p>Brands pay a premium for promoters who can onboard and coach new staff on site. <strong>Clear teaching is a leadership skill.</strong></p>

<h3>How To Train Effectively</h3>
<ul>
  <li>Demonstrate once, then let them practise while you observe</li>
  <li>Give specific feedback — not "do better" but "pause after the benefit statement"</li>
  <li>Check understanding with a practice question before going live</li>
</ul>

<h3>Common Training Mistakes</h3>
<ul>
  <li>Overloading new promoters with every detail at once</li>
  <li>Correcting them harshly in front of customers</li>
  <li>Leaving them alone before they are confident</li>
</ul>

<blockquote>A promoter who makes their team better is irreplaceable on large campaigns.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000027'::uuid, 'b1000000-0000-0000-0000-000000000022'::uuid, 1, 'Which topic is central to "Training New Promoters"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000028'::uuid, 'b1000000-0000-0000-0000-000000000022'::uuid, 2, 'What is the best professional habit related to Training work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000023'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid, 3, 'Crisis Management', 'Stay calm when things go wrong.', true, true, $html$<h3>Stay Calm When Things Go Wrong</h3>
<p>Stock runs out, weather shifts, equipment fails, or a customer becomes aggressive. <strong>Crisis management is about speed, calm, and communication.</strong></p>

<h3>Immediate Steps</h3>
<ul>
  <li>Ensure everyone is safe — move away from danger first</li>
  <li>Call your supervisor before posting anything on social media</li>
  <li>Document what happened factually for the report</li>
</ul>

<h3>Difficult Customers</h3>
<p>Lower your voice, increase personal space, and offer to fetch a supervisor. Never match aggression with aggression.</p>

<blockquote>Brands judge promoters on how they handle bad moments, not perfect ones.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000029'::uuid, 'b1000000-0000-0000-0000-000000000023'::uuid, 1, 'Which topic is central to "Crisis Management"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000030'::uuid, 'b1000000-0000-0000-0000-000000000023'::uuid, 2, 'What is the best professional habit related to Crisis work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000024'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid, 4, 'Strategic Campaign Thinking', 'Think like the brand manager.', true, true, $html$<h3>Think Like The Brand Manager</h3>
<p>Master promoters understand why the campaign exists and what success looks like beyond today''s sales. <strong>Strategy turns you from worker to partner.</strong></p>

<h3>Before The Campaign</h3>
<ul>
  <li>Read the full brief — target customer, key message, KPIs</li>
  <li>Identify peak traffic windows and plan staffing accordingly</li>
  <li>Prepare backup talking points if the primary offer changes</li>
</ul>

<h3>During The Campaign</h3>
<p>Watch patterns. If one approach consistently wins, share it with the team within the hour, not only at the end of the week.</p>

<blockquote>Supervisors promote promoters who make the whole campaign smarter, not just their own shift busier.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000031'::uuid, 'b1000000-0000-0000-0000-000000000024'::uuid, 1, 'Which topic is central to "Strategic Campaign Thinking"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000032'::uuid, 'b1000000-0000-0000-0000-000000000024'::uuid, 2, 'What is the best professional habit related to Strategic work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000025'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid, 5, 'Working With Difficult Clients', 'Professional distance under pressure.', true, true, $html$<h3>Difficult Clients Require Professional Distance</h3>
<p>Retail managers, brand reps, and agency staff can all pressure you. <strong>Stay respectful, stay factual, escalate when needed.</strong></p>

<h3>When Pressure Increases</h3>
<ul>
  <li>Repeat back what they are asking so misunderstandings surface early</li>
  <li>If a request violates safety or ethics, decline calmly and notify your agency</li>
  <li>Never agree to misreport numbers to make someone look good</li>
</ul>

<h3>Recovery</h3>
<p>After a tense interaction, reset with the team. Do not let one difficult person poison the rest of the shift.</p>

<blockquote>Your agency is your advocate. Use them when client demands cross the line.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000033'::uuid, 'b1000000-0000-0000-0000-000000000025'::uuid, 1, 'Which topic is central to "Working With Difficult Clients"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000034'::uuid, 'b1000000-0000-0000-0000-000000000025'::uuid, 2, 'What is the best professional habit related to Working work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000026'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid, 6, 'High-Volume Events', 'Systems for festivals and roadshows.', true, true, $html$<h3>High-Traffic Events Reward Preparation</h3>
<p>Festivals, mall launches, and roadshows move fast. <strong>Systems beat enthusiasm when the crowd is large.</strong></p>

<h3>Throughput Tactics</h3>
<ul>
  <li>Pre-cut samples and stage stock so nothing is fumbled mid-conversation</li>
  <li>Use a short opener — ten words or fewer — to qualify interest quickly</li>
  <li>Station one person for demos and one for closing if the team size allows</li>
</ul>

<h3>Energy Management</h3>
<p>Take micro-breaks, hydrate, and rotate roles every 90 minutes. Burnout shows on your face before you feel it in your body.</p>

<blockquote>The promoters who thrive at Sumfest-scale events are the ones who prepared the table before the first customer arrived.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000035'::uuid, 'b1000000-0000-0000-0000-000000000026'::uuid, 1, 'Which topic is central to "High-Volume Events"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000036'::uuid, 'b1000000-0000-0000-0000-000000000026'::uuid, 2, 'What is the best professional habit related to High-Volume work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_modules (id, level_id, order_index, title, description, has_quiz, is_published, content_html)
VALUES ('b1000000-0000-0000-0000-000000000027'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid, 7, 'Team Lead Certification', 'Coordinate people, not just sell product.', true, true, $html$<h3>Team Lead Is A Role, Not A Title</h3>
<p>Earning master certification means you are ready to coordinate people, not just sell product. <strong>Leadership is service to the team and the brand.</strong></p>

<h3>What Team Leads Do Differently</h3>
<ul>
  <li>Own communication with the client and supervisor all day</li>
  <li>Resolve conflicts between promoters before they escalate</li>
  <li>Deliver accurate end-of-day reports that tell the true story</li>
  <li>Develop junior promoters who will be booked again</li>
</ul>

<h3>Your Next Step</h3>
<p>Complete every module, pass the final assessment, and carry this standard into every activation. Merchants notice certified master promoters — and they book them first.</p>

<blockquote>Master promoters do not chase gigs. Gigs find them because the industry already knows their name.</blockquote>$html$)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, order_index = EXCLUDED.order_index, title = EXCLUDED.title,
  description = EXCLUDED.description, has_quiz = EXCLUDED.has_quiz, is_published = EXCLUDED.is_published,
  content_html = EXCLUDED.content_html;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000037'::uuid, 'b1000000-0000-0000-0000-000000000027'::uuid, 1, 'Which topic is central to "Team Lead Certification"?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'A', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_questions (id, module_id, order_index, question, type, options, correct_answer, explanation)
VALUES ('d1000000-0000-0000-0000-000000000038'::uuid, 'b1000000-0000-0000-0000-000000000027'::uuid, 2, 'What is the best professional habit related to Team work?', 'multiple_choice', '["A", "B", "C", "D"]'::jsonb, 'B', 'Review the lesson content.')
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  type = EXCLUDED.type, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

-- Assessments
INSERT INTO public.academy_assessments (id, level_id, title, pass_mark, time_limit_minutes, is_published)
VALUES ('c1000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 'Rosterly Certified Final Assessment', 80, 45, true)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, title = EXCLUDED.title, pass_mark = EXCLUDED.pass_mark,
  time_limit_minutes = EXCLUDED.time_limit_minutes, is_published = EXCLUDED.is_published;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000101'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 1, '[Rosterly Certified] Assessment question 1: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000102'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 2, '[Rosterly Certified] Assessment question 2: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000103'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 3, '[Rosterly Certified] Assessment question 3: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000104'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 4, '[Rosterly Certified] Assessment question 4: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000105'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 5, '[Rosterly Certified] Assessment question 5: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000106'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 6, '[Rosterly Certified] Assessment question 6: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000107'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 7, '[Rosterly Certified] Assessment question 7: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000108'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 8, '[Rosterly Certified] Assessment question 8: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000109'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 9, '[Rosterly Certified] Assessment question 9: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000110'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 10, '[Rosterly Certified] Assessment question 10: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000111'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 11, '[Rosterly Certified] Assessment question 11: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000112'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 12, '[Rosterly Certified] Assessment question 12: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000113'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 13, '[Rosterly Certified] Assessment question 13: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000114'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 14, '[Rosterly Certified] Assessment question 14: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000115'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 15, '[Rosterly Certified] Assessment question 15: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000116'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 16, '[Rosterly Certified] Assessment question 16: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000117'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 17, '[Rosterly Certified] Assessment question 17: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000118'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 18, '[Rosterly Certified] Assessment question 18: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000119'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 19, '[Rosterly Certified] Assessment question 19: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000120'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 20, '[Rosterly Certified] Assessment question 20: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000121'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 21, '[Rosterly Certified] Assessment question 21: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000122'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 22, '[Rosterly Certified] Assessment question 22: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000123'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 23, '[Rosterly Certified] Assessment question 23: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000124'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 24, '[Rosterly Certified] Assessment question 24: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000125'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 25, '[Rosterly Certified] Assessment question 25: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessments (id, level_id, title, pass_mark, time_limit_minutes, is_published)
VALUES ('c1000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 'Advanced Brand Ambassador Final Assessment', 80, 45, true)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, title = EXCLUDED.title, pass_mark = EXCLUDED.pass_mark,
  time_limit_minutes = EXCLUDED.time_limit_minutes, is_published = EXCLUDED.is_published;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000201'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 1, '[Advanced Brand Ambassador] Assessment question 1: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000202'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 2, '[Advanced Brand Ambassador] Assessment question 2: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000203'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 3, '[Advanced Brand Ambassador] Assessment question 3: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000204'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 4, '[Advanced Brand Ambassador] Assessment question 4: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000205'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 5, '[Advanced Brand Ambassador] Assessment question 5: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000206'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 6, '[Advanced Brand Ambassador] Assessment question 6: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000207'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 7, '[Advanced Brand Ambassador] Assessment question 7: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000208'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 8, '[Advanced Brand Ambassador] Assessment question 8: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000209'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 9, '[Advanced Brand Ambassador] Assessment question 9: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000210'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 10, '[Advanced Brand Ambassador] Assessment question 10: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000211'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 11, '[Advanced Brand Ambassador] Assessment question 11: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000212'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 12, '[Advanced Brand Ambassador] Assessment question 12: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000213'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 13, '[Advanced Brand Ambassador] Assessment question 13: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000214'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 14, '[Advanced Brand Ambassador] Assessment question 14: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000215'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 15, '[Advanced Brand Ambassador] Assessment question 15: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000216'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 16, '[Advanced Brand Ambassador] Assessment question 16: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000217'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 17, '[Advanced Brand Ambassador] Assessment question 17: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000218'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 18, '[Advanced Brand Ambassador] Assessment question 18: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000219'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 19, '[Advanced Brand Ambassador] Assessment question 19: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000220'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 20, '[Advanced Brand Ambassador] Assessment question 20: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000221'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 21, '[Advanced Brand Ambassador] Assessment question 21: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000222'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 22, '[Advanced Brand Ambassador] Assessment question 22: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000223'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 23, '[Advanced Brand Ambassador] Assessment question 23: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000224'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 24, '[Advanced Brand Ambassador] Assessment question 24: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000225'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 25, '[Advanced Brand Ambassador] Assessment question 25: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessments (id, level_id, title, pass_mark, time_limit_minutes, is_published)
VALUES ('c1000000-0000-0000-0000-000000000003'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid, 'Master Promoter Final Assessment', 80, 45, true)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, title = EXCLUDED.title, pass_mark = EXCLUDED.pass_mark,
  time_limit_minutes = EXCLUDED.time_limit_minutes, is_published = EXCLUDED.is_published;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000301'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 1, '[Master Promoter] Assessment question 1: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000302'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 2, '[Master Promoter] Assessment question 2: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000303'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 3, '[Master Promoter] Assessment question 3: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000304'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 4, '[Master Promoter] Assessment question 4: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000305'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 5, '[Master Promoter] Assessment question 5: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000306'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 6, '[Master Promoter] Assessment question 6: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000307'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 7, '[Master Promoter] Assessment question 7: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000308'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 8, '[Master Promoter] Assessment question 8: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000309'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 9, '[Master Promoter] Assessment question 9: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000310'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 10, '[Master Promoter] Assessment question 10: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000311'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 11, '[Master Promoter] Assessment question 11: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000312'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 12, '[Master Promoter] Assessment question 12: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000313'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 13, '[Master Promoter] Assessment question 13: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000314'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 14, '[Master Promoter] Assessment question 14: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000315'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 15, '[Master Promoter] Assessment question 15: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000316'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 16, '[Master Promoter] Assessment question 16: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000317'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 17, '[Master Promoter] Assessment question 17: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000318'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 18, '[Master Promoter] Assessment question 18: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000319'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 19, '[Master Promoter] Assessment question 19: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000320'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 20, '[Master Promoter] Assessment question 20: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000321'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 21, '[Master Promoter] Assessment question 21: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000322'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 22, '[Master Promoter] Assessment question 22: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000323'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 23, '[Master Promoter] Assessment question 23: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000324'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 24, '[Master Promoter] Assessment question 24: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

INSERT INTO public.academy_assessment_questions (id, assessment_id, order_index, question, options, correct_answer, explanation)
VALUES ('e1000000-0000-0000-0000-000000000325'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 25, '[Master Promoter] Assessment question 25: What is the most professional choice?', '["Follow campaign standards and communicate clearly", "Ignore the brief and improvise", "Leave early without telling anyone", "Argue with customers who disagree"]'::jsonb, 'Follow campaign standards and communicate clearly', 'Professional conduct protects your reputation and the brand.')
ON CONFLICT (id) DO UPDATE SET
  assessment_id = EXCLUDED.assessment_id, order_index = EXCLUDED.order_index, question = EXCLUDED.question,
  options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation;

