import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  SiteSettings, Hero, About, SkillCategory, Project, Document,
  Tool, ChatSettings, Stats,
} from '@/lib/supabase';

export function usePortfolioData() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [hero, setHero] = useState<Hero | null>(null);
  const [about, setAbout] = useState<About | null>(null);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);
  const [visitorCount, setVisitorCount] = useState(0);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [
      settingsR, heroR, aboutR, catR, skillsR, projR, docR, toolsR, chatR, visitorR, statsR,
    ] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('hero').select('*').eq('id', 1).maybeSingle(),
      supabase.from('about').select('*').eq('id', 1).maybeSingle(),
      supabase.from('skill_categories').select('*').order('sort_order'),
      supabase.from('skills').select('*').order('sort_order'),
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('documents').select('*').order('sort_order'),
      supabase.from('tools').select('*').order('sort_order'),
      supabase.from('chat_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('visitor_stats').select('*').eq('id', 1).maybeSingle(),
      supabase.from('stats').select('*'),
    ]);

    setSettings(settingsR.data as SiteSettings);
    setHero(heroR.data as Hero);
    setAbout(aboutR.data as About);

    const cats = (catR.data || []) as SkillCategory[];
    const skills = (skillsR.data || []) as any[];
    const catsWithSkills = cats.map((c) => ({
      ...c,
      skills: skills.filter((s) => s.category_id === c.id),
    }));
    setSkillCategories(catsWithSkills);

    setProjects((projR.data || []) as Project[]);
    setDocuments((docR.data || []) as Document[]);
    setTools((toolsR.data || []) as Tool[]);
    setChatSettings(chatR.data as ChatSettings);
    setVisitorCount(visitorR.data?.total_visits || 0);

    const statsMap: Record<string, Stats> = {};
    (statsR.data || []).forEach((s: any) => {
      statsMap[s.item_id] = s;
    });
    setStats(statsMap);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    // Increment visitor once per session
    if (!sessionStorage.getItem('visited')) {
      supabase.rpc('increment_visitor').then(() => {
        sessionStorage.setItem('visited', 'true');
      });
    }

    // Realtime subscriptions
    const channel = supabase
      .channel('portfolio-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'about' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_categories' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_settings' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_stats' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stats' }, () => fetchAll())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const incrementView = useCallback(async (itemId: string) => {
    await supabase.rpc('increment_stat', { p_item_id: itemId, p_field: 'views' });
  }, []);

  const toggleLike = useCallback(async (itemId: string, increment: boolean) => {
    await supabase.rpc('toggle_like', { p_item_id: itemId, p_increment: increment });
  }, []);

  return {
    settings, hero, about, skillCategories, projects, documents, tools,
    chatSettings, visitorCount, stats, loading,
    incrementView, toggleLike, refetch: fetchAll,
  };
}
