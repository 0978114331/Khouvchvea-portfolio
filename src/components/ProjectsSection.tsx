import { useState, useEffect, useRef } from 'react';
import { Eye, Heart, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import type { Project, Stats } from '@/lib/supabase';

type Props = {
  projects: Project[];
  stats: Record<string, Stats>;
  onImageView: (itemId: string, images: string[], index: number) => void;
  onLike: (itemId: string, increment: boolean) => void;
};

export function ProjectsSection({ projects, stats, onImageView, onLike }: Props) {
  const { lang, t } = useApp();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [localViews, setLocalViews] = useState<Record<string, number>>({});
  
  const [likedItems, setLikedItems] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('likedProjects');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });
  const initialShow = 3;

  const publishedProjects = projects.filter((p) => p.published);

  const filtered = filter === 'all'
    ? publishedProjects
    : publishedProjects.filter((p) => p.category === filter);

  const visibleProjects = expanded ? filtered : filtered.slice(0, initialShow);

  const filterTabs = [
    { id: 'all', label: 'All Projects', labelKm: 'គម្រោងទាំងអស់' },
    { id: 'frontend', label: 'Frontend', labelKm: 'ផ្នែកខាងមុខ' },
    { id: 'ui', label: 'UI Design', labelKm: 'ការរចនា UI' },
    { id: 'fullstack', label: 'Fullstack', labelKm: 'ហ្វូលស្ដាក' },
  ];

  const handleImageClick = (itemId: string, images: string[], index: number) => {
    if (images.length > 0) {
      onImageView(itemId, images, index);
      if (!localViews[itemId]) {
        setLocalViews(prev => ({ ...prev, [itemId]: 1 }));
      }
    }
  };

  const toggleLike = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
      onLike(itemId, false);
    } else {
      newLiked.add(itemId);
      onLike(itemId, true);
    }
    setLikedItems(newLiked);
    localStorage.setItem('likedProjects', JSON.stringify([...newLiked]));
  };

  return (
    <section id="projects" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <Reveal>
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
            {t('Portfolio', 'ផតហ្វូលលីយ៉ូ')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">{t('Featured Works', 'ការងារលេចធ្លោ')}</h2>
        </div>
      </Reveal>

      <Reveal>
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id);
                setExpanded(false);
              }}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300"
              style={
                filter === tab.id
                  ? { background: 'var(--gradient-accent)', border: 'none', color: 'white' }
                  : { background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }
              }
            >
              {lang === 'km' ? tab.labelKm : tab.label}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleProjects.map((project) => {
          const itemId = `project_${project.id}`;
          const stat = stats[itemId];
          const isLiked = likedItems.has(itemId);
          const displayViews = (stat?.views || 0) + (localViews[itemId] || 0);

          return (
            <Reveal key={project.id}>
              <ProjectCard
                project={project}
                lang={lang}
                views={displayViews}
                likes={stat?.likes || 0}
                isLiked={isLiked}
                t={t}
                onImageView={() => handleImageClick(itemId, project.images || [], 0)}
                onLike={(e: any) => toggleLike(e, itemId)}
              />
            </Reveal>
          );
        })}
      </div>

      {filtered.length > initialShow && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2.5 px-10 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
          >
            {expanded ? (
              <>{t('See Less', 'មើលតិច')} <ChevronUp size={16} /></>
            ) : (
              <>{t('See More', 'មើលបន្ថែម')} <ChevronDown size={16} /></>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

function ProjectCard({ project, lang, views, likes, isLiked, t, onImageView, onLike }: any) {
  const images = project.images || [];
  const [sliderIdx, setSliderIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setSliderIdx((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length]);

  return (
    <div className="card card-hover overflow-hidden flex flex-col h-full">
      <div
        className="h-36 sm:h-44 overflow-hidden relative cursor-pointer"
        onClick={onImageView}
      >
        {images.length === 0 ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
          >
            <ExternalLink size={32} className="text-white opacity-50" />
          </div>
        ) : (
          images.map((img: string, i: number) => (
            <img
              key={i}
              src={img}
              alt=""
              className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-800"
              style={{ opacity: i === sliderIdx ? 1 : 0 }}
            />
          ))
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--primary)' }}>
          {lang === 'km' ? project.category_label_km || project.category_label_en : project.category_label_en}
        </span>
        <h3 className="text-lg font-bold mb-2 leading-tight">
          {lang === 'km' ? project.title_km || project.title_en : project.title_en}
        </h3>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4 flex-grow line-clamp-3">
          {lang === 'km' ? project.description_km || project.description_en : project.description_en}
        </p>
        <div className="flex gap-2 flex-wrap mb-4">
          {project.tags.split(',').filter(Boolean).map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 rounded text-xs font-semibold"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
            >
              {tag.trim()}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <a
            href={project.project_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-md text-xs font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'var(--primary)' }}
          >
            {t('View Project', 'មើលគម្រោង')}
          </a>
          <div className="flex gap-3 text-sm text-[var(--text-muted)] items-center">
            <span className="inline-flex items-center gap-1.5">
              <Eye size={14} /> {views.toLocaleString()}
            </span>
            <button
              onClick={onLike}
              className="inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{ color: isLiked ? '#f43f5e' : undefined }}
            >
              <Heart size={14} fill={isLiked ? '#f43f5e' : 'none'} /> {likes.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}