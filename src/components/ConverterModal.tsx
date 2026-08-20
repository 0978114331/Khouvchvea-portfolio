import { useState, useEffect } from 'react';
import { X, RotateCw, FileText, Loader } from 'lucide-react';
import { useApp } from '@/lib/app-context';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ConverterModal({ open, onClose }: Props) {
  const { t } = useApp();
  const [convType, setConvType] = useState('img2pdf');
  const [files, setFiles] = useState<FileList | null>(null);
  const [useZip, setUseZip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState('');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    const loadScripts = async () => {
      const existing = document.querySelectorAll('script[data-converter]');
      if (existing.length >= 3) {
        setScriptsLoaded(true);
        return;
      }
      const scripts = [
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
      ];
      await Promise.all(
        scripts.map(
          (src) =>
            new Promise<void>((resolve) => {
              const s = document.createElement('script');
              s.src = src;
              s.setAttribute('data-converter', 'true');
              s.onload = () => resolve();
              s.onerror = () => resolve();
              document.head.appendChild(s);
            })
        )
      );
      setScriptsLoaded(true);
    };
    loadScripts();
  }, [open]);

  const resizeAndConvertImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const MAX = 1200;
          let w = img.width, h = img.height;
          if (w > h) {
            if (w > MAX) { h *= MAX / w; w = MAX; }
          } else {
            if (h > MAX) { w *= MAX / h; h = MAX; }
          }
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
    });
  };

  const runConverter = async () => {
    if (!files || files.length === 0) {
      setStatus(t('Select file first.', 'សូមជ្រើសរើសឯកសារ។'));
      return;
    }
    setLoading(true);
    setStatus('');
    setProgress('');

    try {
      if (convType === 'img2pdf') {
        const jsPDF = (window as any).jspdf.jsPDF;
        const doc = new jsPDF();
        for (let i = 0; i < files.length; i++) {
          setProgress(`${t('Processing image', 'កំពុងដំណើរការ')} ${i + 1} / ${files.length}...`);
          const imgData = await resizeAndConvertImage(files[i]);
          if (i > 0) doc.addPage();
          doc.addImage(imgData, 'JPEG', 10, 10, 190, 0);
        }
        doc.save('Converted_Document.pdf');
        setStatus(t('PDF downloaded!', 'បានទាញយក PDF!'));
      } else {
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const typedarray = new Uint8Array(arrayBuffer);
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const totalPages = pdf.numPages;
        let zip: any = null;
        if (useZip) zip = new (window as any).JSZip();

        for (let i = 1; i <= totalPages; i++) {
          setProgress(`${t('Extracting page', 'កំពុងស្រង់ទំព័រ')} ${i} / ${totalPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const dataURL = canvas.toDataURL('image/png');

          if (useZip) {
            zip.file(`Page_${i}.png`, dataURL.split(',')[1], { base64: true });
          } else {
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = `Converted_Page_${i}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            await new Promise((r) => setTimeout(r, 400));
          }
        }
        if (useZip) {
          setProgress(t('Zipping files...', 'កំពុងបង្ហាប់ឯកសារ...'));
          const content = await zip.generateAsync({ type: 'blob' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(content);
          a.download = 'Converted_Images.zip';
          a.click();
        }
        setStatus(`${t('Success:', 'ជោគជ័យ:')} ${totalPages} ${t('pages!', 'ទំព័រ!')}`);
      }
    } catch (err) {
      setStatus(t('Error processing file.', 'កំហុសក្នុងការដំណើរការឯកសារ។'));
      console.error(err);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <ModalShell onClose={onClose} title={t('File Converter Tool', 'ឧបករណ៍បម្លែងឯកសារ')} icon={<FileText size={20} style={{ color: 'var(--primary)' }} />}>
      {!loading ? (
        <div className="text-left">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-semibold text-[var(--text-muted)]">{t('Select Operation', 'ជ្រើសរើសប្រតិបត្តិការ')}</label>
            <select
              value={convType}
              onChange={(e) => setConvType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-3"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="img2pdf">{t('Multiple Images to PDF', 'រូបភាពច្រើនទៅ PDF')}</option>
              <option value="pdf2img">{t('PDF to Images (All Pages)', 'PDF ទៅរូបភាព (ទំព័រទាំងអស់)')}</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-semibold text-[var(--text-muted)]">{t('Upload File(s)', 'បង្ហោះឯកសារ')}</label>
            <input
              type="file"
              accept=".pdf, image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>
          {convType === 'pdf2img' && (
            <label className="flex items-center gap-2.5 cursor-pointer mb-4 text-sm" style={{ color: 'var(--text-main)' }}>
              <input type="checkbox" checked={useZip} onChange={(e) => setUseZip(e.target.checked)} className="w-4 h-4" />
              {t('Download as a single ZIP file', 'ទាញយកជាឯកសារ ZIP តែមួយ')}
            </label>
          )}
          <button
            onClick={runConverter}
            disabled={!scriptsLoaded}
            className="btn-gradient w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCw size={16} /> {t('Convert File', 'បម្លែងឯកសារ')}
          </button>
        </div>
      ) : (
        <div className="py-8 text-center">
          <Loader className="animate-spin mx-auto mb-4" size={32} style={{ color: 'var(--primary)' }} />
          <p className="font-bold text-lg tracking-wider" style={{ color: 'var(--primary)' }}>{t('PROCESSING', 'កំពុងដំណើរការ')}</p>
          <p className="text-xs mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>{progress}</p>
        </div>
      )}
      {status && <p className="mt-3 text-sm font-semibold text-center" style={{ color: 'var(--text-muted)' }}>{status}</p>}
    </ModalShell>
  );
}

function ModalShell({ children, onClose, title, icon }: { children: React.ReactNode; onClose: () => void; title: string; icon: React.ReactNode }) {
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
        <h3 className="flex items-center gap-2 mb-6 text-lg font-bold" style={{ color: 'var(--text-main)' }}>
          {icon} {title}
        </h3>
        {children}
      </div>
    </div>
  );
}