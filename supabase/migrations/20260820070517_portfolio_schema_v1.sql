/*
# KHOUV CHVEA Portfolio CMS Schema (fixed)

Creates the full data model for a dynamic personal portfolio CMS.
Uses text PKs for skill_categories and tools so seed IDs are stable.
*/

-- ============ SITE SETTINGS ============
CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_title text NOT NULL DEFAULT 'KHOUV CHVEA',
  logo_text text NOT NULL DEFAULT 'KHOUV CHVEA',
  favicon_url text DEFAULT '',
  meta_description text NOT NULL DEFAULT 'Portfolio of Khouv Chvea - IT student and web developer.',
  primary_color text NOT NULL DEFAULT '#3b82f6',
  secondary_color text NOT NULL DEFAULT '#a855f7',
  default_language text NOT NULL DEFAULT 'en',
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message_en text NOT NULL DEFAULT 'This site is under maintenance. Please check back soon.',
  maintenance_message_km text NOT NULL DEFAULT 'តំបន់បណ្តាញនេះកំពុងដំណើរការជួសជុល។ សូមចូលមើលម្តងទៀតនៅពេលក្រោយ។',
  email text NOT NULL DEFAULT 'khouvchvea123@gmail.com',
  location text NOT NULL DEFAULT 'Phnom Penh, Cambodia',
  github_url text NOT NULL DEFAULT 'https://github.com/0978114331',
  telegram_url text NOT NULL DEFAULT 'https://t.me/KhouvChvea',
  footer_text text NOT NULL DEFAULT '© 2026 KHOUV Chvea. All rights reserved.',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_site_settings" ON site_settings;
CREATE POLICY "anon_read_site_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_site_settings" ON site_settings;
CREATE POLICY "auth_update_site_settings" ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_insert_site_settings" ON site_settings;
CREATE POLICY "auth_insert_site_settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (true);

