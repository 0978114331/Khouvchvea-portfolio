import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

type Props = {
  images: string[];
  index: number;
  onClose: () => void;
};

export function Lightbox({ images, index, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(index);

  useEffect(() => {
    setCurrentIndex(index);
  }, [index]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'auto';
    };
  });

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleDownload = () => {
    const url = images[currentIndex];
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'downloaded_image';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-8 text-white text-4xl font-bold opacity-70 hover:opacity-100 transition-all"
        style={{ zIndex: 100001 }}
      >
        <X size={36} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-5 sm:left-10 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100000 }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-5 sm:right-10 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100000 }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div className="flex flex-col items-center gap-5 max-w-[85%]" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt="Gallery View"
          className="max-w-full max-h-[75vh] rounded-xl"
          style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.6)', objectFit: 'contain' }}
        />
        <button
          onClick={handleDownload}
          className="btn-gradient inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold"
        >
          <Download size={16} /> Download This Image
        </button>
      </div>
    </div>
  );
}
