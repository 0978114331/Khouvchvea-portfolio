import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type SiteSettings = {
  id: number;
  site_title: string;
  logo_text: string;
  favicon_url: string;
  meta_description: string;
  primary_color: string;
  secondary_color: string;
  default_language: string;
  maintenance_mode: boolean;
  maintenance_message_en: string;
  maintenance_message_km: string;
  email: string;
  location: string;
  github_url: string;
  telegram_url: string;
  footer_text: string;
  updated_at: string;
};

export type Hero = {
  id: number;
  name_en: string;
  name_km: string;
  description_en: string;
  description_km: string;
  typing_phrases: string[];
  profile_image_url: string;
  status_badge_en: string;
  status_badge_km: string;
  primary_btn_en: string;
  primary_btn_url: string;
  secondary_btn_en: string;
  secondary_btn_url: string;
  updated_at: string;
};

export type About = {
  id: number;
  title_en: string;
  title_km: string;
  heading_en: string;
  paragraph1_en: string;
  paragraph2_en: string;
  years_learning: string;
  projects_completed: string;
  feature_cards: FeatureCard[];
  updated_at: string;
};

export type FeatureCard = {
  icon: string;
  title_en: string;
  desc_en: string;
};

export type SkillCategory = {
  id: string;
  title_en: string;
  title_km: string | null;
  icon: string;
  sort_order: number;
  skills?: Skill[];
};

export type Skill = {
  id: string;
  category_id: string;
  name_en: string;
  name_km: string | null;
  percentage: number;
  sort_order: number;
};

export type Project = {
  id: string;
  title_en: string;
  title_km: string | null;
  description_en: string;
  description_km: string | null;
  category: string;
  category_label_en: string;
  tags: string;
  images: string[];
  project_url: string;
  github_url: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  title_en: string;
  title_km: string | null;
  description_en: string;
  description_km: string | null;
  category_en: string;
  images: string[];
  date_label: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Tool = {
  id: string;
  name_en: string;
  name_km: string | null;
  description_en: string;
  description_km: string | null;
  icon: string;
  enabled: boolean;
  sort_order: number;
};

export type ChatSettings = {
  id: number;
  enabled: boolean;
  bot_name_en: string;
  bot_name_km: string;
  welcome_en: string;
  welcome_km: string;
  suggested_questions: string[];
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export type Stats = {
  item_id: string;
  views: number;
  likes: number;
};

export type ActivityLog = {
  id: string;
  action: string;
  details: string;
  created_at: string;
};
