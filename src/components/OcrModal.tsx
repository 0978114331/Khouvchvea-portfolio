import { useState, useEffect } from 'react';
import { X, Zap, Languages, Loader } from 'lucide-react';
import { useApp } from '@/lib/app-context';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function OcrModal({ open, onClose }: Props) {
  const { t } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState('');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    const existing = document.querySelector('script[data-ocr]');
    if (existing) {
      setScriptsLoaded(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
    s.setAttribute('data-ocr', 'true');
    s.onload = () => setScriptsLoaded(true);
    document.head.appendChild(s);
  }, [open]);

  const runOCR = async () => {
    if (!file) {
      setStatus(t('Select image first.', 'សូមជ្រើសរើសរូបភាព។'));
      return;
    }
    setLoading(true);
    setStatus('');
    setOutput('');
    setProgress(t('Initiating OCR Engine...', 'កំពុងចាប់ផ្តើមម៉ាស៊ីន OCR...'));

    try {
      const Tesseract = (window as any).Tesseract;
      const result = await Tesseract.recognize(file, 'eng+khm', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgress(`${t('Recognizing text:', 'កំពុងស្គាល់អក្សរ:')} ${Math.round(m.progress * 100)}%`);
          } else {
            setProgress(m.status + '...');
          }
        },
      });
      setOutput(result.data.text);
      setStatus(t('Text extracted!', 'បានស្រង់អក្សរ!'));
    } catch (err) {
      setStatus(t('Error extracting text.', 'កំហុសក្នុងការស្រង់អក្សរ។'));
      console.error(err);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[600px] p-8 sm:p-10 rounded-2xl relative max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-5 text-2xl cursor-pointer transition-all hover:scale-110" style={{ color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>
        <h3 className="flex items-center gap-2 mb-6 text-lg font-bold text-center" style={{ color: 'var(--text-main)' }}>
          <Languages size={20} style={{ color: 'var(--primary)' }} /> {t('Image OCR Extract', 'ស្រង់អក្សរពីរូបភាព')}
        </h3>

        {!loading ? (
          <div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold text-[var(--text-muted)]">{t('Upload Image (JPG/PNG)', 'បង្ហោះរូបភាព (JPG/PNG)')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold text-[var(--text-muted)]">{t('Extracted Text Output', 'លទ្ធផលអក្សរ')}</label>
              <textarea
                value={output}
                readOnly
                rows={6}
                placeholder={t('Extracted text will appear here...', 'អក្សរដែលបានស្រង់នឹងបង្ហាញទីនេះ...')}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <button
              onClick={runOCR}
              disabled={!scriptsLoaded}
              className="btn-gradient w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap size={16} /> {t('Extract Text', 'ស្រង់អក្សរ')}
            </button>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Loader className="animate-spin mx-auto mb-4" size={32} style={{ color: 'var(--primary)' }} />
            <p className="font-bold text-lg tracking-wider" style={{ color: 'var(--primary)' }}>{t('ANALYZING IMAGE', 'កំពុងវិភាគរូបភាព')}</p>
            <p className="text-xs mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>{progress}</p>
          </div>
        )}
        {status && <p className="mt-3 text-sm font-semibold text-center" style={{ color: 'var(--text-muted)' }}>{status}</p>}
      </div>
    </div>
  );
}