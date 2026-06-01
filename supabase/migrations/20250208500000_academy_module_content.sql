-- Academy module lesson HTML: structured headings, lists, blockquotes
-- Updates by title (Level 1) and by level + order_index (all levels)

-- ─── Level 1 ───────────────────────────────────────────────────────────────

UPDATE public.academy_modules
SET content_html = $html$
<h3>Your Role Goes Beyond Handing Out Samples</h3>
<p>Imagine you are standing in a supermarket promoting a new energy drink. Most people think your job is simply to hand out samples. It is not. <strong>You are the face of the brand.</strong> Every interaction a customer has with you shapes their opinion of the company.</p>

<h3>A Brand Ambassador''s Role Is To</h3>
<ul>
  <li>Represent the brand professionally</li>
  <li>Educate customers</li>
  <li>Generate interest</li>
  <li>Encourage sales</li>
  <li>Collect feedback</li>
</ul>
<p>Whether promoting a phone, a drink, a bank account or a new service, your job is to create a positive experience.</p>
<blockquote>Customers may forget the product. They rarely forget how they were treated.</blockquote>

<h3>Key Takeaways</h3>
<ul>
  <li>You represent the brand — not just yourself</li>
  <li>Professionalism matters in every single interaction</li>
  <li>Every customer interaction counts toward the campaign result</li>
</ul>
$html$
WHERE title = 'What Is A Brand Ambassador?';

UPDATE public.academy_modules
SET content_html = $html$
<h3>Customers Form Opinions In Seconds</h3>
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
<blockquote>You arrive and notice your shirt is wrinkled. What should you do? Discuss options with your supervisor immediately — never ignore a presentation issue and hope no one notices.</blockquote>
$html$
WHERE title = 'Professional Appearance';

UPDATE public.academy_modules
SET content_html = $html$
<h3>The Easiest Way To Lose Promotional Work Is Being Late</h3>
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

<blockquote>Your reputation for reliability is built one activation at a time. One late appearance can cost you future bookings.</blockquote>
$html$
WHERE title = 'Punctuality And Reliability';

UPDATE public.academy_modules
SET content_html = $html$
<h3>People Buy From People They Like</h3>
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
<p>The difference is tone, context, and genuine engagement. One invites, the other pushes.</p>
$html$
WHERE title = 'Customer Service Fundamentals';

UPDATE public.academy_modules
SET content_html = $html$
<h3>Strong Communicators Win More Sales</h3>
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
<blockquote>Record yourself giving a 30-second product introduction. Listen back and honestly assess: Was your tone confident? Did you clearly mention the key benefit? Would you buy from yourself?</blockquote>
$html$
WHERE title = 'Communication Skills';

UPDATE public.academy_modules
SET content_html = $html$
<h3>Your Reputation Is Your Biggest Asset</h3>
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

<blockquote>One dishonest report can end a career. One ethical stand builds a reputation that lasts years.</blockquote>
$html$
WHERE title = 'Workplace Ethics';

-- ─── Level 2 (by order_index) ──────────────────────────────────────────────

UPDATE public.academy_modules m
SET content_html = $html$
<h3>What Makes A Premium Activation Different</h3>
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

<blockquote>Premium activations are where careers accelerate. One excellent shift here is worth ten average supermarket shifts on your record.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 2 AND m.order_index = 1;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Know The Product Better Than The Customer</h3>
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

<blockquote>If you cannot explain why this product is worth the price in one sentence, you are not ready for the activation floor.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 2 AND m.order_index = 2;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Objections Are Not Rejections</h3>
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

<blockquote>Never argue. The moment you sound defensive, the customer stops listening.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 2 AND m.order_index = 3;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Upselling Is About Helping, Not Pushing</h3>
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

<blockquote>If the upsell does not genuinely help the customer, do not offer it. Your reputation matters more than one extra sale.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 2 AND m.order_index = 4;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Accurate Reporting Protects Everyone</h3>
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

