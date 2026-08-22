import { useState, useEffect, useRef } from 'react';
import { X, QrCode, Globe, Palette, LayoutGrid, Plus, Minus, RefreshCw, Image as ImageIcon, Check } from 'lucide-react';
import { useApp } from '@/lib/app-context';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function QrGeneratorModal({ open, onClose }: Props) {
  const { t } = useApp();
  const [data, setData] = useState('https://khouvchvea.com');
  
  const [colorType, setColorType] = useState<'single' | 'gradient'>('single');
  const [fgColor, setFgColor] = useState('#000000');
  const [fgColor2, setFgColor2] = useState('#0277bd');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const [useCustomEye, setUseCustomEye] = useState(false);
  const [eyeColor, setEyeColor] = useState('#000000');

  const [logoUrl, setLogoUrl] = useState('');
  
  const [dotsType, setDotsType] = useState('square');
  const [cornerType, setCornerType] = useState('square');
  const [resolution, setResolution] = useState(1000);
  
  const [activeSection, setActiveSection] = useState('content');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  const generateQRCode = () => {
    if (!scriptsLoaded || !qrRef.current) return;
    setIsGenerating(true);
    
    try {
      const QRCodeStyling = (window as any).QRCodeStyling;

      const dotsOptions: any = { type: dotsType };
      if (colorType === 'single') {
        dotsOptions.color = fgColor;
      } else {
        dotsOptions.gradient = {
          type: 'linear',
          rotation: 0,
          colorStops: [{ offset: 0, color: fgColor }, { offset: 1, color: fgColor2 }]
        };
      }

      const eyeOptions: any = { type: cornerType };
      const eyeDotOptions: any = { type: 'dot' };
      
      if (useCustomEye) {
        eyeOptions.color = eyeColor;
        eyeDotOptions.color = eyeColor;
      } else if (colorType === 'single') {
        eyeOptions.color = fgColor;
        eyeDotOptions.color = fgColor;
      }

      const options = {
        width: resolution,
        height: resolution,
        data: data || 'https://khouvchvea.com',
        image: logoUrl,
        dotsOptions: dotsOptions,
        backgroundOptions: { color: bgColor },
        imageOptions: { margin: 15, imageSize: 0.4 },
        cornersSquareOptions: eyeOptions,
        cornersDotOptions: eyeDotOptions
      };

      qrRef.current.innerHTML = '';
      qrCodeInstance.current = new QRCodeStyling(options);
      qrCodeInstance.current.append(qrRef.current);
      
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsGenerating(false), 300);
    }
  };

  useEffect(() => {
    if (scriptsLoaded && open) {
      setTimeout(() => {
        generateQRCode();
      }, 150);
    }
  }, [scriptsLoaded, open]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoUrl(ev.target?.result as string);
        setActiveSection('design'); 
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQr = (ext: 'png' | 'svg') => {
    if (qrCodeInstance.current) {
      generateQRCode();
      setTimeout(() => {
        qrCodeInstance.current.download({ name: 'custom-qr', extension: ext });
      }, 300);
    }
  };

  const renderAccordionHeader = (id: string, Icon: any, title: string) => {
    const isOpen = activeSection === id;
    return (
      <button 
        onClick={() => setActiveSection(isOpen ? '' : id)}
        className="w-full flex items-center justify-between p-4 sm:p-5 font-bold text-sm transition-colors"
        style={{ 
          background: isOpen ? 'rgba(59,130,246,0.08)' : 'var(--bg-surface)', 
          color: isOpen ? 'var(--primary)' : 'var(--text-main)',
          borderBottom: '1px solid var(--border-color)' 
        }}
      >
        <span className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg shadow-sm" style={{ background: isOpen ? 'var(--primary)' : 'var(--bg-card)', color: isOpen ? 'white' : 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
            <Icon size={16} />
          </div>
          {title}
        </span>
        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
      </button>
    );
  };

  const renderBodyShapeBtn = (type: string, label: string) => (
    <button
      onClick={() => setDotsType(type)}
      className="p-3 border rounded-lg flex flex-col items-center gap-2 transition-all relative overflow-hidden hover:bg-gray-50 dark:hover:bg-slate-800"
      style={{ 
        borderColor: dotsType === type ? 'var(--primary)' : 'var(--border-color)',
        background: dotsType === type ? 'rgba(59,130,246,0.05)' : 'var(--bg-surface)'
      }}
    >
      <div className="w-8 h-8 bg-[var(--text-main)]" style={{ 
        borderRadius: type === 'rounded' || type === 'classy' ? '4px' : type === 'extra-rounded' ? '8px' : type === 'dots' ? '50%' : '0'
      }} />
      <span className="text-[10px] uppercase font-bold">{label}</span>
      {dotsType === type && <div className="absolute top-1 right-1 text-[var(--primary)]"><Check size={14} /></div>}
    </button>
  );

  const renderEyeShapeBtn = (type: string, label: string) => (
    <button
      onClick={() => setCornerType(type)}
      className="p-3 border rounded-lg flex flex-col items-center gap-2 transition-all relative overflow-hidden hover:bg-gray-50 dark:hover:bg-slate-800"
      style={{ 
        borderColor: cornerType === type ? 'var(--primary)' : 'var(--border-color)',
        background: cornerType === type ? 'rgba(59,130,246,0.05)' : 'var(--bg-surface)'
      }}
    >
      <div className="w-8 h-8 border-[3px] border-[var(--text-main)]" style={{ 
        borderRadius: type === 'extra-rounded' ? '8px' : type === 'dot' ? '50%' : '0'
      }} />
      <span className="text-[10px] uppercase font-bold">{label}</span>
      {cornerType === type && <div className="absolute top-1 right-1 text-[var(--primary)]"><Check size={14} /></div>}
    </button>
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(3,7,18,0.9)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <style>{`
        .qr-preview-container canvas, .qr-preview-container svg {
          width: 100% !important;
          height: auto !important;
          border-radius: 8px;
        }
      `}</style>

      <div
        className="w-full max-w-[1100px] rounded-2xl relative flex flex-col max-h-[95vh] shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
          <h3 className="flex items-center gap-2 text-lg font-extrabold" style={{ color: 'var(--text-main)' }}>
            <QrCode size={22} style={{ color: 'var(--primary)' }} /> {t('High-Res QR Code Generator', 'កម្មវិធីបង្កើត QR កម្រិតខ្ពស់')}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
          
          <div className="w-full lg:w-[55%] flex-shrink-0 lg:flex-shrink lg:overflow-y-auto" style={{ borderRight: '1px solid var(--border-color)', background: 'var(--bg-base)' }}>
            <div>
              {renderAccordionHeader('content', Globe, t('ENTER CONTENT', 'បញ្ចូលទិន្នន័យ'))}
              {activeSection === 'content' && (
                <div className="p-5 animate-fade-up">
                  <label className="block mb-2 text-xs font-bold uppercase text-[var(--text-muted)]">{t('Your URL', 'តំណភ្ជាប់របស់អ្នក')}</label>
                  <input
                    type="text"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>
              )}
            </div>

            <div>
              {renderAccordionHeader('colors', Palette, t('SET COLORS', 'កំណត់ពណ៌'))}
              {activeSection === 'colors' && (
                <div className="p-5 animate-fade-up">
                  <div className="mb-5">
                    <label className="block mb-3 text-xs font-bold uppercase text-[var(--text-muted)]">{t('Foreground Color', 'ពណ៌ខាងមុខ')}</label>
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" checked={colorType === 'single'} onChange={() => setColorType('single')} className="accent-[var(--primary)] w-4 h-4" />
                        Single Color
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" checked={colorType === 'gradient'} onChange={() => setColorType('gradient')} className="accent-[var(--primary)] w-4 h-4" />
                        Color Gradient
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 border p-1.5 rounded-lg flex-1 bg-[var(--bg-surface)]" style={{ borderColor: 'var(--border-color)' }}>
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        <span className="text-sm font-mono text-[var(--text-main)]">{fgColor.toUpperCase()}</span>
                      </div>
                      {colorType === 'gradient' && (
                        <div className="flex items-center gap-2 border p-1.5 rounded-lg flex-1 bg-[var(--bg-surface)]" style={{ borderColor: 'var(--border-color)' }}>
                          <input type="color" value={fgColor2} onChange={(e) => setFgColor2(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                          <span className="text-sm font-mono text-[var(--text-main)]">{fgColor2.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-5 pt-5 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <label className="flex items-center gap-2 mb-3 text-xs font-bold uppercase cursor-pointer text-[var(--text-muted)]">
                      <input type="checkbox" checked={useCustomEye} onChange={(e) => setUseCustomEye(e.target.checked)} className="accent-[var(--primary)] w-4 h-4" />
                      {t('Custom Eye Color', 'ពណ៌ភ្នែក QR ផ្សេង')}
                    </label>
                    {useCustomEye && (
                      <div className="flex items-center gap-2 border p-1.5 rounded-lg w-[200px] bg-[var(--bg-surface)]" style={{ borderColor: 'var(--border-color)' }}>
                        <input type="color" value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        <span className="text-sm font-mono text-[var(--text-main)]">{eyeColor.toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <label className="block mb-3 text-xs font-bold uppercase text-[var(--text-muted)]">{t('Background Color', 'ពណ៌ផ្ទៃខាងក្រោយ')}</label>
                    <div className="flex items-center gap-2 border p-1.5 rounded-lg w-[200px] bg-[var(--bg-surface)]" style={{ borderColor: 'var(--border-color)' }}>
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                      <span className="text-sm font-mono text-[var(--text-main)]">{bgColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              {renderAccordionHeader('logo', ImageIcon, t('ADD LOGO IMAGE', 'បន្ថែមរូបសញ្ញា'))}
              {activeSection === 'logo' && (
                <div className="p-5 animate-fade-up">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <span className="text-xs font-bold text-center" style={{ color: 'var(--text-muted)' }}>NO LOGO</span>}
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                      <label className="px-6 py-2.5 rounded-lg cursor-pointer text-sm font-bold flex items-center justify-center transition-transform hover:-translate-y-0.5" style={{ background: '#4fc3f7', color: 'white' }}>
                        {t('Upload Image', 'បង្ហោះរូបភាព')}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                      {logoUrl && (
                        <button onClick={() => setLogoUrl('')} className="px-6 py-2.5 rounded-lg text-sm font-bold border transition-colors hover:bg-red-50" style={{ borderColor: 'var(--border-color)', color: '#ef4444' }}>
                          {t('Remove Logo', 'លុបរូបសញ្ញា')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              {renderAccordionHeader('design', LayoutGrid, t('CUSTOMIZE DESIGN', 'រចនាទម្រង់'))}
              {activeSection === 'design' && (
                <div className="p-5 animate-fade-up">
                  <div className="mb-6">
                    <label className="block mb-3 text-xs font-bold uppercase text-[var(--text-muted)]">{t('Body Shape', 'ទម្រង់កូដ')}</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {renderBodyShapeBtn('square', 'Square')}
                      {renderBodyShapeBtn('dots', 'Dots')}
                      {renderBodyShapeBtn('rounded', 'Rounded')}
                      {renderBodyShapeBtn('extra-rounded', 'Extra')}
                      {renderBodyShapeBtn('classy', 'Classy')}
                      {renderBodyShapeBtn('classysquares', 'Classy Sq')}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-3 text-xs font-bold uppercase text-[var(--text-muted)]">{t('Eye Frame Shape', 'ទម្រង់ជ្រុង')}</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {renderEyeShapeBtn('square', 'Square')}
                      {renderEyeShapeBtn('extra-rounded', 'Rounded')}
                      {renderEyeShapeBtn('dot', 'Dot')}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="w-full lg:w-[45%] flex-shrink-0 lg:flex-shrink lg:overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-start lg:justify-center border-t lg:border-t-0 lg:border-l" style={{ background: 'var(--bg-code)', borderColor: 'var(--border-color)' }}>
            
            <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square p-2 sm:p-4 bg-white rounded-xl shadow-md border mb-8 relative flex items-center justify-center qr-preview-container" style={{ borderColor: 'var(--border-color)' }}>
              <div ref={qrRef} className="w-full h-full" />
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl z-10" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(3px)' }}>
                  <RefreshCw size={36} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>

            <div className="w-full max-w-[320px]">
              <div className="flex justify-between items-center mb-2 text-[10px] font-extrabold uppercase text-gray-400">
                <span>Low Quality</span>
                <span className="text-blue-400">{resolution} x {resolution} Px</span>
                <span>High Quality</span>
              </div>
              <input 
                type="range" 
                min="400" 
                max="2000" 
                step="200" 
                value={resolution} 
                onChange={(e) => setResolution(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer mb-8 accent-blue-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={generateQRCode} 
                  disabled={!scriptsLoaded || isGenerating} 
                  className="w-full py-3.5 rounded-lg text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95" 
                  style={{ background: '#8bc34a' }}
                >
                  {t('Create QR Code', 'បង្កើត QR Code')}
                </button>
                <button 
                  onClick={() => downloadQr('png')} 
                  disabled={!scriptsLoaded || isGenerating} 
                  className="w-full py-3.5 rounded-lg text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95" 
                  style={{ background: '#4fc3f7' }}
                >
                  Download PNG
                </button>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => downloadQr('svg')} 
                  disabled={!scriptsLoaded || isGenerating} 
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-transparent transition-colors hover:bg-white/10" 
                  style={{ border: '1px solid #4fc3f7', color: '#4fc3f7' }}
                >
                  .SVG
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}