-- ============ HERO ============
CREATE TABLE IF NOT EXISTS hero (
  id integer PRIMARY KEY DEFAULT 1,
  name_en text NOT NULL DEFAULT 'Khouv Chvea',
  name_km text NOT NULL DEFAULT 'KHOUV CHVEA',
  description_en text NOT NULL DEFAULT 'An Information Technology student and active community volunteer building foundational knowledge in web development and interactive digital experiences.',
  description_km text NOT NULL DEFAULT 'និស្សិព័ត៌មានវិទ្យាសាស្ត្រ និងស្ម័គ្រចិត្តសហគមន៍ ដែលកសាងចំណេះដឹងមូលដ្ឋានក្នុងការអភិវឌ្ឍវេបសាយ និងបទពិសោធន៍ឌីជីថលអាំងតាក់ទីវ។',
  typing_phrases jsonb NOT NULL DEFAULT '["School Management System","Modern Frameworks","Interactive UI/UX","Innovative Solutions"]'::jsonb,
  profile_image_url text NOT NULL DEFAULT 'https://i.ibb.co/nT4c1y6/251a49d8-4109-41f1-991d-4a729169c892.png',
  status_badge_en text NOT NULL DEFAULT 'Open for opportunities',
  status_badge_km text NOT NULL DEFAULT 'ព្រឺទទួលយកឱកាស',
  primary_btn_en text NOT NULL DEFAULT 'Explore Work',
  primary_btn_url text NOT NULL DEFAULT '#projects',
  secondary_btn_en text NOT NULL DEFAULT 'Let''s Talk',
  secondary_btn_url text NOT NULL DEFAULT '#contact',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_hero" ON hero;
CREATE POLICY "anon_read_hero" ON hero FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_hero" ON hero;
CREATE POLICY "auth_update_hero" ON hero FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_insert_hero" ON hero;
CREATE POLICY "auth_insert_hero" ON hero FOR INSERT TO authenticated WITH CHECK (true);

-- ============ ABOUT ============
CREATE TABLE IF NOT EXISTS about (
  id integer PRIMARY KEY DEFAULT 1,
  title_en text NOT NULL DEFAULT 'The Story Behind The Code',
  title_km text NOT NULL DEFAULT 'រឿងរ៉ានៅពីក្រោយកូដ',
  heading_en text NOT NULL DEFAULT 'I am an Information Technology student and NGO-focused volunteer building foundational knowledge in modern UI templates and smooth interactive experiences.',
  paragraph1_en text NOT NULL DEFAULT 'With a deep focus on details and aesthetics, I construct websites that are fast, accessible, and delight users. I believe coding is not just about typing syntax, but an art form that merges design aesthetics with logic.',
  paragraph2_en text NOT NULL DEFAULT 'Whether designing standard web layouts or fully customized dashboards, I push the limits of grid systems, responsive frameworks, and scroll-triggered animations to deliver exceptional outcomes.',
  years_learning text NOT NULL DEFAULT '2+',
  projects_completed text NOT NULL DEFAULT '12+',
  feature_cards jsonb NOT NULL DEFAULT '[{"icon":"file-pdf","title_en":"File Converter Tool","desc_en":"Convert PDF to Image (JPG/PNG) or Image to PDF seamlessly."},{"icon":"language","title_en":"Image OCR Tool","desc_en":"Extract text from images automatically. Supports English and Khmer."}]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE about ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_about" ON about;
CREATE POLICY "anon_read_about" ON about FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_about" ON about;
CREATE POLICY "auth_update_about" ON about FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_insert_about" ON about;
CREATE POLICY "auth_insert_about" ON about FOR INSERT TO authenticated WITH CHECK (true);

-- ============ SKILL CATEGORIES (text PK) ============
CREATE TABLE IF NOT EXISTS skill_categories (
  id text PRIMARY KEY,
  title_en text NOT NULL,
  title_km text,
  icon text NOT NULL DEFAULT 'laptop-code',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_skill_categories" ON skill_categories;
CREATE POLICY "anon_read_skill_categories" ON skill_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_skill_categories" ON skill_categories;
CREATE POLICY "auth_write_skill_categories" ON skill_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ SKILLS ============
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text REFERENCES skill_categories(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_km text,
  percentage integer NOT NULL DEFAULT 80,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_skills" ON skills;
CREATE POLICY "anon_read_skills" ON skills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_skills" ON skills;
CREATE POLICY "auth_write_skills" ON skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ PROJECTS ============
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_km text,
  description_en text NOT NULL,
  description_km text,
  category text NOT NULL DEFAULT 'frontend',
  category_label_en text NOT NULL DEFAULT 'Frontend System',
  tags text NOT NULL DEFAULT '',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  project_url text NOT NULL DEFAULT '#',
  github_url text NOT NULL DEFAULT '#',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_projects" ON projects;
CREATE POLICY "anon_read_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_projects" ON projects;
CREATE POLICY "auth_write_projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ DOCUMENTS ============
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_km text,
  description_en text NOT NULL,
  description_km text,
  category_en text NOT NULL DEFAULT '',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  date_label text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_documents" ON documents;
CREATE POLICY "anon_read_documents" ON documents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_documents" ON documents;
CREATE POLICY "auth_write_documents" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ TOOLS ============
CREATE TABLE IF NOT EXISTS tools (
  id text PRIMARY KEY,
  name_en text NOT NULL,
  name_km text,
  description_en text NOT NULL,
  description_km text,
  icon text NOT NULL DEFAULT 'file-pdf',
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_tools" ON tools;
CREATE POLICY "anon_read_tools" ON tools FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_tools" ON tools;
CREATE POLICY "auth_write_tools" ON tools FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ CHAT SETTINGS ============
CREATE TABLE IF NOT EXISTS chat_settings (
  id integer PRIMARY KEY DEFAULT 1,
  enabled boolean NOT NULL DEFAULT true,
  bot_name_en text NOT NULL DEFAULT 'Assistant Bot',
  bot_name_km text NOT NULL DEFAULT 'បូតជំនួយការ',
  welcome_en text NOT NULL DEFAULT 'Hello! I am Khouv Chvea assistant. What would you like to know?',
  welcome_km text NOT NULL DEFAULT 'សួស្តី! ខ្ញុំគឺជាជំនួយការរបស់ Khouv Chvea។ តើអ្នកមានសំណួរអ្វីចង់សួរខ្ញុំ?',
  suggested_questions jsonb NOT NULL DEFAULT '["Who is Khouv Chvea?","What are his skills?","What projects has he built?","What tools are available?","How can I contact him?"]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_chat_settings" ON chat_settings;
CREATE POLICY "anon_read_chat_settings" ON chat_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_chat_settings" ON chat_settings;
CREATE POLICY "auth_update_chat_settings" ON chat_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============ CONTACT MESSAGES ============
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_contact_messages" ON contact_messages;
CREATE POLICY "auth_read_contact_messages" ON contact_messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_contact_messages" ON contact_messages;
CREATE POLICY "auth_update_contact_messages" ON contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_contact_messages" ON contact_messages;
CREATE POLICY "auth_delete_contact_messages" ON contact_messages FOR DELETE TO authenticated USING (true);

-- ============ STATS ============
CREATE TABLE IF NOT EXISTS stats (
  item_id text PRIMARY KEY,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0
);

ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_stats" ON stats;
CREATE POLICY "anon_read_stats" ON stats FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_stats" ON stats;
CREATE POLICY "auth_write_stats" ON stats FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ VISITOR STATS ============
CREATE TABLE IF NOT EXISTS visitor_stats (
  id integer PRIMARY KEY DEFAULT 1,
  total_visits integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_visitor_stats" ON visitor_stats;
CREATE POLICY "anon_read_visitor_stats" ON visitor_stats FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_visitor_stats" ON visitor_stats;
CREATE POLICY "auth_write_visitor_stats" ON visitor_stats FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ ACTIVITY LOGS ============
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_read_activity_logs" ON activity_logs;
CREATE POLICY "auth_read_activity_logs" ON activity_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_activity_logs" ON activity_logs;
CREATE POLICY "auth_insert_activity_logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============ RPCs ============
CREATE OR REPLACE FUNCTION increment_visitor()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO visitor_stats (id, total_visits) VALUES (1, 1)
  ON CONFLICT (id) DO UPDATE SET total_visits = visitor_stats.total_visits + 1, updated_at = now();
$$;
GRANT EXECUTE ON FUNCTION increment_visitor() TO anon, authenticated;

CREATE OR REPLACE FUNCTION increment_stat(p_item_id text, p_field text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_field = 'views' THEN
    INSERT INTO stats (item_id, views) VALUES (p_item_id, 1)
    ON CONFLICT (item_id) DO UPDATE SET views = stats.views + 1;
  ELSIF p_field = 'likes' THEN
    INSERT INTO stats (item_id, likes) VALUES (p_item_id, 1)
    ON CONFLICT (item_id) DO UPDATE SET likes = stats.likes + 1;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION increment_stat(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION toggle_like(p_item_id text, p_increment boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_increment THEN
    INSERT INTO stats (item_id, likes) VALUES (p_item_id, 1)
    ON CONFLICT (item_id) DO UPDATE SET likes = stats.likes + 1;
  ELSE
    UPDATE stats SET likes = GREATEST(0, likes - 1) WHERE item_id = p_item_id;
    INSERT INTO stats (item_id, likes) VALUES (p_item_id, 0)
    ON CONFLICT (item_id) DO NOTHING;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION toggle_like(text, boolean) TO anon, authenticated;

CREATE OR REPLACE FUNCTION log_activity(p_action text, p_details text)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO activity_logs (action, details) VALUES (p_action, p_details);
$$;
GRANT EXECUTE ON FUNCTION log_activity(text, text) TO authenticated;

-- ============ SEED ============
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO hero (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO about (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO chat_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO visitor_stats (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO tools (id, name_en, name_km, description_en, description_km, icon, enabled, sort_order) VALUES
  ('converter', 'File Converter Tool', 'ឧបករណ៍បម្លែងរូបភាព', 'Convert PDF to Image (JPG/PNG) or Image to PDF seamlessly.', 'បម្លែង PDF ទៅជារូបភាព (JPG/PNG) ឬ រូបភាពទៅជា PDF ដោយរលូន។', 'file-pdf', true, 1),
  ('ocr', 'Image OCR Tool', 'ឧបករណ៍ OCR', 'Extract text from images automatically. Supports English and Khmer.', 'ស្រង់អក្សរពីរូបភាពដោយស្វ័យប្រវត្តិ។ គាំទ្រភាសាអង់គ្លេស និងខ្មែរ។', 'language', true, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skill_categories (id, title_en, title_km, icon, sort_order) VALUES
  ('cat-frontend', 'Frontend Development', 'ការអភិវឌ្ឍផ្នែកខាងមុខ', 'laptop-code', 1),
  ('cat-design', 'Design & Tools', 'ការរចនានិងឧបករណ៍', 'screwdriver-wrench', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (category_id, name_en, name_km, percentage, sort_order) VALUES
  ('cat-frontend', 'HTML5 / Semantic markup', 'HTML5 / សម្គាល់អត្ថបទ', 95, 1),
  ('cat-frontend', 'CSS3 / Grid & Flexbox', 'CSS3 / Grid & Flexbox', 90, 2),
  ('cat-frontend', 'JavaScript (ES6+)', 'JavaScript (ES6+)', 85, 3),
  ('cat-frontend', 'Responsive Web Design', 'ការរចនាវេបឆ្លើយតប', 92, 4),
  ('cat-design', 'Figma UI/UX Mockups', 'Figma UI/UX', 80, 1),
  ('cat-design', 'Git & GitHub Workflows', 'Git & GitHub', 85, 2),
  ('cat-design', 'Chrome Developer Tools', 'Chrome Developer Tools', 90, 3),
  ('cat-design', 'VS Code Optimization', 'VS Code', 95, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (title_en, description_en, category, category_label_en, tags, images, project_url, github_url, featured, published, sort_order) VALUES
  ('School Management System', 'A comprehensive school management dashboard featuring real-time student attendance tracking, academic records, and interactive data insights.', 'frontend', 'Frontend System', 'HTML5,CSS Grid,Vanilla JS', '["https://i.ibb.co/rK0gvkVz/Screenshot-16.png","https://i.ibb.co/842XGyj0/Screenshot-14.png","https://i.ibb.co/JRPCNq9M/Screenshot-21.png"]'::jsonb, 'https://school-ms-eta.vercel.app/#', 'https://github.com/0978114331', true, true, 1),
  ('Apex E-Commerce', 'Futuristic storefront user experience focusing on glassmorphic card patterns and intuitive navigation mechanics.', 'ui', 'UI/UX Design', 'Figma,Design System,Mobile First', '["https://i.ibb.co/bgcRTt3X/1.png","https://i.ibb.co/kg67nxdn/5.png"]'::jsonb, 'https://www.figma.com', 'https://github.com/0978114331', false, true, 2),
  ('Synapse Collaborator', 'A collaboration micro-service built to process secure JSON data packages between teams with custom endpoint tests.', 'fullstack', 'Fullstack API', 'Node.js,Express,REST API', '["https://i.ibb.co/JRPCNq9M/Screenshot-21.png","https://i.ibb.co/rK0gvkVz/Screenshot-16.png"]'::jsonb, '#', 'https://github.com/0978114331', false, true, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO documents (title_en, description_en, category_en, images, date_label, published, sort_order) VALUES
  ('Volunteer Experience', 'Detailed visual records of my social work and community volunteer activities.', 'Volunteer Experience', '["https://i.ibb.co/9HVwQ7tz/retouch-2024011222383231.jpg","https://i.ibb.co/wZ65VCBs/retouch-2024071115483253.jpg","https://i.ibb.co/wFYr7z9v/IMG-0067.jpg","https://i.ibb.co/rGC6s50g/251a49d8-4109-41f1-991d-4a729169c892.png","https://i.ibb.co/xS4kKh2J/FB-IMG-1718239013757.jpg","https://i.ibb.co/svpXC4y1/QVZk-Z2-RQZC0x-R2x-EMFkx-NQ.jpg","https://i.ibb.co/B2DRjfVd/QVZkc-G52-RFpj-RUVf-TEd2-UA.jpg","https://i.ibb.co/CKGmHycL/QVZja1p-Jb0-Ex-Ri13-TEt2-ZQ.jpg","https://i.ibb.co/N22Dq4Xg/IMG-20210825-120256.jpg","https://i.ibb.co/9HZNYP7r/QVZmb-XFve-E9-MVmxrb2-FNNw.jpg","https://i.ibb.co/ZwrHXVv/QVZl-VXVKSE1z-REpsa-TQ5-YQ.jpg","https://i.ibb.co/GvLQ4NNW/QVZja0-VWSWl-LQ3-Rr-R0-Fpc-Q.jpg","https://i.ibb.co/qLTSGYd3/QVZj-Znk2e-XBu-Vmp-HOUMy-Vg.jpg","https://i.ibb.co/VWTnG9wb/QVZk-Sm9rdm5x-Mll-OT3h3-Tg.jpg","https://i.ibb.co/bj5qH0HX/IMG-20241029-045423.jpg","https://i.ibb.co/KjN508LS/IMG-20221127-164848.jpg","https://i.ibb.co/cSmxJSpM/retouch-2024042820312757.jpg","https://i.ibb.co/YHyJ3hV/QVZj-Ty1p-Qzh6-MWFpa3-Fp-WA.jpg"]'::jsonb, '', true, 1),
  ('Certificates', 'A collection of certificates, awards, and official recognitions earned through social work.', 'Certificates', '["https://i.ibb.co/3tbNDRT/Scan-10-5.png","https://i.ibb.co/Fq8P61Wj/Screenshot-20240430-200508.jpg","https://i.ibb.co/qLs3GD9F/12.png","https://i.ibb.co/LXWbWkQ6/11.png","https://i.ibb.co/39Hv5zds/10.png","https://i.ibb.co/0Rmkg085/9.png","https://i.ibb.co/LDJCrBvt/8.png","https://i.ibb.co/qZKfwDS/7.png","https://i.ibb.co/twvHqwJ4/6.png","https://i.ibb.co/NggkLqKJ/5.png","https://i.ibb.co/Nn9y2TwG/4.png","https://i.ibb.co/BDP8KwJ/3.png","https://i.ibb.co/4gF0VvdL/2.png","https://i.ibb.co/Z1gTWS9R/1.png"]'::jsonb, '', true, 2),
  ('Profile Photos', 'A collection of my professional and personal portraits.', 'Profile Photos', '["https://i.ibb.co/bRbKgCfV/QVZk-Ri03-TXcw-Nlk1a-Hh-HMQ.jpg","https://i.ibb.co/B2DRjfVd/QVZkc-G52-RFpj-RUVf-TEd2-UA.jpg","https://i.ibb.co/hRyhM9Y1/temp-image-8512615-F-B146-4867-ABC3-FDCEDF1-BCA89.jpg","https://i.ibb.co/hFJJywHh/temp-image-C009-BB4-C-ABBD-4-C88-B3-BD-9-AC7-D210-B792.jpg","https://i.ibb.co/wFYr7z9v/IMG-0067.jpg","https://i.ibb.co/nXPpyDJ/IMG-0146.jpg","https://i.ibb.co/s9vqdG4j/temp-image-60725241-9-A4-B-4-AAA-8-DE4-DC3507-AE3-F6-B.webp","https://i.ibb.co/spY48NYB/IMG-0338.png","https://i.ibb.co/3yqpSXfL/retouch-2023101318315869.jpg","https://i.ibb.co/gL1hhKmM/QVZmd252-X2c0-LTg4-QUNVLQ.jpg","https://i.ibb.co/DH1Gn0BM/QVZl-QVRx-WGRpa-XZlb1-NZYQ.jpg","https://i.ibb.co/C31Gd9Xm/QVZma0-VEd-TI0b2h-Ud-DF1d-Q.jpg","https://i.ibb.co/YB4DRDxs/QVZj-NGh4-MDROSnhv-QVMx-Xw.jpg"]'::jsonb, '', true, 3),
  ('Curriculum Vitae (CV)', 'My detailed resume showcasing skills, education, and career path.', 'Curriculum Vitae (CV)', '["https://i.ibb.co/XMpYz7s/CV-Cover-Letter-KHOUV-CHVEA-1.png","https://i.ibb.co/8LJd7S3N/CV-Cover-Letter-KHOUV-CHVEA-2.png","https://i.ibb.co/9HZNYP7r/QVZmb-XFve-E9-MVmxrb2-FNNw.jpg","https://i.ibb.co/4gSXvZ2q/CV-Cover-Letter-KHOUV-CHVEA-1.png","https://i.ibb.co/HZ5yVJP/CV-Cover-Letter-KHOUV-CHVEA-2.png"]'::jsonb, '', true, 4),
  ('Academic Certificates', 'Degrees and academic documents acquired during my studies.', 'Academic Certificates', '["https://i.ibb.co/5X3MVvtM/Scan-9-2.png","https://i.ibb.co/yBnqCMck/IMG-20240214-094121.jpg"]'::jsonb, '', true, 5),
  ('Project Certificates', 'Certificates received upon successful completion of SMS projects.', 'Project Certificates', '["https://i.ibb.co/XQG3yHD/IMG-0841.png","https://i.ibb.co/3tbNDRT/Scan-10-5.png","https://i.ibb.co/LXWbWkQ6/11.png"]'::jsonb, '2026-2027', true, 6),
  ('Internship at NEP', 'Completed a one-year internship at NEP (2025-2026) through the Education Champion Program.', 'Internship at NEP', '["https://i.ibb.co/394Kxj3r/IMG-20250408-202148.jpg","https://i.ibb.co/QvFBwc30/retouch-2025041000485467.jpg","https://i.ibb.co/F4QmNxLs/IMG-0069.jpg","https://i.ibb.co/GfRPy5Z0/IMG-0070.jpg"]'::jsonb, '2025-2026', true, 7),
  ('Digital Government Expo', 'Participated in the Digital Government Exhibition at Koh Pich.', 'Digital Government Expo', '["https://i.ibb.co/nXPpyDJ/IMG-0146.jpg","https://i.ibb.co/xd80wGc/IMG-0079.jpg","https://i.ibb.co/tpghBnCr/IMG-0122.jpg"]'::jsonb, '2026', true, 8),
  ('Capacity Building Training', 'Training on Creative Art and Performance Art For Youth Group Leaders.', 'Capacity Building Training', '["https://i.ibb.co/MkJ91b1y/photo-6-2026-06-26-09-56-38.jpg","https://i.ibb.co/Y7ZNRKqb/photo-5-2026-06-26-09-56-38.jpg","https://i.ibb.co/9ks79jCm/photo-9-2026-06-26-09-56-38.jpg","https://i.ibb.co/1JdbrbtT/photo-7-2026-06-26-09-56-38.jpg","https://i.ibb.co/cK3QssnQ/photo-8-2026-06-26-09-56-38.jpg","https://i.ibb.co/j9fjWTjB/photo-4-2026-06-26-09-56-38.jpg","https://i.ibb.co/twjNkpGh/photo-2-2026-06-26-09-56-38.jpg"]'::jsonb, '2024 Worlds hope', true, 9),
  ('Internet Forum Participation', 'Participated in the Internet Forum, exploring topics related to digital technology.', 'Internet Forum Participation', '["https://i.ibb.co/S7NLSJR7/temp-image-DC834-AE3-BAD2-4-C3-E-BA66-8-FCFC1-F1-A63-B.jpg","https://i.ibb.co/WWD87QVT/temp-image-D4-A48179-6-D2-E-442-C-BF13-A18-CAC69-F858.jpg","https://i.ibb.co/n8Pss2BH/photo-2026-06-18-17-32-14.jpg"]'::jsonb, '2025', true, 10)
ON CONFLICT (id) DO NOTHING;
