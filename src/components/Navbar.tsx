import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Shield, Globe } from 'lucide-react';
import { useApp } from '@/lib/app-context';

type Props = {
  onAdminClick: () => void;
};

export function Navbar({ onAdminClick }: Props) {
  const { theme, toggleTheme, lang, setLang } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
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

  const navLinks = [
    { id: 'home', label: 'Home', labelKm: 'ទំព័រដើម' },
    { id: 'about', label: 'About', labelKm: 'អំពីខ្ញុំ' },
    { id: 'documents', label: 'Journey', labelKm: 'សមិទ្ធិផល' },
    { id: 'skills', label: 'Skills', labelKm: 'ជំនាញ' },
    { id: 'projects', label: 'Projects', labelKm: 'គម្រោង' },
    { id: 'contact', label: 'Contact', labelKm: 'ទំនាក់ទំនង' },
  ];

  return (
    <header
      className="fixed top-0 w-full z-50 transition-all duration-400"
      style={{
        background: scrolled ? 'var(--bg-surface)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
      }}
    >
      <nav className="max-w-[1240px] mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        {/* រចនាពណ៌ Logo (KHOUV ពណ៌ស និង CHVEA ជាពណ៌ Gradient) */}
        <a href="#home" className="text-xl sm:text-2xl font-extrabold flex items-center tracking-tight">
          <span style={{ color: 'var(--text-main)' }}>KHOUV</span>
          <span className="gradient-text ml-1" style={{ paddingRight: '2px' }}>CHVEA</span>
        </a>

        <ul className="hidden lg:flex gap-8 list-none">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`relative font-semibold text-sm transition-colors duration-300 ${
                  activeSection === link.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {lang === 'km' ? link.labelKm : link.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-0.5 transition-all duration-300 ${
                    activeSection === link.id ? 'w-full' : 'w-0'
                  }`}
                  style={{ background: 'var(--gradient-accent)' }}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'km' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 hover:border-[var(--primary)]"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          >
            <Globe size={14} />
            {lang.toUpperCase()}
          </button>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 hover:border-[var(--primary)] hover:rotate-12"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button
            onClick={onAdminClick}
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'var(--bg-code)' }}
          >
            <Shield size={14} /> Admin
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center"
            style={{ color: 'var(--text-main)' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <ul className="lg:hidden flex flex-col py-2 px-4 border-t shadow-xl" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-semibold"
                style={{ color: activeSection === link.id ? 'var(--primary)' : 'var(--text-main)' }}
              >
                {lang === 'km' ? link.labelKm : link.label}
              </a>
            </li>
          ))}
          <li>
            <button onClick={() => { setMobileOpen(false); onAdminClick(); }} className="flex items-center gap-1.5 py-3 text-sm font-bold" style={{ color: 'var(--primary)' }}>
              <Shield size={14} /> Admin Login
            </button>
          </li>
        </ul>
      )}
    </header>
  );
}