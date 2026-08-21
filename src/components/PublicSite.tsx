import { useState, useEffect } from 'react';
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
import { QrGeneratorModal } from '@/components/QrGeneratorModal';
import { usePortfolioData } from '@/lib/use-portfolio-data';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Tool } from '@/lib/supabase';

type Props = {
  onAdminClick: () => void;
};

export function PublicSite({ onAdminClick }: Props) {
  const { session } = useAuth();
  
  const {
    settings, hero, about, skillCategories, projects, documents, tools,
    chatSettings, visitorCount, stats,
    incrementView, toggleLike, refetch
  } = usePortfolioData();

  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [converterOpen, setConverterOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('public-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          if (refetch) {
            refetch();
          } else {
            window.location.reload();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleImageView = (itemId: string, images: string[], index: number) => {
    if (images.length > 0) {
      setLightbox({ images, index });
      incrementView(itemId);
    }
  };

  const handleToolClick = (tool: Tool) => {
    const toolName = tool.name_en.toLowerCase();
    const toolIcon = (tool as any).icon?.toLowerCase() || '';

    if (toolName.includes('pdf') || toolName.includes('convert') || toolIcon.includes('pdf')) {
      setConverterOpen(true);
    } else if (toolName.includes('ocr') || toolName.includes('extract') || toolIcon.includes('language')) {
      setOcrOpen(true);
    } else if (toolName.includes('qr') || toolIcon.includes('qrcode')) {
      setQrOpen(true);
    } else if ((tool as any).url) {
      window.open((tool as any).url, '_blank');
    }
  };

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

      <Navbar onAdminClick={session ? onAdminClick : undefined} />

      {hero && <HeroSection hero={hero} visitorCount={visitorCount || 0} />}

      {about && <AboutSection about={about} tools={tools || []} visitorCount={visitorCount || 0} onToolClick={handleToolClick} />}

      {about && (
        <section id="documents" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <DocumentsSection 
            documents={documents || []} 
            stats={stats || {}} 
            onImageView={handleImageView} 
            onLike={toggleLike} 
          />
        </section>
      )}

      <SkillsSection categories={skillCategories || []} />

      <ProjectsSection 
        projects={projects || []} 
        stats={stats || {}} 
        onImageView={handleImageView} 
        onLike={toggleLike} 
      />

      <ContactSection settings={settings} />

      <Footer settings={settings} visitorCount={visitorCount || 0} />

      <ChatAssistant 
        chatSettings={chatSettings} 
        hero={hero} 
        about={about} 
        skillCategories={skillCategories || []} 
        projects={projects || []} 
        documents={documents || []} 
        tools={tools || []} 
      />

      {lightbox && (
        <Lightbox 
          images={lightbox.images} 
          index={lightbox.index} 
          onClose={() => setLightbox(null)} 
        />
      )}
      
      <ConverterModal open={converterOpen} onClose={() => setConverterOpen(false)} />
      <OcrModal open={ocrOpen} onClose={() => setOcrOpen(false)} />
      <QrGeneratorModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}