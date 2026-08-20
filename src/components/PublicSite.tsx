import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { SkillsSection } from '@/components/SkillsSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { DocumentsSection } from '@/components/DocumentsSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { Lightbox } from '@/components/Lightbox';
import { ChatAssistant } from '@/components/ChatAssistant';
import { ConverterModal } from '@/components/ConverterModal';
import { OcrModal } from '@/components/OcrModal';
import { usePortfolioData } from '@/lib/use-portfolio-data';

type Props = {
  onAdminClick: () => void;
};

export function PublicSite({ onAdminClick }: Props) {
  const {
    settings, hero, about, skillCategories, projects, documents, tools,
    chatSettings, visitorCount, stats, loading,
    incrementView, toggleLike,
  } = usePortfolioData();

  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [converterOpen, setConverterOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);

  // កែប្រែ: បន្ថែម itemId ដើម្បីដំណើរការការបូកចំនួនអ្នកមើល
  const handleImageView = (itemId: string, images: string[], index: number) => {
    if (images.length > 0) {
      setLightbox({ images, index });
      incrementView(itemId); // <== បូកចំនួនអ្នកមើលពេលចុចកាត
    }
  };

  const handleToolClick = (toolId: string) => {
    if (toolId === 'converter') setConverterOpen(true);
    if (toolId === 'ocr') setOcrOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 mx-auto mb-4 animate-spin" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border-color)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (settings?.maintenance_mode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center max-w-md">
          <div className="glow-blob glow-1" />
          <div className="glow-blob glow-2" />
          <h1 className="text-3xl font-extrabold mb-4 gradient-text">Under Maintenance</h1>
          <p className="text-[var(--text-muted)]">{settings.maintenance_message_en}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-main)' }}>
      <div className="glow-blob glow-1" />
      <div className="glow-blob glow-2" />

      <Navbar onAdminClick={onAdminClick} />

      {hero && <HeroSection hero={hero} visitorCount={visitorCount || 0} />}

      {about && <AboutSection about={about} visitorCount={visitorCount || 0} onToolClick={handleToolClick} />}

      {about && (
        <section id="documents" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <DocumentsSection documents={documents || []} stats={stats || {}} onImageView={handleImageView} onLike={toggleLike} />
        </section>
      )}

      <SkillsSection categories={skillCategories || []} />

      <ProjectsSection projects={projects || []} stats={stats || {}} onImageView={handleImageView} onLike={toggleLike} />

      <ContactSection settings={settings} />

      <Footer settings={settings} visitorCount={visitorCount || 0} />

      <ChatAssistant chatSettings={chatSettings} hero={hero} about={about} skillCategories={skillCategories || []} projects={projects || []} documents={documents || []} tools={tools || []} />

      {lightbox && <Lightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />}
      <ConverterModal open={converterOpen} onClose={() => setConverterOpen(false)} />
      <OcrModal open={ocrOpen} onClose={() => setOcrOpen(false)} />
    </div>
  );
}