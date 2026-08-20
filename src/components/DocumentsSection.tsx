import { useState, useEffect, useRef } from 'react';
import { Eye, Heart, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import type { Document, Stats } from '@/lib/supabase';

type Props = {
  documents: Document[];
  stats: Record<string, Stats>;
  onImageView: (itemId: string, images: string[], index: number) => void;
  onLike: (itemId: string, increment: boolean) => void;
};

export function DocumentsSection({ documents, stats, onImageView, onLike }: Props) {
  const { lang, t } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [localViews, setLocalViews] = useState<Record<string, number>>({});

  const [likedItems, setLikedItems] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('likedDocs');
    return new Set(stored ? JSON.parse(stored) : []);
  });
  const initialShow = 4;

  const publishedDocs = documents.filter((d) => d.published);
  const visibleDocs = expanded ? publishedDocs : publishedDocs.slice(0, initialShow);

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
    localStorage.setItem('likedDocs', JSON.stringify([...newLiked]));
  };

  return (
    <div className="mt-10">
      <Reveal>
        <h3 className="text-xl sm:text-2xl font-extrabold text-center mb-8">
          {t('My Journey & Achievements', 'ដំណើររបស់ខ្ញុំ និង សមិទ្ធិផល')}
        </h3>
      </Reveal>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        {visibleDocs.map((doc) => {
          const itemId = `doc_${doc.id}`;
          const stat = stats[itemId];
          const isLiked = likedItems.has(itemId);
          const displayViews = (stat?.views || 0) + (localViews[itemId] || 0);

          return (
            <Reveal key={doc.id}>
              <DocCard 
                doc={doc} 
                images={doc.images || []} 
                views={displayViews}
                likes={stat?.likes || 0}
                isLiked={isLiked} 
                lang={lang} 
                onImageView={() => handleImageClick(itemId, doc.images || [], 0)} 
                onLike={(e: any) => toggleLike(e, itemId)} 
              />
            </Reveal>
          );
        })}
      </div>

      {publishedDocs.length > initialShow && (
        <div className="flex justify-center mt-8">
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
    </div>
  );
}

function DocCard({ doc, images, views, likes, isLiked, lang, onImageView, onLike }: any) {
  const [sliderIdx, setSliderIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setSliderIdx((prev: number) => (prev + 1) % images.length);
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images.length]);

  const handleDownload = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url; link.download = doc.title_en; link.target = '_blank';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="card card-hover overflow-hidden flex flex-col h-full">
      <div
        className="h-24 sm:h-40 overflow-hidden relative cursor-pointer"
        onClick={onImageView}
      >
        {images.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
            <Download size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          images.map((img: string, i: number) => (
            <img
              key={i} src={img} alt=""
              className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-800"
              style={{ opacity: i === sliderIdx ? 1 : 0 }}
            />
          ))
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="flex flex-col gap-1 sm:gap-1.5 flex-grow">
          {doc.date_label && (
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">{doc.date_label}</p>
          )}
          <h6 className="text-[11px] sm:text-sm font-bold leading-tight line-clamp-2" style={{ color: '#4f7dcc' }}>
            {lang === 'km' ? doc.title_km || doc.title_en : doc.title_en}
          </h6>
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2 sm:line-clamp-3">
            {lang === 'km' ? doc.description_km || doc.description_en : doc.description_en}
          </p>
        </div>

        <div className="flex justify-between items-center mt-2 sm:mt-3">
          <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-sm text-[var(--text-muted)] items-center">
            <span className="inline-flex items-center gap-1">
              <Eye size={12} className="sm:w-[14px] sm:h-[14px]" /> {views.toLocaleString()}
            </span>
            <button
              onClick={onLike}
              className="inline-flex items-center gap-1 cursor-pointer transition-colors"
              style={{ color: isLiked ? '#f43f5e' : undefined }}
            >
              <Heart size={12} className="sm:w-[14px] sm:h-[14px]" fill={isLiked ? '#f43f5e' : 'none'} /> {likes.toLocaleString()}
            </button>
          </div>
          {images.length > 0 && (
            <button
              onClick={(e) => handleDownload(e, images[0])}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}
            >
              <Download size={12} className="sm:w-[14px] sm:h-[14px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}