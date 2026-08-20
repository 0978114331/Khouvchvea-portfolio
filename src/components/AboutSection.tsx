import { FileText, Languages, type LucideIcon } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import type { About } from '@/lib/supabase';

const iconMap: Record<string, LucideIcon> = {
  'file-pdf': FileText,
  language: Languages,
};

type Props = {
  about: About;
  visitorCount: number;
  onToolClick: (toolId: string) => void;
};

export function AboutSection({ about, visitorCount, onToolClick }: Props) {
  const { lang, t } = useApp();
  const title = lang === 'km' ? about.title_km : about.title_en;
  const heading = lang === 'km' ? about.heading_km || about.heading_en : about.heading_en;
  const p1 = lang === 'km' ? about.paragraph1_km || about.paragraph1_en : about.paragraph1_en;
  const p2 = lang === 'km' ? about.paragraph2_km || about.paragraph2_en : about.paragraph2_en;

  return (
    <section id="about" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <Reveal>
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
            {t('About Me', 'អំពីខ្ញុំ')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">{title}</h2>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        <Reveal>
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-6">{heading}</h3>
            <p className="text-[var(--text-muted)] leading-relaxed mb-6 text-sm sm:text-base">{p1}</p>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm sm:text-base">{p2}</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 mb-2">
              {/* ទី២: ភ្ជាប់ Link ទៅកាន់ #projects */}
              <a href="#projects" className="card card-hover p-4 sm:p-6 text-center cursor-pointer block no-underline transition-all">
                <div className="text-xl sm:text-2xl font-extrabold gradient-text mb-1">{about.projects_completed}</div>
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] leading-tight">
                  {t('Projects Completed', 'គម្រោងបានបញ្ចប់')}
                </div>
              </a>
              {/* ទី២: ភ្ជាប់ Link ទៅកាន់ #skills */}
              <a href="#skills" className="card card-hover p-4 sm:p-6 text-center cursor-pointer block no-underline transition-all">
                <div className="text-xl sm:text-2xl font-extrabold gradient-text mb-1">{about.years_learning}</div>
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] leading-tight">
                  {t('Years Learning', 'ឆ្នាំនៃការរៀន')}
                </div>
              </a>
              <div className="card card-hover p-4 sm:p-6 text-center block transition-all">
                <div className="text-xl sm:text-2xl font-extrabold gradient-text mb-1">
                  {visitorCount.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] leading-tight">
                  {t('Total Visitors', 'ភ្ញៀវសរុប')}
                </div>
              </div>
            </div>

            {(about.feature_cards || []).map((card, i) => {
              const Icon = iconMap[card.icon] || FileText;
              return (
                <div
                  key={i}
                  onClick={() => onToolClick(card.icon === 'file-pdf' ? 'converter' : 'ocr')}
                  className="card card-hover p-5 flex gap-4 items-center cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: i === 0 ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)', color: i === 0 ? 'var(--primary)' : 'var(--secondary)' }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-0.5">{lang === 'km' ? card.title_km || card.title_en : card.title_en}</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{lang === 'km' ? card.desc_km || card.desc_en : card.desc_en}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}