<blockquote>Supervisors remember promoters who report honestly. That memory turns into repeat bookings.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 2 AND m.order_index = 5;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Leading On Site Starts With Example</h3>
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

<blockquote>Teams follow promoters who work hardest, not those who talk loudest.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 2 AND m.order_index = 6;

-- ─── Level 3 (by order_index) ──────────────────────────────────────────────

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Reputation Opens Doors Before You Apply</h3>
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

<blockquote>The best promoters in Jamaica are known by name. That starts with how you work today.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 3 AND m.order_index = 1;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Teaching Others Multiplies Your Value</h3>
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

<blockquote>A promoter who makes their team better is irreplaceable on large campaigns.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 3 AND m.order_index = 2;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Stay Calm When Things Go Wrong</h3>
<p>Stock runs out, weather shifts, equipment fails, or a customer becomes aggressive. <strong>Crisis management is about speed, calm, and communication.</strong></p>

<h3>Immediate Steps</h3>
<ul>
  <li>Ensure everyone is safe — move away from danger first</li>
  <li>Call your supervisor before posting anything on social media</li>
  <li>Document what happened factually for the report</li>
</ul>

<h3>Difficult Customers</h3>
<p>Lower your voice, increase personal space, and offer to fetch a supervisor. Never match aggression with aggression.</p>

<blockquote>Brands judge promoters on how they handle bad moments, not perfect ones.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 3 AND m.order_index = 3;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Think Like The Brand Manager</h3>
<p>Master promoters understand why the campaign exists and what success looks like beyond today''s sales. <strong>Strategy turns you from worker to partner.</strong></p>

<h3>Before The Campaign</h3>
<ul>
  <li>Read the full brief — target customer, key message, KPIs</li>
  <li>Identify peak traffic windows and plan staffing accordingly</li>
  <li>Prepare backup talking points if the primary offer changes</li>
</ul>

<h3>During The Campaign</h3>
<p>Watch patterns. If one approach consistently wins, share it with the team within the hour, not only at the end of the week.</p>

<blockquote>Supervisors promote promoters who make the whole campaign smarter, not just their own shift busier.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 3 AND m.order_index = 4;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Difficult Clients Require Professional Distance</h3>
<p>Retail managers, brand reps, and agency staff can all pressure you. <strong>Stay respectful, stay factual, escalate when needed.</strong></p>

<h3>When Pressure Increases</h3>
<ul>
  <li>Repeat back what they are asking so misunderstandings surface early</li>
  <li>If a request violates safety or ethics, decline calmly and notify your agency</li>
  <li>Never agree to misreport numbers to make someone look good</li>
</ul>

<h3>Recovery</h3>
<p>After a tense interaction, reset with the team. Do not let one difficult person poison the rest of the shift.</p>

<blockquote>Your agency is your advocate. Use them when client demands cross the line.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 3 AND m.order_index = 5;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>High-Traffic Events Reward Preparation</h3>
<p>Festivals, mall launches, and roadshows move fast. <strong>Systems beat enthusiasm when the crowd is large.</strong></p>

<h3>Throughput Tactics</h3>
<ul>
  <li>Pre-cut samples and stage stock so nothing is fumbled mid-conversation</li>
  <li>Use a short opener — ten words or fewer — to qualify interest quickly</li>
  <li>Station one person for demos and one for closing if the team size allows</li>
</ul>

<h3>Energy Management</h3>
<p>Take micro-breaks, hydrate, and rotate roles every 90 minutes. Burnout shows on your face before you feel it in your body.</p>

<blockquote>The promoters who thrive at Sumfest-scale events are the ones who prepared the table before the first customer arrived.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 3 AND m.order_index = 6;

UPDATE public.academy_modules m
SET content_html = $html$
<h3>Team Lead Is A Role, Not A Title</h3>
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

<blockquote>Master promoters do not chase gigs. Gigs find them because the industry already knows their name.</blockquote>
$html$
FROM public.academy_levels l
WHERE m.level_id = l.id AND l.order_index = 3 AND m.order_index = 7;
