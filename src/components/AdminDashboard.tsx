import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, FolderKanban, FileText, Cpu, Settings, Mail,
  BarChart3, MessageSquare, Shield, History, LogOut, Menu, X,
  Eye, Plus, Trash2, Edit, Save, Star, Power, Globe, Moon, Sun,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useApp } from '@/lib/app-context';
import { supabase } from '@/lib/supabase';
import type {
  SiteSettings, Hero, About, SkillCategory, Project, Document,
  Tool, ChatSettings, ContactMessage, ActivityLog, Stats,
} from '@/lib/supabase';

type TabId =
  | 'overview' | 'projects' | 'documents' | 'skills' | 'hero'
  | 'about' | 'settings' | 'messages' | 'analytics' | 'tools'
  | 'chat' | 'security' | 'logs';

type Props = {
  onExit: () => void;
};

export function AdminDashboard({ onExit }: Props) {
  const { session, signOut } = useAuth();
  const { theme, toggleTheme, lang, setLang } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [hero, setHero] = useState<Hero | null>(null);
  const [about, setAbout] = useState<About | null>(null);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [visitorCount, setVisitorCount] = useState(0);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const logAction = async (action: string, details: string) => {
    await supabase.rpc('log_activity', { p_action: action, p_details: details });
  };

  const fetchAll = useCallback(async () => {
    const [s, h, a, cats, skills, proj, docs, t, chat, msg, lg, st, vis] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('hero').select('*').eq('id', 1).maybeSingle(),
      supabase.from('about').select('*').eq('id', 1).maybeSingle(),
      supabase.from('skill_categories').select('*').order('sort_order'),
      supabase.from('skills').select('*').order('sort_order'),
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('documents').select('*').order('sort_order'),
      supabase.from('tools').select('*').order('sort_order'),
      supabase.from('chat_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('stats').select('*'),
      supabase.from('visitor_stats').select('*').eq('id', 1).maybeSingle(),
    ]);

    setSettings(s.data as SiteSettings);
    setHero(h.data as Hero);
    setAbout(a.data as About);
    const catsData = (cats.data || []) as SkillCategory[];
    const skillsData = (skills.data || []) as any[];
    setSkillCategories(catsData.map((c) => ({ ...c, skills: skillsData.filter((sk) => sk.category_id === c.id) })));
    setProjects((proj.data || []) as Project[]);
    setDocuments((docs.data || []) as Document[]);
    setTools((t.data || []) as Tool[]);
    setChatSettings(chat.data as ChatSettings);
    setMessages((msg.data || []) as ContactMessage[]);
    setLogs((lg.data || []) as ActivityLog[]);
    const statsMap: Record<string, Stats> = {};
    (st.data || []).forEach((row: any) => { statsMap[row.item_id] = row; });
    setStats(statsMap);
    setVisitorCount(vis.data?.total_visits || 0);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSignOut = async () => {
    await logAction('LOGOUT', 'Admin logged out');
    await signOut();
    onExit();
  };

  const navItems: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Cpu },
    { id: 'hero', label: 'Hero', icon: Star },
    { id: 'about', label: 'About', icon: FileText },
    { id: 'settings', label: 'Site Settings', icon: Settings },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'tools', label: 'Tools', icon: Power },
    { id: 'chat', label: 'Chat Assistant', icon: MessageSquare },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'logs', label: 'Activity Logs', icon: History },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)', color: 'var(--text-main)' }}>
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)' }}
      >
        <div className="p-5 flex items-center justify-between">
          <span className="text-lg font-extrabold gradient-text">KHOUV CMS</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="px-3 flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={
                  activeTab === item.id
                    ? { background: 'var(--gradient-accent)', color: 'white' }
                    : { color: 'var(--text-muted)' }
                }
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium w-full transition-colors"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between"
          style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu size={22} />
            </button>
            <h1 className="text-base sm:text-lg font-bold capitalize">{navItems.find((n) => n.id === activeTab)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'en' ? 'km' : 'en')} className="px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: 'var(--border-color)' }}>
              <Globe size={14} className="inline mr-1" />{lang.toUpperCase()}
            </button>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: 'var(--border-color)' }}>
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <a href="/" target="_blank" className="px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5" style={{ borderColor: 'var(--border-color)', color: 'var(--primary)' }}>
              <Eye size={14} /> View Site
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'overview' && <OverviewTab projects={projects} documents={documents} skillCategories={skillCategories} messages={messages} stats={stats} visitorCount={visitorCount} />}
          {activeTab === 'projects' && <ProjectsTab projects={projects} stats={stats} showToast={showToast} logAction={logAction} refetch={fetchAll} />}
          {activeTab === 'documents' && <DocumentsTab documents={documents} stats={stats} showToast={showToast} logAction={logAction} refetch={fetchAll} />}
          {activeTab === 'skills' && <SkillsTab categories={skillCategories} showToast={showToast} logAction={logAction} refetch={fetchAll} />}
          {activeTab === 'hero' && hero && <HeroTab hero={hero} showToast={showToast} logAction={logAction} />}
          {activeTab === 'about' && about && <AboutTab about={about} showToast={showToast} logAction={logAction} />}
          {activeTab === 'settings' && settings && <SettingsTab settings={settings} showToast={showToast} logAction={logAction} />}
          {activeTab === 'messages' && <MessagesTab messages={messages} showToast={showToast} logAction={logAction} refetch={fetchAll} />}
          {activeTab === 'analytics' && <AnalyticsTab stats={stats} visitorCount={visitorCount} projects={projects} documents={documents} />}
          {activeTab === 'tools' && <ToolsTab tools={tools} showToast={showToast} logAction={logAction} refetch={fetchAll} />}
          {activeTab === 'chat' && chatSettings && <ChatTab chatSettings={chatSettings} showToast={showToast} logAction={logAction} />}
          {activeTab === 'security' && <SecurityTab session={session} logs={logs} />}
          {activeTab === 'logs' && <LogsTab logs={logs} />}
        </main>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-lg text-sm font-semibold z-[100] shadow-lg animate-fade-up"
          style={{
            background: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function OverviewTab({ projects, documents, skillCategories, messages, stats, visitorCount }: any) {
  const totalViews = Object.values(stats as Record<string, Stats>).reduce((sum, s) => sum + (s.views || 0), 0);
  const totalLikes = Object.values(stats as Record<string, Stats>).reduce((sum, s) => sum + (s.likes || 0), 0);
  const newMessages = messages.filter((m: any) => m.status === 'new').length;

  const cards = [
    { label: 'Total Visitors', value: visitorCount, icon: Eye, color: '#3b82f6' },
    { label: 'Projects', value: projects.length, icon: FolderKanban, color: '#a855f7' },
    { label: 'Documents', value: documents.length, icon: FileText, color: '#06b6d4' },
    { label: 'Skills', value: skillCategories.reduce((sum: number, c: any) => sum + (c.skills?.length || 0), 0), icon: Cpu, color: '#10b981' },
    { label: 'Total Views', value: totalViews, icon: BarChart3, color: '#f59e0b' },
    { label: 'Total Likes', value: totalLikes, icon: Star, color: '#f43f5e' },
    { label: 'New Messages', value: newMessages, icon: Mail, color: '#8b5cf6' },
    { label: 'Skill Categories', value: skillCategories.length, icon: LayoutDashboard, color: '#6366f1' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card p-5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${card.color}20`, color: card.color }}>
                <Icon size={18} />
              </div>
              <div className="text-2xl font-extrabold">{card.value.toLocaleString()}</div>
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectsTab({ projects, stats, showToast, logAction, refetch }: any) {
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title_en: '', title_km: '', description_en: '', description_km: '', category: 'frontend', category_label_en: '', category_label_km: '', tags: '', images: '', project_url: '#', github_url: '#', featured: false, published: true });

  const startEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title_en: p.title_en, title_km: p.title_km || '', description_en: p.description_en, description_km: p.description_km || '', 
      category: p.category, category_label_en: p.category_label_en, category_label_km: (p as any).category_label_km || '', 
      tags: p.tags, images: (p.images || []).join('\n'), project_url: p.project_url, github_url: p.github_url, featured: p.featured, published: p.published,
    });
    setShowForm(true);
  };

  const startNew = () => {
    setEditing(null);
    setForm({ title_en: '', title_km: '', description_en: '', description_km: '', category: 'frontend', category_label_en: '', category_label_km: '', tags: '', images: '', project_url: '#', github_url: '#', featured: false, published: true });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title_en) { showToast('Title (EN) required', 'error'); return; }
    const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean);
    const payload = { ...form, images, sort_order: editing?.sort_order || projects.length + 1 };

    if (editing) {
      const { error } = await supabase.from('projects').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id);
      if (error) { showToast('Update failed', 'error'); return; }
      await logAction('UPDATE', `Updated project: ${form.title_en}`);
      showToast('Project updated!');
    } else {
      const { error } = await supabase.from('projects').insert(payload);
      if (error) { showToast('Create failed', 'error'); return; }
      await logAction('CREATE', `Created project: ${form.title_en}`);
      showToast('Project created!');
    }
    setShowForm(false);
    await refetch();
  };

  const del = async (p: Project) => {
    if (!confirm(`Delete "${p.title_en}"?`)) return;
    const { error } = await supabase.from('projects').delete().eq('id', p.id);
    if (error) { showToast('Delete failed', 'error'); return; }
    await logAction('DELETE', `Deleted project: ${p.title_en}`);
    showToast('Project deleted');
    await refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Manage Projects</h2>
        <button onClick={startNew} className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus size={16} /> Add Project
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="font-bold mb-4">{editing ? 'Edit Project' : 'New Project'}</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <Field label="Title (EN)"><input className="form-input" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></Field>
            <Field label="Title (KM)"><input className="form-input" value={form.title_km} onChange={(e) => setForm({ ...form, title_km: e.target.value })} /></Field>
            <Field label="Category Label (EN)"><input className="form-input" value={form.category_label_en} onChange={(e) => setForm({ ...form, category_label_en: e.target.value })} /></Field>
            <Field label="Category Label (KM)"><input className="form-input" value={form.category_label_km} onChange={(e) => setForm({ ...form, category_label_km: e.target.value })} /></Field>
            <Field label="Category Type">
              <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="frontend">Frontend</option>
                <option value="ui">UI/UX Design</option>
                <option value="fullstack">Fullstack</option>
              </select>
            </Field>
            <Field label="Tags (comma separated)"><input className="form-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
            <Field label="Project URL"><input className="form-input" value={form.project_url} onChange={(e) => setForm({ ...form, project_url: e.target.value })} /></Field>
            <Field label="GitHub URL"><input className="form-input" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></Field>
          </div>
          <Field label="Description (EN)"><textarea className="form-input mb-3" rows={2} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></Field>
          <Field label="Description (KM)"><textarea className="form-input mb-3" rows={2} value={form.description_km} onChange={(e) => setForm({ ...form, description_km: e.target.value })} /></Field>
          <Field label="Image URLs (one per line)"><textarea className="form-input mb-3" rows={3} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} /></Field>
          
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="btn-gradient px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Save size={16} /> Save</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--bg-surface)' }}>
            <tr>
              <th className="text-left p-3 font-semibold">Project</th>
              <th className="text-left p-3 font-semibold hidden sm:table-cell">Category</th>
              <th className="text-left p-3 font-semibold hidden sm:table-cell">Status</th>
              <th className="text-right p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td className="p-3">
                  <div className="font-semibold">{p.title_en}</div>
                  {p.featured && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Featured</span>}
                </td>
                <td className="p-3 hidden sm:table-cell">{p.category_label_en}</td>
                <td className="p-3 hidden sm:table-cell">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: p.published ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: p.published ? '#10b981' : '#ef4444' }}>
                    {p.published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-blue-500/10" style={{ color: 'var(--primary)' }}><Edit size={15} /></button>
                  <button onClick={() => del(p)} className="p-1.5 rounded hover:bg-red-500/10" style={{ color: '#ef4444' }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentsTab({ documents, stats, showToast, logAction, refetch }: any) {
  const [editing, setEditing] = useState<Document | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title_en: '', title_km: '', description_en: '', description_km: '', category_en: '', images: '', date_label: '', published: true });

  const startEdit = (d: Document) => {
    setEditing(d);
    setForm({ title_en: d.title_en, title_km: d.title_km || '', description_en: d.description_en, description_km: d.description_km || '', category_en: d.category_en, images: (d.images || []).join('\n'), date_label: d.date_label, published: d.published });
    setShowForm(true);
  };

  const startNew = () => {
    setEditing(null);
    setForm({ title_en: '', title_km: '', description_en: '', description_km: '', category_en: '', images: '', date_label: '', published: true });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title_en) { showToast('Title required', 'error'); return; }
    const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean);
    const payload = { ...form, images, sort_order: editing?.sort_order || documents.length + 1 };

    if (editing) {
      const { error } = await supabase.from('documents').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id);
      if (error) { showToast('Update failed', 'error'); return; }
      await logAction('UPDATE', `Updated document: ${form.title_en}`);
      showToast('Document updated!');
    } else {
      const { error } = await supabase.from('documents').insert(payload);
      if (error) { showToast('Create failed', 'error'); return; }
      await logAction('CREATE', `Created document: ${form.title_en}`);
      showToast('Document created!');
    }
    setShowForm(false);
    await refetch();
  };

  const del = async (d: Document) => {
    if (!confirm(`Delete "${d.title_en}"?`)) return;
    const { error } = await supabase.from('documents').delete().eq('id', d.id);
    if (error) { showToast('Delete failed', 'error'); return; }
    await logAction('DELETE', `Deleted document: ${d.title_en}`);
    showToast('Document deleted');
    await refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Manage Documents</h2>
        <button onClick={startNew} className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Add Document</button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="font-bold mb-4">{editing ? 'Edit Document' : 'New Document'}</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <Field label="Title (EN)"><input className="form-input" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></Field>
            <Field label="Title (KM)"><input className="form-input" value={form.title_km} onChange={(e) => setForm({ ...form, title_km: e.target.value })} /></Field>
            <Field label="Category"><input className="form-input" value={form.category_en} onChange={(e) => setForm({ ...form, category_en: e.target.value })} /></Field>
            <Field label="Date Label (e.g. 2025-2026)"><input className="form-input" value={form.date_label} onChange={(e) => setForm({ ...form, date_label: e.target.value })} /></Field>
          </div>
          <Field label="Description (EN)"><textarea className="form-input mb-3" rows={2} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></Field>
          <Field label="Description (KM)"><textarea className="form-input mb-3" rows={2} value={form.description_km} onChange={(e) => setForm({ ...form, description_km: e.target.value })} /></Field>
          <Field label="Image URLs (one per line)"><textarea className="form-input mb-3" rows={3} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm mt-3"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="btn-gradient px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Save size={16} /> Save</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--bg-surface)' }}>
            <tr>
              <th className="text-left p-3 font-semibold">Document</th>
              <th className="text-left p-3 font-semibold hidden sm:table-cell">Status</th>
              <th className="text-right p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d: any) => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td className="p-3"><div className="font-semibold">{d.title_en}</div>{d.date_label && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.date_label}</div>}</td>
                <td className="p-3 hidden sm:table-cell">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: d.published ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: d.published ? '#10b981' : '#ef4444' }}>
                    {d.published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => startEdit(d)} className="p-1.5 rounded hover:bg-blue-500/10" style={{ color: 'var(--primary)' }}><Edit size={15} /></button>
                  <button onClick={() => del(d)} className="p-1.5 rounded hover:bg-red-500/10" style={{ color: '#ef4444' }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SkillsTab({ categories, showToast, logAction, refetch }: any) {
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ title_en: '', title_km: '', icon: 'server' });
  const [skillForm, setSkillForm] = useState<{ categoryId: string; name_en: string; name_km: string; percentage: number } | null>(null);

  const addCategory = async () => {
    if (!catForm.title_en) { showToast('Title required', 'error'); return; }
    
    const newId = `cat-${Date.now()}`;
    
    const { error } = await supabase.from('skill_categories').insert({ 
      id: newId, 
      title_en: catForm.title_en,
      title_km: catForm.title_km,
      icon: catForm.icon,
      sort_order: categories.length + 1 
    });
    
    if (error) { showToast('Failed to add category', 'error'); return; }
    await logAction('CREATE', `Created skill category: ${catForm.title_en}`);
    showToast('Category added!');
    setShowCatForm(false);
    setCatForm({ title_en: '', title_km: '', icon: 'server' });
    await refetch();
  };

  const delCategory = async (id: string, title: string) => {
    if (!confirm(`Delete category "${title}" and all its skills?`)) return;
    const { error } = await supabase.from('skill_categories').delete().eq('id', id);
    if (error) { showToast('Failed', 'error'); return; }
    await logAction('DELETE', `Deleted skill category: ${title}`);
    showToast('Category deleted');
    await refetch();
  };

  const addSkill = async () => {
    if (!skillForm || !skillForm.name_en) { showToast('Skill name required', 'error'); return; }
    const { error } = await supabase.from('skills').insert({
      category_id: skillForm.categoryId,
      name_en: skillForm.name_en,
      name_km: skillForm.name_km,
      percentage: skillForm.percentage,
      sort_order: (categories.find((c: any) => c.id === skillForm.categoryId)?.skills?.length || 0) + 1,
    });
    if (error) { showToast('Failed', 'error'); return; }
    await logAction('CREATE', `Added skill: ${skillForm.name_en}`);
    showToast('Skill added!');
    setSkillForm(null);
    await refetch();
  };

  const delSkill = async (id: string, name: string) => {
    if (!confirm(`Delete skill "${name}"?`)) return;
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) { showToast('Failed', 'error'); return; }
    await logAction('DELETE', `Deleted skill: ${name}`);
    showToast('Skill deleted');
    await refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Manage Skills</h2>
        <button onClick={() => setShowCatForm(!showCatForm)} className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Add Category</button>
      </div>

      {showCatForm && (
        <div className="card p-5 mb-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Category Title (EN)"><input className="form-input" value={catForm.title_en} onChange={(e) => setCatForm({ ...catForm, title_en: e.target.value })} /></Field>
            <Field label="Category Title (KM)"><input className="form-input" value={catForm.title_km} onChange={(e) => setCatForm({ ...catForm, title_km: e.target.value })} /></Field>
            <Field label="Select Icon">
              <select className="form-input" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}>
                <option value="laptop-code">Web & Code (laptop-code)</option>
                <option value="server">Backend & DB (server)</option>
                <option value="screwdriver-wrench">Design & Tools (screwdriver-wrench)</option>
                <option value="smartphone">Mobile App (smartphone)</option>
                <option value="terminal">Terminal (terminal)</option>
                <option value="globe">Network (globe)</option>
              </select>
            </Field>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addCategory} className="btn-gradient px-5 py-2 rounded-lg text-sm font-semibold">Save Category</button>
            <button onClick={() => setShowCatForm(false)} className="px-5 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {categories.map((cat: any) => (
          <div key={cat.id} className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{cat.title_en} {cat.title_km && <span className="text-xs text-gray-500 font-normal">({cat.title_km})</span>}</h3>
              <button onClick={() => delCategory(cat.id, cat.title_en)} className="p-1.5 rounded hover:bg-red-500/10" style={{ color: '#ef4444' }}><Trash2 size={15} /></button>
            </div>
            <div className="flex flex-col gap-2 mb-3">
              {(cat.skills || []).map((sk: any) => (
                <div key={sk.id} className="flex items-center justify-between text-sm py-1.5 px-3 rounded" style={{ background: 'var(--bg-surface)' }}>
                  <span>{sk.name_en} <span className="text-gray-500 text-xs">{sk.name_km}</span> — {sk.percentage}%</span>
                  <button onClick={() => delSkill(sk.id, sk.name_en)} className="p-1 rounded" style={{ color: '#ef4444' }}><X size={14} /></button>
                </div>
              ))}
            </div>
            {skillForm?.categoryId === cat.id ? (
              <div className="flex gap-2 mt-2">
                <input className="form-input flex-1" placeholder="Skill (EN)" value={skillForm?.name_en || ''} onChange={(e) => skillForm && setSkillForm({ ...skillForm, name_en: e.target.value })} />
                <input className="form-input flex-1" placeholder="Skill (KM)" value={skillForm?.name_km || ''} onChange={(e) => skillForm && setSkillForm({ ...skillForm, name_km: e.target.value })} />
                <input className="form-input w-16" type="number" min={0} max={100} value={skillForm?.percentage || 0} onChange={(e) => skillForm && setSkillForm({ ...skillForm, percentage: parseInt(e.target.value) || 0 })} />                
                <button onClick={addSkill} className="btn-gradient px-3 py-2 rounded-lg text-sm font-semibold">Add</button>
              </div>
            ) : (
              <button onClick={() => setSkillForm({ categoryId: cat.id, name_en: '', name_km: '', percentage: 80 })} className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                <Plus size={14} /> Add Skill
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroTab({ hero, showToast, logAction }: any) {
  const [form, setForm] = useState(hero);
  const [phrasesText, setPhrasesText] = useState((hero.typing_phrases || []).join('\n'));

  const save = async () => {
    const phrases = phrasesText.split('\n').map((s: string) => s.trim()).filter(Boolean);
    const { error } = await supabase.from('hero').update({ ...form, typing_phrases: phrases, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) { showToast('Save failed', 'error'); return; }
    await logAction('UPDATE', 'Updated hero section');
    showToast('Hero updated!');
  };

  return (
    <div className="card p-5 max-w-2xl">
      <h2 className="text-lg font-bold mb-4">Edit Hero Section</h2>
      <div className="flex flex-col gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name (EN)"><input className="form-input" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></Field>
          <Field label="Name (KM)"><input className="form-input" value={form.name_km} onChange={(e) => setForm({ ...form, name_km: e.target.value })} /></Field>
          <Field label="Status Badge (EN)"><input className="form-input" value={form.status_badge_en} onChange={(e) => setForm({ ...form, status_badge_en: e.target.value })} /></Field>
          <Field label="Status Badge (KM)"><input className="form-input" value={form.status_badge_km} onChange={(e) => setForm({ ...form, status_badge_km: e.target.value })} /></Field>
        </div>
        <Field label="Description (EN)"><textarea className="form-input" rows={3} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></Field>
        <Field label="Description (KM)"><textarea className="form-input" rows={3} value={form.description_km} onChange={(e) => setForm({ ...form, description_km: e.target.value })} /></Field>
        <Field label="Typing Phrases (one per line)"><textarea className="form-input" rows={4} value={phrasesText} onChange={(e) => setPhrasesText(e.target.value)} /></Field>
        <Field label="Profile Image URL"><input className="form-input" value={form.profile_image_url} onChange={(e) => setForm({ ...form, profile_image_url: e.target.value })} /></Field>
        
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <Field label="Primary Button (EN)"><input className="form-input" value={form.primary_btn_en} onChange={(e) => setForm({ ...form, primary_btn_en: e.target.value })} /></Field>
          <Field label="Primary Button (KM)"><input className="form-input" value={form.primary_btn_km} onChange={(e) => setForm({ ...form, primary_btn_km: e.target.value })} /></Field>
          <Field label="Primary Button URL"><input className="form-input" value={form.primary_btn_url} onChange={(e) => setForm({ ...form, primary_btn_url: e.target.value })} /></Field>
          <div className="hidden sm:block"></div>
          <Field label="Secondary Button (EN)"><input className="form-input" value={form.secondary_btn_en} onChange={(e) => setForm({ ...form, secondary_btn_en: e.target.value })} /></Field>
          <Field label="Secondary Button (KM)"><input className="form-input" value={form.secondary_btn_km} onChange={(e) => setForm({ ...form, secondary_btn_km: e.target.value })} /></Field>
          <Field label="Secondary Button URL"><input className="form-input" value={form.secondary_btn_url} onChange={(e) => setForm({ ...form, secondary_btn_url: e.target.value })} /></Field>
        </div>
      </div>
      <button onClick={save} className="btn-gradient px-5 py-2 rounded-lg text-sm font-semibold mt-5 flex items-center gap-2"><Save size={16} /> Save Hero</button>
    </div>
  );
}

function AboutTab({ about, showToast, logAction }: any) {
  const [form, setForm] = useState(about);

  const save = async () => {
    const { error } = await supabase.from('about').update({ ...form, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) { showToast('Save failed', 'error'); return; }
    await logAction('UPDATE', 'Updated about section');
    showToast('About updated!');
  };

  return (
    <div className="card p-5 max-w-2xl">
      <h2 className="text-lg font-bold mb-4">Edit About Section</h2>
      <div className="flex flex-col gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title (EN)"><input className="form-input" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></Field>
          <Field label="Title (KM)"><input className="form-input" value={form.title_km} onChange={(e) => setForm({ ...form, title_km: e.target.value })} /></Field>
        </div>
        <Field label="Heading (EN)"><textarea className="form-input" rows={2} value={form.heading_en} onChange={(e) => setForm({ ...form, heading_en: e.target.value })} /></Field>
        <Field label="Heading (KM)"><textarea className="form-input" rows={2} value={form.heading_km} onChange={(e) => setForm({ ...form, heading_km: e.target.value })} /></Field>
        <Field label="Paragraph 1 (EN)"><textarea className="form-input" rows={2} value={form.paragraph1_en} onChange={(e) => setForm({ ...form, paragraph1_en: e.target.value })} /></Field>
        <Field label="Paragraph 1 (KM)"><textarea className="form-input" rows={2} value={form.paragraph1_km} onChange={(e) => setForm({ ...form, paragraph1_km: e.target.value })} /></Field>
        <Field label="Paragraph 2 (EN)"><textarea className="form-input" rows={2} value={form.paragraph2_en} onChange={(e) => setForm({ ...form, paragraph2_en: e.target.value })} /></Field>
        <Field label="Paragraph 2 (KM)"><textarea className="form-input" rows={2} value={form.paragraph2_km} onChange={(e) => setForm({ ...form, paragraph2_km: e.target.value })} /></Field>
        
        <div className="grid grid-cols-2 gap-3">
          <Field label="Years Learning"><input className="form-input" value={form.years_learning} onChange={(e) => setForm({ ...form, years_learning: e.target.value })} /></Field>
          <Field label="Projects Completed"><input className="form-input" value={form.projects_completed} onChange={(e) => setForm({ ...form, projects_completed: e.target.value })} /></Field>
        </div>
      </div>
      <button onClick={save} className="btn-gradient px-5 py-2 rounded-lg text-sm font-semibold mt-4 flex items-center gap-2"><Save size={16} /> Save About</button>
    </div>
  );
}

function SettingsTab({ settings, showToast, logAction }: any) {
  const [form, setForm] = useState(settings);

  const save = async () => {
    const { error } = await supabase.from('site_settings').update({ ...form, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) { showToast('Save failed', 'error'); return; }
    await logAction('UPDATE', 'Updated site settings');
    showToast('Settings saved!');
  };

  return (
    <div className="card p-5 max-w-2xl">
      <h2 className="text-lg font-bold mb-4">Site Settings</h2>
      <div className="flex flex-col gap-3">
        <Field label="Site Title"><input className="form-input" value={form.site_title} onChange={(e) => setForm({ ...form, site_title: e.target.value })} /></Field>
        <Field label="Logo Text"><input className="form-input" value={form.logo_text} onChange={(e) => setForm({ ...form, logo_text: e.target.value })} /></Field>
        <Field label="Meta Description"><textarea className="form-input" rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></Field>
        <Field label="Email"><input className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Location"><input className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
        <Field label="GitHub URL"><input className="form-input" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></Field>
        <Field label="Telegram URL"><input className="form-input" value={form.telegram_url} onChange={(e) => setForm({ ...form, telegram_url: e.target.value })} /></Field>
        <Field label="Footer Text"><input className="form-input" value={form.footer_text} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} /></Field>
        <Field label="Primary Color"><input className="form-input" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} /></Field>
        <Field label="Secondary Color"><input className="form-input" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} /></Field>
        <Field label="Maintenance Message (EN)"><textarea className="form-input" rows={2} value={form.maintenance_message_en} onChange={(e) => setForm({ ...form, maintenance_message_en: e.target.value })} /></Field>
        <Field label="Maintenance Message (KM)"><textarea className="form-input" rows={2} value={form.maintenance_message_km} onChange={(e) => setForm({ ...form, maintenance_message_km: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.maintenance_mode} onChange={(e) => setForm({ ...form, maintenance_mode: e.target.checked })} /> Maintenance Mode</label>
      </div>
      <button onClick={save} className="btn-gradient px-5 py-2 rounded-lg text-sm font-semibold mt-4 flex items-center gap-2"><Save size={16} /> Save Settings</button>
    </div>
  );
}

function MessagesTab({ messages, showToast, logAction, refetch }: any) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = messages.filter((m: any) => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const updateStatus = async (id: string, status: string, name: string) => {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) { showToast('Failed', 'error'); return; }
    await logAction('UPDATE', `Marked message from ${name} as ${status}`);
    showToast(`Message marked as ${status}`);
    await refetch();
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete message from ${name}?`)) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) { showToast('Failed', 'error'); return; }
    await logAction('DELETE', `Deleted message from ${name}`);
    showToast('Message deleted');
    await refetch();
  };

  return (
    <div>
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input className="form-input flex-1 min-w-[200px]" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No messages found.</p>}
        {filtered.map((m: any) => (
          <div key={m.id} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-sm">{m.name}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{m.email}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{
                background: m.status === 'new' ? 'rgba(59,130,246,0.15)' : m.status === 'read' ? 'rgba(168,85,247,0.15)' : m.status === 'replied' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                color: m.status === 'new' ? '#3b82f6' : m.status === 'read' ? '#a855f7' : m.status === 'replied' ? '#10b981' : '#6b7280',
              }}>{m.status}</span>
            </div>
            <div className="text-sm font-semibold mb-1">{m.subject}</div>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{m.message}</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => updateStatus(m.id, 'read', m.name)} className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: 'var(--border-color)' }}>Mark Read</button>
              <button onClick={() => updateStatus(m.id, 'replied', m.name)} className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: 'var(--border-color)' }}>Mark Replied</button>
              <button onClick={() => updateStatus(m.id, 'archived', m.name)} className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: 'var(--border-color)' }}>Archive</button>
              <button onClick={() => del(m.id, m.name)} className="text-xs px-3 py-1.5 rounded" style={{ color: '#ef4444' }}><Trash2 size={14} className="inline" /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTab({ stats, visitorCount, projects, documents }: any) {
  const totalViews = Object.values(stats as Record<string, Stats>).reduce((sum, s) => sum + (s.views || 0), 0);
  const totalLikes = Object.values(stats as Record<string, Stats>).reduce((sum, s) => sum + (s.likes || 0), 0);

  const projectStats = projects.map((p: any) => ({
    title: p.title_en,
    views: stats[`project_${p.id}`]?.views || 0,
    likes: stats[`project_${p.id}`]?.likes || 0,
  })).sort((a: any, b: any) => b.views - a.views);

  const docStats = documents.map((d: any) => ({
    title: d.title_en,
    views: stats[`doc_${d.id}`]?.views || 0,
    likes: stats[`doc_${d.id}`]?.likes || 0,
  })).sort((a: any, b: any) => b.views - a.views);

  const maxProjViews = Math.max(...projectStats.map((p: any) => p.views), 1);
  const maxDocViews = Math.max(...docStats.map((d: any) => d.views), 1);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Visitors" value={visitorCount} color="#3b82f6" />
        <StatCard label="Total Views" value={totalViews} color="#a855f7" />
        <StatCard label="Total Likes" value={totalLikes} color="#f43f5e" />
        <StatCard label="Total Items" value={projects.length + documents.length} color="#10b981" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-bold mb-4">Project Views</h3>
          <div className="flex flex-col gap-2">
            {projectStats.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs w-32 truncate">{p.title}</span>
                <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded" style={{ width: `${(p.views / maxProjViews) * 100}%`, background: 'var(--gradient-accent)' }} />
                </div>
                <span className="text-xs w-12 text-right">{p.views}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-4">Document Views</h3>
          <div className="flex flex-col gap-2">
            {docStats.map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs w-32 truncate">{d.title}</span>
                <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded" style={{ width: `${(d.views / maxDocViews) * 100}%`, background: 'var(--gradient-accent)' }} />
                </div>
                <span className="text-xs w-12 text-right">{d.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolsTab({ tools, showToast, logAction, refetch }: any) {
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const initialFormState = { name_en: '', name_km: '', description_en: '', description_km: '', icon: 'link', url: '', enabled: true };
  const [form, setForm] = useState(initialFormState);

  const startEdit = (t: any) => {
    setEditing(t);
    setForm({ 
      name_en: t.name_en || '', 
      name_km: t.name_km || '', 
      description_en: t.description_en || '', 
      description_km: t.description_km || '', 
      icon: t.icon || 'link', 
      url: t.url || '', 
      enabled: t.enabled !== false 
    });
    setShowForm(true);
  };

  const startNew = () => {
    setEditing(null);
    setForm(initialFormState);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name_en || !form.name_en.trim()) { 
      showToast('Tool name (EN) is required', 'error'); 
      return; 
    }

    const payload = { ...form, sort_order: editing?.sort_order || tools.length + 1 };

    if (editing) {
      const { error } = await supabase.from('tools').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id);
      if (error) { showToast('Update failed', 'error'); return; }
      await logAction('UPDATE', `Updated tool: ${form.name_en}`);
      showToast('Tool updated!');
    } else {
      const { error } = await supabase.from('tools').insert(payload);
      if (error) { showToast('Create failed', 'error'); return; }
      await logAction('CREATE', `Created tool: ${form.name_en}`);
      showToast('Tool created!');
    }
    
    setShowForm(false);
    setForm(initialFormState);
    await refetch();
  };

  const del = async (t: any) => {
    if (!confirm(`Delete tool "${t.name_en}"?`)) return;
    const { error } = await supabase.from('tools').delete().eq('id', t.id);
    if (error) { showToast('Delete failed', 'error'); return; }
    await logAction('DELETE', `Deleted tool: ${t.name_en}`);
    showToast('Tool deleted');
    await refetch();
  };

  const toggle = async (tool: any) => {
    const { error } = await supabase.from('tools').update({ enabled: !tool.enabled, updated_at: new Date().toISOString() }).eq('id', tool.id);
    if (error) { showToast('Failed', 'error'); return; }
    await logAction('UPDATE', `${tool.enabled ? 'Disabled' : 'Enabled'} tool: ${tool.name_en}`);
    showToast(`${tool.name_en} ${tool.enabled ? 'disabled' : 'enabled'}`);
    await refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Manage Tools</h2>
        <button onClick={startNew} className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus size={16} /> Add Tool
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="font-bold mb-4">{editing ? 'Edit Tool' : 'New Tool'}</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <Field label="Name (EN)"><input className="form-input" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></Field>
            <Field label="Name (KM)"><input className="form-input" value={form.name_km} onChange={(e) => setForm({ ...form, name_km: e.target.value })} /></Field>
            <Field label="Icon Name (e.g. qrcode, file-pdf, language, zap, link)"><input className="form-input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></Field>
            <Field label="External URL (Leave empty for built-in modals)"><input className="form-input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></Field>
          </div>
          <Field label="Description (EN)"><textarea className="form-input mb-3" rows={2} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></Field>
          <Field label="Description (KM)"><textarea className="form-input mb-3" rows={2} value={form.description_km} onChange={(e) => setForm({ ...form, description_km: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm mt-2 cursor-pointer">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Enabled for public
          </label>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="btn-gradient px-5 py-2 rounded-lg text-sm font-semibold"><Save size={16} className="inline mr-2" /> Save</button>
            <button onClick={() => { setShowForm(false); setForm(initialFormState); }} className="px-5 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {tools.map((tool: any) => (
          <div key={tool.id} className="card p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{tool.name_en}</h3>
                <button onClick={() => toggle(tool)} className="w-12 h-6 rounded-full transition-all relative" style={{ background: tool.enabled ? '#10b981' : 'var(--border-color)' }}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: tool.enabled ? '26px' : '2px' }} />
                </button>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{tool.description_en}</p>
              {tool.url && <a href={tool.url} target="_blank" className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{tool.url}</a>}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => startEdit(tool)} className="p-1.5 rounded hover:bg-blue-500/10" style={{ color: 'var(--primary)' }}><Edit size={16} /></button>
              <button onClick={() => del(tool)} className="p-1.5 rounded hover:bg-red-500/10" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatTab({ chatSettings, showToast, logAction }: any) {
  const [form, setForm] = useState(chatSettings);
  const [questionsText, setQuestionsText] = useState((chatSettings.suggested_questions || []).join('\n'));

  const save = async () => {
    const questions = questionsText.split('\n').map((s: string) => s.trim()).filter(Boolean);
    const { error } = await supabase.from('chat_settings').update({ ...form, suggested_questions: questions, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) { showToast('Save failed', 'error'); return; }
    await logAction('UPDATE', 'Updated chat assistant settings');
    showToast('Chat settings saved!');
  };

  return (
    <div className="card p-5 max-w-2xl">
      <h2 className="text-lg font-bold mb-4">Chat Assistant Settings</h2>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Enable Chatbot</label>
        <Field label="Bot Name (EN)"><input className="form-input" value={form.bot_name_en} onChange={(e) => setForm({ ...form, bot_name_en: e.target.value })} /></Field>
        <Field label="Bot Name (KM)"><input className="form-input" value={form.bot_name_km} onChange={(e) => setForm({ ...form, bot_name_km: e.target.value })} /></Field>
        <Field label="Welcome Message (EN)"><textarea className="form-input" rows={2} value={form.welcome_en} onChange={(e) => setForm({ ...form, welcome_en: e.target.value })} /></Field>
        <Field label="Welcome Message (KM)"><textarea className="form-input" rows={2} value={form.welcome_km} onChange={(e) => setForm({ ...form, welcome_km: e.target.value })} /></Field>
        <Field label="Suggested Questions (one per line)"><textarea className="form-input" rows={5} value={questionsText} onChange={(e) => setQuestionsText(e.target.value)} /></Field>
      </div>
      <button onClick={save} className="btn-gradient px-5 py-2 rounded-lg text-sm font-semibold mt-4 flex items-center gap-2"><Save size={16} /> Save Settings</button>
    </div>
  );
}

function SecurityTab({ session, logs }: any) {
  const recentLogins = logs.filter((l: any) => l.action === 'LOGIN' || l.action === 'LOGOUT').slice(0, 10);

  return (
    <div className="max-w-2xl">
      <div className="card p-5 mb-4">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Shield size={18} style={{ color: 'var(--primary)' }} /> Security Status</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Login Status</span><span style={{ color: '#10b981' }}>Authenticated</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Session</span><span className="truncate ml-4 max-w-[200px]">{session?.user?.email || 'N/A'}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Auth Method</span><span>Email/Password</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>RLS Protection</span><span style={{ color: '#10b981' }}>Enabled</span></div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-bold mb-3">Recent Login Activity</h3>
        {recentLogins.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No recent activity.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentLogins.map((log: any) => (
              <div key={log.id} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-semibold">{log.action}</span>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LogsTab({ logs }: any) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead style={{ background: 'var(--bg-surface)' }}>
          <tr>
            <th className="text-left p-3 font-semibold">Action</th>
            <th className="text-left p-3 font-semibold">Details</th>
            <th className="text-left p-3 font-semibold hidden sm:table-cell">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 && (
            <tr><td colSpan={3} className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>No activity recorded yet.</td></tr>
          )}
          {logs.map((log: any) => (
            <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--primary)' }}>{log.action}</span></td>
              <td className="p-3">{log.details}</td>
              <td className="p-3 hidden sm:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card p-5">
      <div className="text-2xl font-extrabold mb-1" style={{ color }}>{value.toLocaleString()}</div>
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}