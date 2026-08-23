import { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Trash2, ChevronLeft, ChevronRight, RotateCcw, Settings, Layers, Lock, Globe, Check, Edit2, Copy, Gamepad2, Award, Frown, Smile } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Card = {
  id: string;
  question: string;
  answer: string;
  color: string;
  is_private: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#84cc16', '#f97316', '#db2777', '#64748b'
];

export function FlashcardModal({ open, onClose }: Props) {
  const { t } = useApp();
  const { session } = useAuth();
  const isAdmin = !!session;

  const [activeTab, setActiveTab] = useState<'review' | 'quiz' | 'manage'>('review');
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', color: '#10b981', is_private: false });

  const [quizScore, setQuizScore] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizState, setQuizState] = useState<'idle' | 'playing' | 'feedback' | 'finished'>('idle');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledQuizCards, setShuffledQuizCards] = useState<Card[]>([]);

  const fetchCards = async () => {
    let query = supabase.from('flashcards').select('*').order('created_at', { ascending: false });
    if (!isAdmin) {
      query = query.eq('is_private', false);
    }
    const { data } = await query;
    if (data) setCards(data);
  };

  useEffect(() => {
    if (open) {
      fetchCards();
      setIsFlipped(false);
      setCurrentIndex(0);
      cancelEdit();
      setQuizState('idle');
    }
  }, [open, isAdmin]);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveCard = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setLoading(true);
    
    if (editingId) {
      const { error } = await supabase.from('flashcards').update({
        question: form.question.trim(),
        answer: form.answer.trim(),
        color: form.color,
        is_private: form.is_private
      }).eq('id', editingId);
      
      if (!error) {
        cancelEdit();
        await fetchCards();
      }
    } else {
      const { error } = await supabase.from('flashcards').insert({
        question: form.question.trim(),
        answer: form.answer.trim(),
        color: form.color,
        is_private: form.is_private
      });
      
      if (!error) {
        cancelEdit();
        await fetchCards();
      }
    }
    setLoading(false);
  };

  const startEdit = (card: Card) => {
    setForm({ question: card.question, answer: card.answer, color: card.color || '#10b981', is_private: card.is_private });
    setEditingId(card.id);
    const scrollContainer = document.getElementById('manage-tab-container');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm({ question: '', answer: '', color: '#10b981', is_private: false });
    setEditingId(null);
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    await supabase.from('flashcards').delete().eq('id', id);
    if (currentIndex >= cards.length - 1) {
      setCurrentIndex(Math.max(0, cards.length - 2));
    }
    setIsFlipped(false);
    await fetchCards();
    if (editingId === id) cancelEdit();
  };

  const toggleVisibility = async (card: Card) => {
    const { error } = await supabase.from('flashcards').update({ is_private: !card.is_private }).eq('id', card.id);
    if (!error) await fetchCards();
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

  const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

  const startQuiz = () => {
    const shuffled = shuffleArray(cards);
    setShuffledQuizCards(shuffled);
    setQuizScore(0);
    setQuizIndex(0);
    generateQuizOptions(shuffled[0], shuffled);
    setQuizState('playing');
    setSelectedAnswer(null);
  };

  const generateQuizOptions = (currentCard: Card, allQuizCards: Card[]) => {
    const otherAnswers = allQuizCards.filter(c => c.id !== currentCard.id).map(c => c.answer);
    const uniqueOthers = Array.from(new Set(otherAnswers));
    const distractors = shuffleArray(uniqueOthers).slice(0, 3);
    const finalOptions = shuffleArray([currentCard.answer, ...distractors]);
    setQuizOptions(finalOptions);
  };

  const handleQuizAnswer = (selected: string) => {
    const currentCard = shuffledQuizCards[quizIndex];
    const correct = selected === currentCard.answer;
    
    setSelectedAnswer(selected);
    setIsCorrect(correct);
    if (correct) {
      setQuizScore(prev => prev + 10);
    } else {
      setQuizScore(prev => prev - 5);
    }
    setQuizState('feedback');
  };

  const nextQuizQuestion = () => {
    if (quizIndex < shuffledQuizCards.length - 1) {
      const nextIdx = quizIndex + 1;
      setQuizIndex(nextIdx);
      generateQuizOptions(shuffledQuizCards[nextIdx], shuffledQuizCards);
      setQuizState('playing');
      setSelectedAnswer(null);
    } else {
      setQuizState('finished');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6" style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-full max-w-[800px] h-[95vh] sm:h-[85vh] rounded-2xl relative flex flex-col shadow-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold">{t('Knowledge Center', 'កាតរំលឹកមេរៀន និងល្បែងសាកល្បង')}</h3>
              <p className="text-[10px] sm:text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>Learn, memorize, and test your knowledge</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
          <button onClick={() => { setActiveTab('review'); setIsFlipped(false); }} className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'review' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-[var(--text-muted)]'}`}>
            <Layers size={16} className="hidden sm:block" /> Review
          </button>
          <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'quiz' ? 'border-[#f59e0b] text-[#f59e0b]' : 'border-transparent text-[var(--text-muted)]'}`}>
            <Gamepad2 size={16} className="hidden sm:block" /> Quiz Mode
          </button>
          {isAdmin && (
            <button onClick={() => setActiveTab('manage')} className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'manage' ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-transparent text-[var(--text-muted)]'}`}>
              <Settings size={16} className="hidden sm:block" /> Manage
            </button>
          )}
        </div>

        <div id="manage-tab-container" className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: 'var(--bg-base)' }}>
          
          {activeTab === 'review' && (
            <div className="flex flex-col items-center justify-center h-full max-w-[650px] mx-auto">
              {cards.length === 0 ? (
                <div className="text-center opacity-50 flex flex-col items-center">
                  <BookOpen size={64} className="mb-4" />
                  <p className="font-semibold text-lg">No flashcards found.</p>
                  <p className="text-sm mt-2">{isAdmin ? 'Go to "Manage Cards" to create your first deck!' : 'Admin has not published any cards yet.'}</p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-4 sm:gap-6 h-full py-2">
                  
                  <div className="text-xs sm:text-sm font-bold tracking-widest uppercase flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    Card {currentIndex + 1} of {cards.length}
                  </div>

                  <div className="relative w-full flex-1 min-h-[350px] max-h-[500px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1200px' }}>
                    <div className="w-full h-full transition-transform duration-500 rounded-2xl relative" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                      
                      <div className="absolute inset-0 rounded-2xl border flex flex-col p-5 sm:p-8 shadow-lg text-white overflow-hidden" style={{ backfaceVisibility: 'hidden', background: cards[currentIndex].color || '#10b981', borderColor: 'rgba(255,255,255,0.2)' }}>
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80">Question</span>
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => handleCopy(cards[currentIndex].question, 'q', e)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white/90">
                              {copiedId === 'q' ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            {isAdmin && <span title={cards[currentIndex].is_private ? 'Private' : 'Public'} className="text-white/80 ml-2">{cards[currentIndex].is_private ? <Lock size={14}/> : <Globe size={14}/>}</span>}
                          </div>
                        </div>
                        <div className="flex-1 w-full overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                          <pre className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap break-words w-full text-left" style={{ fontFamily: 'inherit' }}>
                            {cards[currentIndex].question}
                          </pre>
                        </div>
                        <div className="flex-shrink-0 mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-semibold text-white/80"><RotateCcw size={14} /> Click to flip</div>
                      </div>
                      
                      <div className="absolute inset-0 rounded-2xl border flex flex-col p-5 sm:p-8 shadow-lg text-white overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: cards[currentIndex].color || '#10b981', borderColor: 'rgba(255,255,255,0.2)' }}>
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80">Answer</span>
                          <button onClick={(e) => handleCopy(cards[currentIndex].answer, 'a', e)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white/90">
                            {copiedId === 'a' ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div className="flex-1 w-full overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                          <pre className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap break-words w-full text-left" style={{ fontFamily: 'inherit' }}>
                            {cards[currentIndex].answer}
                          </pre>
                        </div>
                        <div className="flex-shrink-0 mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-semibold text-white/80"><RotateCcw size={14} /> Click to flip back</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 w-full flex-shrink-0 mt-2">
                    <button onClick={prevCard} disabled={currentIndex === 0} className="flex-1 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors disabled:opacity-30 border hover:bg-black/5 dark:hover:bg-white/5 text-sm sm:text-base" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                      <ChevronLeft size={20} /> Prev
                    </button>
                    <button onClick={nextCard} disabled={currentIndex === cards.length - 1} className="flex-1 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors disabled:opacity-30 border hover:bg-black/5 dark:hover:bg-white/5 text-sm sm:text-base" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                      Next <ChevronRight size={20} />
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="flex flex-col h-full max-w-[700px] mx-auto w-full">
              {cards.length < 4 ? (
                <div className="text-center opacity-50 flex flex-col items-center justify-center h-full">
                  <Gamepad2 size={64} className="mb-4" />
                  <p className="font-semibold text-lg">Not enough cards.</p>
                  <p className="text-sm mt-2">Quiz mode requires at least 4 flashcards to generate options.</p>
                </div>
              ) : quizState === 'idle' ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                    <Award size={40} />
                  </div>
                  <h3 className="text-2xl font-bold">Ready to test your knowledge?</h3>
                  <p className="text-sm sm:text-base max-w-md" style={{ color: 'var(--text-muted)' }}>You will earn <span className="text-green-500 font-bold">+10 points</span> for every correct answer, but lose <span className="text-red-500 font-bold">-5 points</span> for wrong ones. Good luck!</p>
                  <button onClick={startQuiz} className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-1">
                    <Gamepad2 size={20} /> Start Quiz Now
                  </button>
                </div>
              ) : quizState === 'finished' ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-2" style={{ background: quizScore > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: quizScore > 0 ? '#10b981' : '#ef4444' }}>
                    <Award size={48} />
                  </div>
                  <h3 className="text-3xl font-bold">Quiz Complete!</h3>
                  <p className="text-xl font-medium">Your Final Score: <span className={quizScore > 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{quizScore}</span></p>
                  <button onClick={startQuiz} className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-base flex items-center gap-2 mt-4">
                    <RotateCcw size={18} /> Play Again
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full w-full">
                  <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>Q {quizIndex + 1} of {shuffledQuizCards.length}</span>
                    <span className="text-sm font-bold flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                      <Award size={16} className={quizScore >= 0 ? 'text-yellow-500' : 'text-red-500'}/> Score: {quizScore}
                    </span>
                  </div>

                  <div className="mb-8 px-2 sm:px-6 text-center">
                    <h3 className="text-lg sm:text-2xl font-bold leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'var(--text-main)', fontFamily: 'inherit' }}>
                      {shuffledQuizCards[quizIndex].question}
                    </h3>
                  </div>

                  {quizState === 'feedback' && (
                    <div className={`flex-shrink-0 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between shadow-sm border ${isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                      <div className="flex items-center gap-3 font-bold text-base sm:text-lg mb-3 sm:mb-0">
                        {isCorrect ? <Smile size={24} /> : <Frown size={24} />}
                        {isCorrect ? 'Correct! +10 Points 🎉' : 'Oops! Wrong Answer! -5 Points 😢'}
                      </div>
                      <button onClick={nextQuizQuestion} className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-sm text-white transition-colors hover:opacity-90" style={{ background: isCorrect ? '#10b981' : '#ef4444' }}>
                        Next Question
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto w-full flex flex-col gap-3 pb-6">
                    {quizOptions.map((opt, idx) => {
                      let btnStyle = { background: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' };
                      let disabled = false;

                      if (quizState === 'feedback') {
                        disabled = true;
                        if (opt === shuffledQuizCards[quizIndex].answer) {
                          btnStyle = { background: '#10b981', borderColor: '#059669', color: 'white' };
                        } else if (opt === selectedAnswer) {
                          btnStyle = { background: '#ef4444', borderColor: '#b91c1c', color: 'white' };
                        }
                      }

                      return (
                        <button 
                          key={idx}
                          disabled={disabled}
                          onClick={() => handleQuizAnswer(opt)}
                          className="p-4 sm:p-5 rounded-xl border text-left flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-none w-full"
                          style={btnStyle}
                        >
                          <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-black shadow-sm" style={{ background: quizState === 'feedback' && (opt === shuffledQuizCards[quizIndex].answer || opt === selectedAnswer) ? 'rgba(255,255,255,0.2)' : 'var(--bg-base)', color: quizState === 'feedback' && (opt === shuffledQuizCards[quizIndex].answer || opt === selectedAnswer) ? 'white' : 'var(--text-muted)' }}>
                            {['A', 'B', 'C', 'D'][idx]}
                          </div>
                          <div className="text-sm sm:text-base font-medium whitespace-pre-wrap break-words flex-1">
                            {opt}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {isAdmin && activeTab === 'manage' && (
            <div className="flex flex-col h-full gap-6">
              
              <div className="card p-5 border-2 transition-colors flex-shrink-0" style={{ borderColor: editingId ? '#3b82f6' : 'var(--border-color)' }}>
                <h4 className="font-bold text-base mb-4 flex items-center justify-between">
                  {editingId ? <span className="text-blue-500 flex items-center gap-2"><Edit2 size={18} /> Editing Card</span> : 'Create New Card'}
                  {editingId && <button onClick={cancelEdit} className="text-xs text-red-500 hover:underline font-semibold bg-red-500/10 px-3 py-1.5 rounded-lg">Cancel</button>}
                </h4>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Question</label>
                    <textarea placeholder="e.g., What does HTML stand for?" rows={3} value={form.question} onChange={e => setForm({...form, question: e.target.value})} className="form-input text-sm" style={{ fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Answer (Code or Text)</label>
                    <textarea placeholder="e.g., Hyper Text Markup Language" rows={4} value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} className="form-input text-sm" style={{ fontFamily: 'inherit' }} />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Card Color</label>
                    <div className="flex gap-2 sm:gap-3 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button 
                          key={c} 
                          onClick={() => setForm({...form, color: c})}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 flex-shrink-0" 
                          style={{ background: c, border: form.color === c ? '2px solid white' : '2px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none' }}
                        >
                          {form.color === c && <Check size={14} color="white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-sm cursor-pointer mt-2 p-3 rounded-lg border transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <input type="checkbox" checked={form.is_private} onChange={(e) => setForm({ ...form, is_private: e.target.checked })} className="accent-[#ef4444] w-4 h-4 flex-shrink-0" /> 
                    <span className="font-bold flex items-center gap-2 text-xs sm:text-sm" style={{ color: form.is_private ? '#ef4444' : '#10b981' }}>
                      {form.is_private ? <><Lock size={16} /> Private (Hidden from public)</> : <><Globe size={16} /> Public (Visible to everyone)</>}
                    </span>
                  </label>

                  <button onClick={saveCard} disabled={loading} className={`py-3.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 w-full mt-2 disabled:opacity-50 text-white transition-transform hover:-translate-y-0.5 shadow-md`} style={{ background: editingId ? '#3b82f6' : 'var(--primary)' }}>
                    {editingId ? <Check size={18} /> : <Plus size={18} />} 
                    {loading ? 'Saving...' : (editingId ? 'Update Card' : 'Add to Deck')}
                  </button>
                </div>
              </div>

              <div className="flex-1 pb-4">
                <h4 className="font-bold text-base mb-4">Your Deck ({cards.length} Cards)</h4>
                <div className="flex flex-col gap-3">
                  {cards.map((card, i) => (
                    <div key={card.id} className="p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center transition-colors hover:shadow-md" style={{ borderColor: editingId === card.id ? '#3b82f6' : 'var(--border-color)', background: 'var(--bg-surface)' }}>
                      
                      <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black flex-shrink-0 text-white shadow-sm text-xs sm:text-sm" style={{ background: card.color }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs sm:text-sm mb-1 truncate" style={{ color: 'var(--text-main)' }}>Q: {card.question}</div>
                          <div className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-muted)' }}>A: {card.answer}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-1 flex-shrink-0 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0" style={{ borderColor: 'var(--border-color)' }}>
                        <button onClick={(e) => handleCopy(`Q: ${card.question}\nA: ${card.answer}`, `list-${card.id}`, e)} className="flex-1 sm:flex-none flex justify-center p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--text-main)' }} title="Copy Card">
                          {copiedId === `list-${card.id}` ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
                        </button>
                        <button onClick={() => toggleVisibility(card)} title={card.is_private ? "Make Public" : "Make Private"} className="flex-1 sm:flex-none flex justify-center p-2 rounded-lg transition-colors" style={{ color: card.is_private ? '#ef4444' : '#10b981', background: card.is_private ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }}>
                          {card.is_private ? <Lock size={16} /> : <Globe size={16} />}
                        </button>
                        <button onClick={() => startEdit(card)} className="flex-1 sm:flex-none flex justify-center p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Card">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteCard(card.id)} className="flex-1 sm:flex-none flex justify-center p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Card">
                          <Trash2 size={16} />
                        </button>
                      </div>

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