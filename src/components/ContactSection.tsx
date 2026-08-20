import { useState } from 'react';
import { Mail, MapPin, Github, Send, type LucideIcon } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Reveal } from '@/components/Reveal';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/lib/supabase';

type Props = {
  settings: SiteSettings | null;
};

export function ContactSection({ settings }: Props) {
  const { t } = useApp();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const methods: { icon: LucideIcon; label: string; value: string; href: string }[] = [
    { icon: Mail, label: 'Email Me', value: settings?.email || '', href: `mailto:${settings?.email || ''}` },
    { icon: MapPin, label: 'Location', value: settings?.location || '', href: `https://maps.google.com/?q=${encodeURIComponent(settings?.location || '')}` },
    { icon: Github, label: 'GitHub Workspace', value: 'github.com/KhouvChvea', href: settings?.github_url || '#' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;
    setStatus('sending');
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
      status: 'new',
    });
    if (error) {
      setStatus('error');
    } else {
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section id="contact" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <Reveal>
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
            {t('Connect', 'ភ្ជាប់')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">{t("Let's Create Together", 'តោះបង្កើតរួមគ្នា')}</h2>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-8">
        <Reveal>
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4">{t('Contact Information', 'ព័ត៌មានទំនាក់ទំនង')}</h3>
            <p className="text-[var(--text-muted)] leading-relaxed mb-8 text-sm sm:text-base">
              {t(
                'Have an exciting project suggestion, a job opening, or just want to say hi? Fill in the details or contact me directly via the links below.',
                'មានគម្រោងគួរឱ្យចាប់អារម្មណ៍ ការងារ ឬគ្រាន់តែចង់សួរសួរ? បំពេញព័ត៌មាន ឬទំនាក់ទំនងផ្ទាល់តាមរយៈតំណខាងក្រោម។'
              )}
            </p>
            <div className="flex flex-col gap-4">
              {methods.map((method, i) => {
                const Icon = method.icon;
                return (
                  <a
                    key={i}
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-all duration-300 hover:translate-x-2"
                    style={{ color: 'inherit' }}
                  >
                    <div className="flex gap-4 items-center">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase text-[var(--text-muted)]">{method.label}</span>
                        <strong className="text-sm">{method.value}</strong>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="card p-6 sm:p-10">
            <form onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  required
                  placeholder={t('Your Name', 'ឈ្មោះរបស់អ្នក')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
                <input
                  type="email"
                  required
                  placeholder={t('Your Email', 'អ៊ីមែលរបស់អ្នក')}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>
              <input
                type="text"
                required
                placeholder={t('Subject', 'ប្រធានបទ')}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all mb-4"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
              <textarea
                required
                rows={5}
                placeholder={t('Your Message', 'សាររបស់អ្នក')}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all mb-6 resize-none"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-gradient w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {status === 'sending' ? (
                  t('Sending...', 'កំពុងផ្ញើ...')
                ) : status === 'sent' ? (
                  t('Message sent!', 'បានផ្ញើ!')
                ) : (
                  <>{t('Send Message', 'ផ្ញើសារ')} <Send size={16} /></>
                )}
              </button>
              {status === 'error' && (
                <p className="text-sm text-center mt-3" style={{ color: '#ef4444' }}>
                  {t('Failed to send message. Please try again.', 'បរាជ័យក្នុងការផ្ញើសារ។ សូមព្យាយាមម្តងទៀត។')}
                </p>
              )}
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
