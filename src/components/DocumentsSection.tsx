import { useState, useEffect } from 'react';
import { Eye, Heart, ChevronDown, ChevronUp, Share2, Clock, X, FileText, Facebook, Youtube } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import type { Document, Stats } from '@/lib/supabase';

type Props = {
  documents: Document[];
  stats: Record<string, Stats>;
  onImageView: (itemId: string, images: string[], index: number) => void;
  onLike: (itemId: string, increment: boolean) => void;
};

const formatDate = (dateString: string | undefined, fallback: string | undefined, lang: string) => {
  const targetDate = dateString || fallback;
  if (!targetDate) return lang === 'km' ? 'ថ្មីៗនេះ' : 'Recent';
  try {
    const date = new Date(targetDate);
    if (isNaN(date.getTime())) return targetDate;
    if (lang === 'km') {
      const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      const days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
      return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return targetDate;
  }
};

export function DocumentsSection({ documents, stats, onImageView, onLike }: Props) {
  const { lang, t } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [localViews, setLocalViews] = useState<Record<string, number>>({});
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const [likedItems, setLikedItems] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('likedDocs');
    return new Set(stored ? JSON.parse(stored) : []);
  });
  
  const initialShow = 4;
  const publishedDocs = documents.filter((d) => d.published);
  const visibleDocs = expanded ? publishedDocs : publishedDocs.slice(0, initialShow);

  const handleCardClick = (doc: Document, itemId: string) => {
    setSelectedDoc(doc);
    const currentDbViews = stats[itemId]?.views || 0;
    setLocalViews(prev => ({ 
      ...prev, 
      [itemId]: Math.max(prev[itemId] || 0, currentDbViews) + 1 
    }));
    onImageView(itemId, doc.images || [], 0);
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
          
          const currentDbViews = stat?.views || 0;
          const displayViews = Math.max(currentDbViews, localViews[itemId] || 0);

          return (
            <Reveal key={doc.id}>
              <DocThumbnailCard 
                doc={doc} 
                images={doc.images || []} 
                views={displayViews}
                likes={stat?.likes || 0}
                isLiked={isLiked} 
                lang={lang} 
                onClick={() => handleCardClick(doc, itemId)} 
                onLike={(e: any) => toggleLike(e, itemId)} 
              />
            </Reveal>
          );
        })}
      </div>

      {publishedDocs.length > initialShow && (
        <div className="flex justify-center mt-8 sm:mt-10">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2.5 px-8 sm:px-10 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
          >
            {expanded ? (
              <><ChevronUp size={18} /> {t('See Less', 'មើលតិច')}</>
            ) : (
              <><ChevronDown size={18} /> {t('See More', 'មើលបន្ថែម')}</>
            )}
          </button>
        </div>
      )}

      {selectedDoc && (
        <DocDetailModal 
          doc={selectedDoc}
          images={selectedDoc.images || []}
          lang={lang}
          views={Math.max(stats[`doc_${selectedDoc.id}`]?.views || 0, localViews[`doc_${selectedDoc.id}`] || 0)}
          likes={stats[`doc_${selectedDoc.id}`]?.likes || 0}
          isLiked={likedItems.has(`doc_${selectedDoc.id}`)}
          onLike={(e: any) => toggleLike(e, `doc_${selectedDoc.id}`)}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}

function DocThumbnailCard({ doc, images, views, likes, isLiked, lang, onClick, onLike }: any) {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: doc.title_en,
        text: doc.description_en,
        url: window.location.href,
      }).catch(console.error);
    }
  };

  const renderImageGrid = () => {
    if (images.length === 0) return <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-surface)' }}><FileText size={24} style={{ color: 'var(--text-muted)' }} /></div>;
    if (images.length === 1) return <img src={images[0]} className="w-full h-full object-cover" alt="" />;
    if (images.length === 2) return (
      <div className="flex w-full h-full gap-0.5">
        <img src={images[0]} className="w-1/2 h-full object-cover" alt="" />
        <img src={images[1]} className="w-1/2 h-full object-cover" alt="" />
      </div>
    );
    if (images.length === 3) return (
      <div className="flex w-full h-full gap-0.5">
        <img src={images[0]} className="w-1/2 h-full object-cover" alt="" />
        <div className="w-1/2 flex flex-col gap-0.5">
          <img src={images[1]} className="w-full h-1/2 object-cover" alt="" />
          <img src={images[2]} className="w-full h-1/2 object-cover" alt="" />
        </div>
      </div>
    );
    
    return (
      <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
        <img src={images[0]} className="w-full h-full object-cover" alt="" />
        <img src={images[1]} className="w-full h-full object-cover" alt="" />
        <img src={images[2]} className="w-full h-full object-cover" alt="" />
        <div className="relative w-full h-full">
          <img src={images[3]} className="w-full h-full object-cover" alt="" />
          {images.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-sm sm:text-lg">
              +{images.length - 4}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      onClick={onClick}
      className="rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col h-full cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{ background: 'var(--bg-card)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}
    >
      <div className="h-32 sm:h-48 w-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
        {renderImageGrid()}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="flex flex-col gap-0.5 flex-grow">
          <div className="flex items-center justify-between text-[9px] sm:text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1 sm:gap-1.5"><Clock size={10} className="sm:w-[12px] sm:h-[12px]" /> {formatDate(doc.created_at, doc.date_label, lang)}</span>
            <span className="flex items-center gap-1 sm:gap-1.5"><Eye size={10} className="sm:w-[12px] sm:h-[12px]" /> {views.toLocaleString()}</span>
          </div>
          
          <h4 className="text-xs sm:text-[15px] font-bold leading-snug line-clamp-2 mt-1" style={{ color: 'var(--text-main)', fontFamily: "'Siemreap', sans-serif" }}>
            {lang === 'km' ? doc.title_km || doc.title_en : doc.title_en}
          </h4>
          
          <p className="text-[10px] sm:text-sm leading-relaxed line-clamp-1 sm:line-clamp-2 mt-1 flex-grow" style={{ color: 'var(--text-muted)', fontFamily: "'Siemreap', sans-serif" }}>
            {lang === 'km' ? doc.description_km || doc.description_en : doc.description_en}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button 
            onClick={onLike} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-colors"
            style={{ 
              background: isLiked ? 'rgba(244,63,94,0.1)' : 'transparent', 
              color: isLiked ? '#f43f5e' : 'var(--text-muted)',
              border: isLiked ? '1px solid transparent' : '1px solid var(--border-color)'
            }}
          >
            <Heart size={12} className="sm:w-[14px] sm:h-[14px]" fill={isLiked ? 'currentColor' : 'none'} /> {likes > 0 ? likes : ''}
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href="https://www.facebook.com/Chvea" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="transition-colors hover:text-blue-500" style={{ color: 'var(--text-muted)' }}>
              <Facebook size={14} className="sm:w-[16px] sm:h-[16px]" />
            </a>
            <a href="https://www.youtube.com/@khouvchvea" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="transition-colors hover:text-red-500" style={{ color: 'var(--text-muted)' }}>
              <Youtube size={14} className="sm:w-[16px] sm:h-[16px]" />
            </a>
            <button onClick={handleShare} className="transition-colors hover:text-green-500" style={{ color: 'var(--text-muted)' }}>
              <Share2 size={14} className="sm:w-[16px] sm:h-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocDetailModal({ doc, images, lang, views, likes, isLiked, onLike, onClose }: any) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: doc.title_en,
        text: doc.description_en,
        url: window.location.href,
      }).catch(console.error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Siemreap&display=swap');
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <div 
        className="w-full sm:max-w-[500px] h-[85vh] rounded-3xl flex flex-col relative shadow-2xl overflow-hidden animate-fade-up"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-transform hover:scale-110"
        >
          <X size={16} />
        </button>

        <div className="w-full h-[45%] flex-shrink-0 overflow-y-auto hide-scrollbar border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          {images.length > 0 ? (
            <div className="flex flex-col w-full">
              {images.map((img: string, idx: number) => (
                <img key={idx} src={img} className="w-full h-auto object-cover block" alt="" />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center"><FileText size={48} style={{ color: 'var(--text-muted)' }} /></div>
          )}
        </div>

        <div className="w-full h-[55%] flex flex-col relative" style={{ background: 'var(--bg-card)' }}>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar p-5 pb-20">
            <div className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <Clock size={12} /> {formatDate(doc.created_at, doc.date_label, lang)}
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold mb-3 leading-snug" style={{ color: 'var(--text-main)', fontFamily: "'Siemreap', sans-serif" }}>
              {lang === 'km' ? doc.title_km || doc.title_en : doc.title_en}
            </h2>
            
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-muted)', fontFamily: "'Siemreap', sans-serif" }}>
              {lang === 'km' ? doc.description_km || doc.description_en : doc.description_en}
            </p>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-4 flex items-center gap-3 border-t backdrop-blur-md" style={{ background: 'rgba(var(--bg-card-rgb), 0.95)', borderColor: 'var(--border-color)' }}>
            
            <button 
              onClick={onLike} 
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all" 
              style={{ 
                background: isLiked ? '#fce7f3' : 'var(--bg-surface)', 
                color: isLiked ? '#e11d48' : 'var(--text-main)', 
                border: isLiked ? '1px solid #fbcfe8' : '1px solid var(--border-color)' 
              }}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /> 
              {isLiked ? `Liked (${likes})` : `Like (${likes})`}
            </button>

            <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              <Eye size={16} /> {views} Views
            </div>

            <button onClick={handleShare} className="w-[42px] h-[42px] flex-shrink-0 flex items-center justify-center rounded-xl transition-colors hover:opacity-80" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
              <Share2 size={18} />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}