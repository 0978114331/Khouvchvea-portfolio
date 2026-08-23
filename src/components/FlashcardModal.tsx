import { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Trash2, ChevronLeft, ChevronRight, RotateCcw, Settings, Layers } from 'lucide-react';
import { useApp } from '@/lib/app-context';

type Card = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function FlashcardModal({ open, onClose }: Props) {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<'review' | 'manage'>('review');
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');

  useEffect(() => {
    if (open) {
      const savedCards = localStorage.getItem('portfolio_flashcards');
      if (savedCards) {
        try {
          setCards(JSON.parse(savedCards));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [open]);

  const saveCards = (newCards: Card[]) => {
    setCards(newCards);
    localStorage.setItem('portfolio_flashcards', JSON.stringify(newCards));
  };

  const addCard = () => {
    if (!questionInput.trim() || !answerInput.trim()) return;
    const newCard: Card = {
      id: Date.now().toString(),
      question: questionInput.trim(),
      answer: answerInput.trim()
    };
    saveCards([...cards, newCard]);
    setQuestionInput('');
    setAnswerInput('');
  };

  const deleteCard = (id: string) => {
    const newCards = cards.filter(c => c.id !== id);
    saveCards(newCards);
    if (currentIndex >= newCards.length) {
      setCurrentIndex(Math.max(0, newCards.length - 1));
    }
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6" style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-full max-w-[800px] h-[90vh] sm:h-[80vh] rounded-2xl relative flex flex-col shadow-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold">{t('Flashcards Review', 'កាតរំលឹកមេរៀន')}</h3>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>Learn and memorize anything faster</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
          <button onClick={() => { setActiveTab('review'); setIsFlipped(false); }} className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'review' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-[var(--text-muted)]'}`}>
            <Layers size={16} /> Review Mode
          </button>
          <button onClick={() => setActiveTab('manage')} className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'manage' ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-transparent text-[var(--text-muted)]'}`}>
            <Settings size={16} /> Manage Cards
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: 'var(--bg-base)' }}>
          
          {activeTab === 'review' && (
            <div className="flex flex-col items-center justify-center h-full max-w-[600px] mx-auto">
              {cards.length === 0 ? (
                <div className="text-center opacity-50 flex flex-col items-center">
                  <BookOpen size={64} className="mb-4" />
                  <p className="font-semibold text-lg">No flashcards found.</p>
                  <p className="text-sm mt-2">Go to "Manage Cards" to create your first deck!</p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-6">
                  
                  <div className="text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                    Card {currentIndex + 1} of {cards.length}
                  </div>

                  <div 
                    className="relative w-full h-[300px] sm:h-[350px] cursor-pointer" 
                    onClick={() => setIsFlipped(!isFlipped)} 
                    style={{ perspective: '1000px' }}
                  >
                    <div 
                      className="w-full h-full transition-transform duration-500 rounded-2xl relative" 
                      style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    >
                      <div className="absolute inset-0 rounded-2xl border flex flex-col items-center justify-center p-8 text-center shadow-lg" style={{ backfaceVisibility: 'hidden', background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Question</span>
                        <h3 className="text-xl sm:text-2xl font-bold leading-relaxed">{cards[currentIndex].question}</h3>
                        <div className="absolute bottom-4 flex items-center gap-2 text-xs font-semibold opacity-50"><RotateCcw size={14} /> Click to flip</div>
                      </div>
                      
                      <div className="absolute inset-0 rounded-2xl border flex flex-col items-center justify-center p-8 text-center shadow-lg text-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: '#10b981', borderColor: '#059669' }}>
                        <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-green-100">Answer</span>
                        <h3 className="text-xl sm:text-2xl font-bold leading-relaxed">{cards[currentIndex].answer}</h3>
                        <div className="absolute bottom-4 flex items-center gap-2 text-xs font-semibold text-green-100"><RotateCcw size={14} /> Click to flip back</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full">
                    <button onClick={prevCard} disabled={currentIndex === 0} className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors disabled:opacity-30 border hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                      <ChevronLeft size={20} /> Prev
                    </button>
                    <button onClick={nextCard} disabled={currentIndex === cards.length - 1} className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors disabled:opacity-30 border hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                      Next <ChevronRight size={20} />
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="flex flex-col h-full gap-6">
              <div className="card p-5">
                <h4 className="font-bold text-base mb-4">Create New Card</h4>
                <div className="flex flex-col gap-3">
                  <textarea placeholder="Type your Question here..." rows={2} value={questionInput} onChange={e => setQuestionInput(e.target.value)} className="form-input" />
                  <textarea placeholder="Type the Answer here..." rows={2} value={answerInput} onChange={e => setAnswerInput(e.target.value)} className="form-input" />
                  <button onClick={addCard} className="btn-gradient py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 w-full mt-2">
                    <Plus size={18} /> Add to Deck
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <h4 className="font-bold text-base mb-4">Your Deck ({cards.length} Cards)</h4>
                <div className="flex flex-col gap-3">
                  {cards.map((card, i) => (
                    <div key={card.id} className="p-4 rounded-xl border flex gap-4 items-start" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black flex-shrink-0" style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm mb-1 line-clamp-2" style={{ color: 'var(--text-main)' }}>Q: {card.question}</div>
                        <div className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>A: {card.answer}</div>
                      </div>
                      <button onClick={() => deleteCard(card.id)} className="p-2 flex-shrink-0 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="text-center py-6 opacity-50 font-semibold text-sm">
                      Your deck is currently empty.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}