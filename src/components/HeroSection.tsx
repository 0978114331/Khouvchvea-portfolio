import { useEffect, useState } from 'react';
import { Compass, MessageCircle, ChevronDown } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { Hero } from '@/lib/supabase';

export function HeroSection({ hero, visitorCount }: { hero: Hero; visitorCount: number }) {
  const { lang, t } = useApp();
  const [typed, setTyped] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isBackspacing, setIsBackspacing] = useState(false);

  const phrases = hero.typing_phrases || [];

  useEffect(() => {
    if (phrases.length === 0) return;
    const current = phrases[phraseIdx] || '';

    if (!isBackspacing && charIdx < current.length) {
      const timeout = setTimeout(() => { setTyped(current.substring(0, charIdx + 1)); setCharIdx(charIdx + 1); }, 100);
      return () => clearTimeout(timeout);
    }

    if (!isBackspacing && charIdx === current.length) {
      const timeout = setTimeout(() => setIsBackspacing(true), 1800);
      return () => clearTimeout(timeout);
    }

    if (isBackspacing && charIdx > 0) {
      const timeout = setTimeout(() => { setTyped(current.substring(0, charIdx - 1)); setCharIdx(charIdx - 1); }, 40);
      return () => clearTimeout(timeout);
    }

    if (isBackspacing && charIdx === 0) {
      const timeout = setTimeout(() => { setIsBackspacing(false); setPhraseIdx((phraseIdx + 1) % phrases.length); }, 400);
      return () => clearTimeout(timeout);
    }
  }, [charIdx, isBackspacing, phraseIdx, phrases]);

  const name = lang === 'km' ? 'ឃូវ ជ្វា' : 'Khouv Chvea';
  const desc = lang === 'km' ? hero.description_km : hero.description_en;
  const badge = lang === 'km' ? hero.status_badge_km || hero.status_badge_en : hero.status_badge_en;
  const primaryBtn = lang === 'km' ? hero.primary_btn_km || hero.primary_btn_en : hero.primary_btn_en;
  const secondaryBtn = lang === 'km' ? hero.secondary_btn_km || hero.secondary_btn_en : hero.secondary_btn_en;

  return (
    <section id="home" className="visible min-h-[90vh] flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 max-w-[1240px] mx-auto px-4 sm:px-8 pt-28 pb-16">
      
      <div className="flex-1 animate-fade-left flex flex-col items-center lg:items-start text-center lg:text-left w-full z-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm"
          style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--primary)' }} />
          {badge}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.2] mb-4 tracking-tight flex flex-wrap items-center justify-center lg:justify-start gap-x-3 sm:gap-x-4">
          <span style={{ color: 'var(--text-main)' }}>{t('Hi, I am', 'សួស្តី, ខ្ញុំគឺ')}</span>
          <span 
            style={{ 
              background: 'linear-gradient(to right, #c4b5fd, #7e22ce)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0px 0px 35px rgba(147, 51, 234, 0.45)',
              textTransform: 'none', 
              letterSpacing: 'normal',
              paddingBottom: '0.1em'
            }}
          >
            {name}
          </span>
        </h1>

        <div className="flex items-center justify-center lg:justify-start gap-2 text-lg sm:text-2xl font-semibold mb-6 w-full">
          <span>{t('I build', 'ខ្ញុំបង្កើត')}</span>
          <span className="font-bold" style={{ color: 'var(--primary)' }}>{typed}</span>
          <span className="animate-blink" style={{ color: 'var(--primary)' }}>|</span>
        </div>

        <p className="text-[var(--text-muted)] leading-relaxed mb-8 max-w-[540px] text-sm sm:text-base">
          {desc}
        </p>

        <div className="flex gap-3 sm:gap-5 justify-center lg:justify-start w-full">
          <a href={hero.primary_btn_url} className="btn-gradient inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm">
            <Compass size={16} /> {primaryBtn}
          </a>
          <a href={hero.secondary_btn_url} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', background: 'var(--bg-surface)' }}>
            <MessageCircle size={16} /> {secondaryBtn}
          </a>
        </div>
      </div>

      <div className="flex flex-1 justify-center animate-fade-right relative w-full mt-8 lg:mt-0 z-0">
        <div className="animate-float max-w-[320px] sm:max-w-[420px]" style={{ filter: 'drop-shadow(0 30px 50px rgba(59,130,246,0.3))' }}>
          <img
            src={hero.profile_image_url}
            alt={name}
            className="w-full h-auto object-contain"
            style={{ maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)' }}
          />
        </div>
      </div>

      <a href="#about" className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[var(--text-muted)] text-xs font-bold tracking-wider no-underline z-20">
        {t('', '')}
        <ChevronDown size={16} className="animate-bounce-icon" />
      </a>
    </section>
  );
}