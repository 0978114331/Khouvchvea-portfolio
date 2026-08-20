import { useState, useEffect } from 'react';
import { PublicSite } from '@/components/PublicSite';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AppProvider } from '@/lib/app-context';

function AppContent() {
  const { session, loading } = useAuth();
  const [route, setRoute] = useState<string>(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  const isAdminRoute = route.startsWith('/admin');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="w-12 h-12 rounded-full border-4 mx-auto animate-spin" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border-color)' }} />
      </div>
    );
  }

  if (isAdminRoute) {
    if (session) {
      return <AdminDashboard onExit={() => navigate('/')} />;
    }
    return <AdminLogin onSuccess={() => setRoute('/admin')} onBack={() => navigate('/')} />;
  }

  return <PublicSite onAdminClick={() => navigate('/admin')} />;
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppProvider>
  );
}
