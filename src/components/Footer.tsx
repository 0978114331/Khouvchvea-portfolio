import { useState, useEffect } from 'react';
import { Eye, Github, Mail, Send, Facebook, Youtube } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { SiteSettings } from '@/lib/supabase';

type Props = {
  settings: SiteSettings | null;
  visitorCount: number;
};

export function Footer({ settings, visitorCount }: Props) {
  const { lang, t } = useApp();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      const sections = ['home', 'about', 'documents', 'skills', 'projects', 'contact'];
      let current = 'home';
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 150) current = id;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home', labelKm: 'ទំព័រដើម' },
    { id: 'about', label: 'About', labelKm: 'អំពីខ្ញុំ' },
    { id: 'documents', label: 'Journey', labelKm: 'សមិទ្ធិផល' },
    { id: 'skills', label: 'Skills', labelKm: 'ជំនាញ' },
    { id: 'projects', label: 'Projects', labelKm: 'គម្រោង' },
    { id: 'contact', label: 'Contact', labelKm: 'ទំនាក់ទំនង' },
  ];

  return (
    <footer
      className="pt-16 pb-8 px-6 text-sm font-medium mt-auto"
      style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
    >
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-10 mb-12">
        
        <div className="flex flex-col items-center md:items-start gap-4">
          <a 
            href="#home" 
            onClick={(e) => handleNavClick(e, 'home')}
            className="text-2xl font-extrabold flex items-center tracking-tight transition-transform hover:scale-105"
          >
            <span style={{ color: 'var(--text-main)' }}>KHOUV</span>
            <span className="gradient-text ml-1" style={{ paddingRight: '2px' }}>CHVEA</span>
          </a>
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold shadow-sm"
            style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <Eye size={16} /> {t('Total Visitors:', 'ភ្ញៀវសរុប:')} {visitorCount.toLocaleString()}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="font-bold mb-4 uppercase tracking-widest text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('Quick Links', 'តំណភ្ជាប់រហ័ស')}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 max-w-[400px]">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5"
                style={{ 
                  color: activeSection === link.id ? 'var(--primary)' : 'var(--text-main)',
                  textShadow: activeSection === link.id ? '0 0 10px rgba(59,130,246,0.3)' : 'none'
                }}
              >
                {lang === 'km' ? link.labelKm : link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-4">
          <p className="font-bold uppercase tracking-widest text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('Connect', 'ភ្ជាប់ទំនាក់ទំនង')}
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4">
            
           {/* Facebook Icon */}
            <a 
              href="https://www.facebook.com/Chvea" 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: '#1877F2' }}
              title="Facebook"
            >
              <Facebook size={18} />
            </a>

            {/* YouTube Icon */}
            <a 
              href="https://www.youtube.com/@khouvchvea" 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: '#FF0000' }}
              title="YouTube"
            >
              <Youtube size={18} />
            </a>


            {/* Telegram Icon */}
            {settings?.telegram_url && (
              <a 
                href={settings.telegram_url} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: '#0088cc' }}
                title="Telegram"
              >
                <Send size={18} />
              </a>
            )}

            {/* GitHub Icon */}
            {settings?.github_url && (
              <a 
                href={settings.github_url} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                title="GitHub"
              >
                <Github size={18} />
              </a>
            )}

            {/* Email Icon */}
            {settings?.email && (
              <a 
                href={`mailto:${settings.email}`} 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: '#ea4335' }}
                title="Email"
              >
                <Mail size={18} />
              </a>
            )}

          </div>
        </div>

      </div>

      <div 
        className="max-w-[1240px] mx-auto text-center pt-8 text-xs sm:text-sm font-semibold tracking-wide" 
        style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
      >
        <p>{settings?.footer_text || '© 2026 KHOUV Chvea. All rights reserved.'}</p>
      </div>
    </footer>
  );
}