import { Laptop, Wrench, type LucideIcon } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import type { SkillCategory } from '@/lib/supabase';

const iconMap: Record<string, LucideIcon> = {
  'laptop-code': Laptop,
  'screwdriver-wrench': Wrench,
};

export function SkillsSection({ categories }: { categories: SkillCategory[] }) {
  const { lang, t } = useApp();

  return (
    <section id="skills" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <Reveal>
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
            {t('Skills', 'ជំនាញ')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">{t('My Tech Arsenal', 'បណ្ណាសារបច្ចេកវិទ្យារបស់ខ្ញុំ')}</h2>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Laptop;
          return (
            <Reveal key={cat.id}>
              <div className="card p-6 sm:p-10">
                <div className="flex items-center gap-3 mb-8 text-lg font-bold">
                  <Icon size={20} style={{ color: 'var(--primary)' }} />
                  <span>{lang === 'km' ? cat.title_km || cat.title_en : cat.title_en}</span>
                </div>
                <div className="flex flex-col gap-6">
                  {(cat.skills || []).map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-sm font-semibold mb-2">
                        <span>{lang === 'km' ? skill.name_km || skill.name_en : skill.name_en}</span>
                        <span>{skill.percentage}%</span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--border-color)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${skill.percentage}%`, background: 'var(--gradient-accent)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
