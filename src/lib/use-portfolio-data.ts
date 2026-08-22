import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { SiteSettings, Hero, About, SkillCategory, Project, Document, Tool, ChatSettings, Stats } from './supabase';

export function usePortfolioData() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [hero, setHero] = useState<Hero | null>(null);
  const [about, setAbout] = useState<About | null>(null);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [s, h, a, cats, skills, proj, docs, t, chat, st, vis] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('hero').select('*').eq('id', 1).maybeSingle(),
        supabase.from('about').select('*').eq('id', 1).maybeSingle(),
        supabase.from('skill_categories').select('*').order('sort_order'),
        supabase.from('skills').select('*').order('sort_order'),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('tools').select('*').order('sort_order'),
        supabase.from('chat_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('stats').select('*'),
        supabase.from('visitor_stats').select('*').eq('id', 1).maybeSingle(),
      ]);

      setSettings(s.data as SiteSettings);
      setHero(h.data as Hero);
      setAbout(a.data as About);
      
      const catsData = (cats.data || []) as SkillCategory[];
      const skillsData = (skills.data || []) as any[];
      setSkillCategories(catsData.map(c => ({ ...c, skills: skillsData.filter(sk => sk.category_id === c.id) })));
      
      setProjects((proj.data || []) as Project[]);
      setDocuments((docs.data || []) as Document[]);
      setTools((t.data || []) as Tool[]);
      setChatSettings(chat.data as ChatSettings);
      
      const statsMap: Record<string, Stats> = {};
      (st.data || []).forEach((row: any) => { statsMap[row.item_id] = row; });
      setStats(statsMap);
      
      setVisitorCount(vis.data?.total_visits || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const recordVisit = useCallback(async () => {
    const visited = sessionStorage.getItem('site_visited');
    if (!visited) {
      try {
        await supabase.rpc('increment_visitor');
        sessionStorage.setItem('site_visited', 'true');
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    fetchAll();
    recordVisit();

    const channel = supabase.channel('public-data-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        if (payload.table === 'stats') {
          const newStat = payload.new as Stats;
          if (newStat && newStat.item_id) {
            setStats(prev => ({ ...prev, [newStat.item_id]: newStat }));
          }
        } else if (payload.table === 'visitor_stats') {
          setVisitorCount((payload.new as any).total_visits || 0);
        } else {
          fetchAll();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll, recordVisit]);

  const incrementView = async (itemId: string) => {
    try {
      await supabase.rpc('increment_view', { p_item_id: itemId });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLike = async (itemId: string, increment: boolean) => {
    setStats(prev => {
      const currentStats = prev[itemId] || { item_id: itemId, views: 0, likes: 0 };
      const currentLikes = currentStats.likes || 0;
      return {
        ...prev,
        [itemId]: {
          ...currentStats,
          likes: increment ? currentLikes + 1 : Math.max(0, currentLikes - 1)
        }
      };
    });

    try {
      if (increment) {
        await supabase.rpc('increment_like', { p_item_id: itemId });
      } else {
        await supabase.rpc('decrement_like', { p_item_id: itemId });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    settings, hero, about, skillCategories, projects, documents, tools,
    chatSettings, visitorCount, stats, loading,
    incrementView, toggleLike, refetch: fetchAll
  };
}