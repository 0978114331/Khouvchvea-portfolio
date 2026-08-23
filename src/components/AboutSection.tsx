import { FileText, Languages, Wrench, Link as LinkIcon, Zap, QrCode, Image as ImageIcon, Archive, Brain, GraduationCap, BookOpen, Library, Lightbulb, Code, Layers, type LucideIcon } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import type { About, Tool } from '@/lib/supabase';

const iconMap: Record<string, LucideIcon> = {
  'file-pdf': FileText,
  'language': Languages,
  'zap': Zap,
  'link': LinkIcon,
  'wrench': Wrench,
  'qrcode': QrCode,
  'image': ImageIcon,
  'archive': Archive,
  'brain': Brain,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  'library': Library,
  'lightbulb': Lightbulb,
  'code': Code,
  'layers': Layers
};

type Props = {
  about: About;
  tools: Tool[];
  visitorCount: number;
  onToolClick: (tool: Tool) => void;
};

export function AboutSection({ about, tools, visitorCount, onToolClick }: Props) {
  const { lang, t } = useApp();
  
  const title = lang === 'km' ? (about as any).title_km || about.title_en : about.title_en;
  const heading = lang === 'km' ? (about as any).heading_km || about.heading_en : about.heading_en;
  const p1 = lang === 'km' ? (about as any).paragraph1_km || about.paragraph1_en : about.paragraph1_en;
  const p2 = lang === 'km' ? (about as any).paragraph2_km || about.paragraph2_en : about.paragraph2_en;

  const activeTools = tools.filter((t) => t.enabled);
  
  const hasQrTool = activeTools.some(t => t.name_en.toLowerCase().includes('qr') || (t as any).icon === 'qrcode');
  if (!hasQrTool) {
    activeTools.push({
      id: 'default-qr-tool',
      name_en: 'Custom QR Generator',
      name_km: 'ឧបករណ៍បង្កើត QR Code',
      description_en: 'Create beautiful QR codes with custom colors and logos.',
      description_km: 'បង្កើតកូដ QR តាមបំណងជាមួយនឹងការប្តូរពណ៌ និងដាក់រូបសញ្ញា។',
      icon: 'qrcode',
      enabled: true
    } as any);
  }

  const hasVaultTool = activeTools.some(t => t.name_en.toLowerCase().includes('vault') || (t as any).icon === 'archive');
  if (!hasVaultTool) {
    activeTools.push({
      id: 'default-vault-tool',
      name_en: 'My Vault',
      name_km: 'ឃ្លាំងឯកសារ',
      description_en: 'Access my shared notes, important links, and documents.',
      description_km: 'ចូលមើលកំណត់ត្រា តំណភ្ជាប់ និងឯកសារដែលខ្ញុំបានចែករំលែក។',
      icon: 'archive',
      enabled: true
    } as any);
  }

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
            <p className="text-[var(--text-muted)] leading-relaxed mb-6 text-sm sm:text-base text-justify" style={{ textJustify: 'inter-word' }}>{p1}</p>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm sm:text-base text-justify" style={{ textJustify: 'inter-word' }}>{p2}</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 mb-2">
              <a href="#projects" className="card card-hover p-4 sm:p-6 text-center cursor-pointer block no-underline transition-all">
                <div className="text-xl sm:text-2xl font-extrabold gradient-text mb-1">{about.projects_completed}</div>
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] leading-tight">
                  {t('Projects Completed', 'គម្រោងបានបញ្ចប់')}
                </div>
              </a>
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

            {activeTools.map((tool, i) => {
              const iconKey = (tool as any).icon?.toLowerCase() || 'zap';
              const Icon = iconMap[iconKey] || Wrench;
              return (
                <div
                  key={tool.id}
                  onClick={() => onToolClick(tool)}
                  className="card card-hover p-5 flex gap-4 items-center cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: i % 2 === 0 ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)', color: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)' }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-0.5">{lang === 'km' ? (tool as any).name_km || tool.name_en : tool.name_en}</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed text-justify" style={{ textJustify: 'inter-word' }}>{lang === 'km' ? (tool as any).description_km || tool.description_en : tool.description_en}</p>
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