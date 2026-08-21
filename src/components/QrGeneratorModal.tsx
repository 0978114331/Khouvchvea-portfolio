import { useState, useEffect, useRef } from 'react';
import { X, QrCode, Download, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/lib/app-context';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function QrGeneratorModal({ open, onClose }: Props) {
  const { t } = useApp();
  const [data, setData] = useState('');
  const [dotsColor, setDotsColor] = useState('#4f46e5');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState('');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    if ((window as any).QRCodeStyling) {
      setScriptsLoaded(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js';
    s.onload = () => setScriptsLoaded(true);
    document.head.appendChild(s);
  }, [open]);

  useEffect(() => {
    if (!scriptsLoaded || !open || !qrRef.current) return;
    const QRCodeStyling = (window as any).QRCodeStyling;

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 250,
        height: 250,
        data: data || 'https://example.com',
        image: logoUrl,
        dotsOptions: { color: dotsColor, type: 'rounded' },
        backgroundOptions: { color: bgColor },
        imageOptions: { crossOrigin: 'anonymous', margin: 10 },
        cornersSquareOptions: { type: 'extra-rounded', color: dotsColor },
        cornersDotOptions: { type: 'dot', color: dotsColor }
      });
      qrRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrRef.current);
    }
  }, [scriptsLoaded, open, data, dotsColor, bgColor, logoUrl]);

  useEffect(() => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.update({
        data: data || 'https://example.com',
        image: logoUrl,
        dotsOptions: { color: dotsColor },
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { color: dotsColor },
        cornersDotOptions: { color: dotsColor }
      });
    }
  }, [data, dotsColor, bgColor, logoUrl]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const downloadQr = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({ name: 'custom-qr-code', extension: 'png' });
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[700px] p-6 sm:p-10 rounded-2xl relative max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-5 text-2xl cursor-pointer transition-all hover:scale-110" style={{ color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>
        
        <h3 className="flex items-center gap-2 mb-6 text-lg font-bold" style={{ color: 'var(--text-main)' }}>
          <QrCode size={20} style={{ color: 'var(--primary)' }} /> {t('Custom QR Generator', 'បង្កើតកូដ QR តាមបំណង')}
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-[var(--text-muted)]">{t('URL or Data', 'តំណភ្ជាប់ ឬទិន្នន័យ')}</label>
              <input
                type="text"
                placeholder="https://..."
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-[var(--text-muted)]">{t('QR Color', 'ពណ៌ QR')}</label>
                <input
                  type="color"
                  value={dotsColor}
                  onChange={(e) => setDotsColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-[var(--text-muted)]">{t('Background', 'ពណ៌ផ្ទៃខាងក្រោយ')}</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-[var(--text-muted)]">{t('Center Logo', 'រូបសញ្ញាកណ្តាល')}</label>
              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm cursor-pointer transition-all border border-dashed hover:opacity-80" style={{ background: 'var(--bg-base)', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                <ImageIcon size={18} /> {t('Upload Logo', 'បង្ហោះរូបសញ្ញា')}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              {logoUrl && (
                <button onClick={() => setLogoUrl('')} className="text-xs mt-2" style={{ color: '#ef4444' }}>
                  {t('Remove Logo', 'លុបរូបសញ្ញា')}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
            <div ref={qrRef} className="bg-white p-2 rounded-xl" />
            <button
              onClick={downloadQr}
              disabled={!scriptsLoaded}
              className="btn-gradient w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={16} /> {t('Download QR Code', 'ទាញយក QR')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}