import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { Hero, About, SkillCategory, Project, Document, Tool, ChatSettings } from '@/lib/supabase';

type Props = {
  chatSettings: ChatSettings | null;
  hero: Hero | null;
  about: About | null;
  skillCategories: SkillCategory[];
  projects: Project[];
  documents: Document[];
  tools: Tool[];
};

type Message = {
  role: 'bot' | 'user';
  text: string;
  time: string;
};

export function ChatAssistant({ chatSettings, hero, about, skillCategories, projects, documents, tools }: Props) {
  const { lang, t } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcome = lang === 'km' ? chatSettings?.welcome_km || chatSettings?.welcome_en || '' : chatSettings?.welcome_en || '';
  const botName = lang === 'km' ? chatSettings?.bot_name_km || chatSettings?.bot_name_en || 'Assistant' : chatSettings?.bot_name_en || 'Assistant';

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'bot',
        text: welcome,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [open, welcome, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  if (chatSettings && !chatSettings.enabled) return null;

  const generateReply = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    const name = hero?.name_en || 'Khouv Chvea';

    if (/skill|ជំនាញ/.test(msg) || msg.includes('what can')) {
      const allSkills = skillCategories.map(cat => {
        const skills = (cat.skills || []).map(s => `${s.name_en} (${s.percentage}%)`).join(', ');
        return `${cat.title_en}: ${skills}`;
      }).join('\n');
      return `${name}'s skills include:\n${allSkills}`;
    }

    if (/project|គម្រោង|work|portfolio/.test(msg)) {
      const publishedProjects = projects.filter(p => p.published);
      if (publishedProjects.length === 0) return 'No projects are currently published.';
      const projList = publishedProjects.map(p => `- ${p.title_en}: ${p.description_en.substring(0, 80)}...`).join('\n');
      return `Here are ${name}'s published projects:\n${projList}`;
    }

    if (/document|journey|achievement|certificate|ដំណើរ/.test(msg)) {
      const publishedDocs = documents.filter(d => d.published);
      if (publishedDocs.length === 0) return 'No documents are currently published.';
      const docList = publishedDocs.map(d => `- ${d.title_en}`).join('\n');
      return `Journey & Achievements:\n${docList}`;
    }

    if (/tool|ឧបករណ៍|converter|ocr/.test(msg)) {
      const enabledTools = tools.filter(t => t.enabled);
      if (enabledTools.length === 0) return 'No tools are currently available.';
      const toolList = enabledTools.map(t => `- ${t.name_en}: ${t.description_en}`).join('\n');
      return `Available tools:\n${toolList}`;
    }

    if (/contact|email|reach|ទំនាក់ទំនង/.test(msg)) {
      return `You can contact ${name} via:\n- Email: ${hero ? 'see contact section' : 'khouvchvea123@gmail.com'}\n- Location: ${about ? '' : 'Phnom Penh, Cambodia'}\nUse the contact form on the website to send a message directly.`;
    }

    if (/who|about|tell me|ប្រវត្តិ/.test(msg)) {
      const desc = hero?.description_en || '';
      return `${name} is ${desc}`;
    }

    if (/hello|hi|សួស្តី|hey/.test(msg)) {
      return lang === 'km'
        ? `សួស្តី! ខ្ញុំគឺជាជំនួយការរបស់ ${name}។ តើអ្នកចង់សួរអ្វី?`
        : `Hello! I'm ${name}'s assistant. You can ask me about skills, projects, documents, tools, or contact info.`;
    }

    return lang === 'km'
      ? 'ខ្ញុំមិនមានព័ត៌មានអំពីសំណួរនេះទេ។ សូមសួរអំពីជំនាញ គម្រោង ឯកសារ ឧបករណ៍ ឬទំនាក់ទំនង។'
      : "I don't have information about that. You can ask me about skills, projects, documents, tools, or contact info.";
  };

  const sendMessage = () => {
    const msg = input.trim();
    if (!msg) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: msg, time }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = generateReply(msg);
      setMessages(prev => [...prev, { role: 'bot', text: reply, time }]);
      setTyping(false);
    }, 800);
  };

  const suggestedQuestions = chatSettings?.suggested_questions || [];

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
        style={{ background: 'var(--gradient-accent)', boxShadow: '0 10px 25px var(--primary-glow)', zIndex: 2001 }}
        title="Chat with Assistant"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div
          className="fixed bottom-20 right-5 sm:right-8 w-[90%] sm:w-[350px] h-[480px] max-h-[55vh] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', zIndex: 2000 }}
        >
          <div
            className="px-4 py-3 flex justify-between items-center font-bold"
            style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
          >
            <span className="text-sm">{botName}</span>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--text-main)' }}>
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5 scroll-smooth">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="px-3.5 py-2.5 rounded-xl max-w-[85%] text-sm leading-relaxed break-words"
                style={
                  msg.role === 'bot'
                    ? { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)', alignSelf: 'flex-start' }
                    : { background: 'var(--gradient-accent)', color: 'white', alignSelf: 'flex-end' }
                }
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                <div className="text-[10px] opacity-50 mt-1">{msg.time}</div>
              </div>
            ))}
            {typing && (
              <div
                className="px-3.5 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', alignSelf: 'flex-start' }}
              >
                {t('Thinking...', 'កំពុងគិត...')}
              </div>
            )}
            {messages.length <= 1 && suggestedQuestions.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {suggestedQuestions.slice(0, 5).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); }}
                    className="text-left px-3 py-2 rounded-lg text-xs transition-all hover:translate-x-1"
                    style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', color: 'var(--primary)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('Ask your question...', 'សួរសំណួររបស់អ្នក...')}
              className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            />
            <button
              onClick={sendMessage}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105"
              style={{ background: 'var(--gradient-accent)' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
