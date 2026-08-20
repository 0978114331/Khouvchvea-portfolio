import { useState } from 'react';
import { Lock, Shield, Loader } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useApp } from '@/lib/app-context';

type Props = {
  onSuccess: () => void;
  onBack: () => void;
};

export function AdminLogin({ onSuccess, onBack }: Props) {
  const { signIn } = useAuth();
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative" style={{ background: 'var(--bg-base)' }}>
      <div className="glow-blob glow-1" />
      <div className="glow-blob glow-2" />

      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl relative z-10" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.1)', border: '3px solid var(--primary)' }}
          >
            <Shield size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{t('Admin Secure Login', 'ចូលប្រព័ន្ធសុវត្ថិភាព')}</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{t('Sign in to manage your portfolio', 'ចូលដើម្បីគ្រប់គ្រងផតហ្វូលលីយ៉ូ')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              required
              placeholder={t('Email', 'អ៊ីមែល')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none text-center"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              required
              placeholder={t('Password', 'ពាក្យសម្ងាត់')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none text-center"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>

          {error && (
            <p className="text-sm text-center mb-4" style={{ color: '#ef4444' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <><Loader size={16} className="animate-spin" /> {t('Authenticating...', 'កំពុងផ្ទៀងផ្ទាត់...')}</>
            ) : (
              <><Lock size={16} /> {t('Unlock Website Control', 'ដោះសោការគ្រប់គ្រង')}</>
            )}
          </button>
        </form>

        <button
          onClick={onBack}
          className="w-full mt-4 py-2 text-sm font-semibold transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          {t('Back to Website', 'ត្រឡប់ទៅវេបសាយ')}
        </button>
      </div>
    </div>
  );
}
