import { useState, useRef, useEffect } from 'react';
import { X, Play, RefreshCw, Trophy, Users, FileText, Upload, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/app-context';

type Props = {
  open: boolean;
  onClose: () => void;
};

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function SpinWheelModal({ open, onClose }: Props) {
  const { t } = useApp();
  
  const [namesText, setNamesText] = useState(() => {
    const saved = localStorage.getItem('spinWheelSavedNames');
    return saved !== null ? saved : 'សិស្សទី១\nសិស្សទី២\nសិស្សទី៣\nសិស្សទី៤\nសិស្សទី៥\nសិស្សទី៦\nសិស្សទី៧\nសិស្សទី៨';
  });
  
  const [names, setNames] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const list = namesText.split('\n').map(n => n.trim()).filter(Boolean);
    setNames(list.length > 0 ? list : ['ទទេ']);
    localStorage.setItem('spinWheelSavedNames', namesText);
  }, [namesText]);

  useEffect(() => {
    const drawWheel = () => {
      const canvas = canvasRef.current;
      if (!canvas || names.length === 0) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(w, h) / 2 - 20;

      ctx.clearRect(0, 0, w, h);
      const sliceAngle = (2 * Math.PI) / names.length;

      names.forEach((name, i) => {
        const angle = i * sliceAngle;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        
        // ប្រើ Font Siemreap រួមជាមួយ Fallback
        const fontSize = names.length > 20 ? 18 : names.length > 10 ? 24 : 34;
        ctx.font = `bold ${fontSize}px 'Siemreap', 'Khmer OS Siemreap', Arial, sans-serif`;
        
        const text = name.length > 18 ? name.substring(0, 18) + '...' : name;
        ctx.fillText(text, radius - 30, 0);
        ctx.restore();
      });

      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();
    };

    drawWheel();

    // ឱ្យវាគូរឡើងវិញម្តងទៀតនៅពេល Font Siemreap លោតចេញមកពេញលេញ ដើម្បីកុំឱ្យវាព្រិល ឬអត់ស្គាល់
    document.fonts.ready.then(() => {
      drawWheel();
    });

  }, [names]);

  const spin = () => {
    if (names.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setWinner(null);

    const winIndex = Math.floor(Math.random() * names.length);
    const sliceSize = 360 / names.length;

    const currentSpins = Math.floor(rotation / 360);
    const nextSpins = currentSpins + 8;
    const targetAngle = 270 - (winIndex * sliceSize + sliceSize / 2);
    const newRotation = nextSpins * 360 + targetAngle;

    setRotation(newRotation);

    setTimeout(() => {
      setWinner(names[winIndex]);
      setIsSpinning(false);
    }, 5000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const formatted = text.replace(/,/g, '\n').replace(/\r/g, '');
      setNamesText(formatted);
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const clearNames = () => {
    if (confirm(t('Are you sure you want to clear all names?', 'តើអ្នកពិតជាចង់លុបឈ្មោះទាំងអស់មែនទេ?'))) {
      setNamesText('');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      {/* ទាញយកហ្វុង Siemreap ពី Google Fonts ដើម្បីធានាថាវាស្គាល់គ្រប់ទូរស័ព្ទ និងកុំព្យូទ័រ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Siemreap&display=swap');
      `}</style>

      <div
        className="w-full max-w-[1000px] rounded-2xl relative flex flex-col md:flex-row max-h-[95vh] shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-4 sm:top-4 sm:right-5 text-2xl cursor-pointer transition-all hover:scale-110 z-50 p-1.5 rounded-full bg-black/10 dark:bg-white/10" style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div className="w-full md:w-[40%] flex flex-col flex-shrink-0 p-5 sm:p-8 border-b md:border-b-0 md:border-r overflow-y-auto" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
          <h3 className="flex items-center gap-2 mb-6 text-lg sm:text-xl font-extrabold" style={{ color: 'var(--text-main)' }}>
            <Users size={24} style={{ color: 'var(--primary)' }} /> {t('Wheel of Fortune', 'កងចក្រចាប់ឆ្នោត')}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {t('Enter Names', 'បញ្ជីឈ្មោះ')} ({names.length > 0 && names[0] !== 'ទទេ' ? names.length : 0})
            </label>
            <button 
              onClick={clearNames}
              disabled={isSpinning || !namesText}
              className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 disabled:opacity-30"
            >
              <Trash2 size={12} /> {t('Clear', 'លុបចោល')}
            </button>
          </div>
          
          <textarea
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            disabled={isSpinning}
            placeholder="សិស្សទី១&#10;សិស្សទី២&#10;សិស្សទី៣..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none min-h-[150px] md:flex-1 mb-4 shadow-inner transition-all focus:ring-2 focus:ring-blue-500/30"
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontFamily: "'Siemreap', sans-serif" }}
          />

          <div className="flex flex-col gap-3 mt-auto">
            <p className="text-[10px] sm:text-[11px] font-semibold flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <FileText size={14} className="flex-shrink-0 mt-0.5" />
              {t('Tip: You can copy names directly from Excel/Word and paste them above.', 'អាច Copy ឈ្មោះពីក្នុង Excel ឬ Word មក Paste បញ្ចូលក្នុងប្រអប់នេះផ្ទាល់តែម្តង វានឹងរៀបជាជួរដោយស្វ័យប្រវត្តិ។')}
            </p>
            <label className="w-full py-3 rounded-lg text-[11px] sm:text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
              <Upload size={16} /> {t('Upload .txt or .csv', 'បញ្ចូល File (.txt ឬ .csv)')}
              <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" disabled={isSpinning} />
            </label>
          </div>
        </div>

        <div className="w-full md:w-[60%] flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-y-auto" style={{ background: 'var(--bg-base)' }}>
          
          <div className="relative mb-8 w-full max-w-[300px] sm:max-w-[400px] aspect-square flex items-center justify-center">
            <div className="absolute top-[-15px] sm:top-[-20px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500 drop-shadow-xl" />
            </div>

            <canvas
              ref={canvasRef}
              width={800}
              height={800}
              className="w-full h-full rounded-full shadow-2xl"
              style={{
                transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0, 0, 1)' : 'none',
                transform: `rotate(${rotation}deg) translateZ(0)`,
                willChange: 'transform'
              }}
            />
          </div>

          <button
            onClick={spin}
            disabled={isSpinning || names.length < 2 || names[0] === 'ទទេ'}
            className="btn-gradient w-[220px] py-4 rounded-full font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(59,130,246,0.3)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            style={{ fontFamily: "'Siemreap', sans-serif" }}
          >
            {isSpinning ? <RefreshCw size={24} className="animate-spin" /> : <Play size={24} fill="currentColor" />} 
            {isSpinning ? t('SPINNING...', 'កំពុងវិល...') : t('SPIN NOW', 'បង្វិលឥឡូវនេះ')}
          </button>

          {winner && !isSpinning && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-fade-up">
              <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm w-full border-[6px] border-yellow-400 text-center relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                
                <Trophy size={72} className="text-yellow-400 mb-4 drop-shadow-lg animate-bounce-icon" />
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2" style={{ fontFamily: "'Siemreap', sans-serif" }}>
                  {t('Congratulations', 'សូមអបអរសាទរ')}
                </h4>
                <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-8 leading-tight break-words px-4" style={{ fontFamily: "'Siemreap', sans-serif" }}>
                  {winner}
                </div>
                
                <button
                  onClick={() => setWinner(null)}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm sm:text-base transition-transform hover:-translate-y-1 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontFamily: "'Siemreap', sans-serif" }}
                >
                  {t('Continue', 'បន្តទៀត')}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}