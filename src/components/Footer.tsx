import { Eye } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { SiteSettings } from '@/lib/supabase';

type Props = {
  settings: SiteSettings | null;
  visitorCount: number;
};

export function Footer({ settings, visitorCount }: Props) {
  const { t } = useApp();

  return (
    <footer
      className="text-center py-10 px-6 text-sm font-medium"
      style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
    >
      <div
        className="inline-flex items-center gap-2 mb-4 px-5 py-1.5 rounded-full text-sm font-semibold"
        style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}
      >
        <Eye size={14} /> {t('Total Visitors:', 'ភ្ញៀវសរុប:')} {visitorCount.toLocaleString()}
      </div>
      <p>{settings?.footer_text || '© 2026 KHOUV Chvea. All rights reserved.'}</p>
    </footer>
  );
}
