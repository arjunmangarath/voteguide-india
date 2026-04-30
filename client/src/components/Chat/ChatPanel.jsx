import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { sessionHeaders } from '../../session';
import axios from 'axios';

const QUICK_ACTIONS = [
  { label: '📅 Show Timeline', msg: 'Show me the upcoming election timeline for India' },
  { label: '📋 How to Register', msg: 'How do I register as a voter in India?' },
  { label: '📍 Find My Booth', msg: 'How can I find my polling booth?' },
  { label: '📰 Latest News', msg: 'What are the latest election news updates?' },
  { label: '🗳️ Voting Process', msg: 'Explain the Indian election voting process step by step' },
];

const INTEREST_PROMPTS = {
  register: 'I want to register as a voter in India. Please walk me through the complete registration process step by step.',
  process: 'Please explain how Indian elections work — from nomination to results — in a simple, easy-to-understand way.',
  track: 'What are the most important upcoming Indian elections I should know about? Give me a summary of key dates and states.',
  booth: 'How can I find my polling booth and verify my voter registration status in India?',
};

function buildAutoMessage(interests = [], voterType, state) {
  if (!interests || interests.length === 0) return null;

  const context = [
    voterType === 'first' ? 'I am a first-time voter.' : 'I have voted before.',
    state ? `I am from ${state}.` : '',
  ].filter(Boolean).join(' ');

  if (interests.length === 1) {
    return `${context} ${INTEREST_PROMPTS[interests[0]] || ''}`.trim();
  }

  const topics = interests.map((i) => ({
    register: 'voter registration',
    process: 'how elections work',
    track: 'upcoming elections',
    booth: 'finding my polling booth',
  }[i] || i)).join(', ');

  return `${context} I'd like help with: ${topics}. Can you give me a brief overview of each?`;
}

export default function ChatPanel({ userState, userProfile }) {
  const [messages, setMessages] = useState([{
    role: 'model',
    content: `Namaste! 🙏 I'm VoteGuide India, your election companion.\n\nI can help you understand Indian elections, voter registration, polling procedures, and upcoming election schedules${userState ? ` in ${userState}` : ' across India'}.\n\nWhat would you like to know?`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (autoTriggered || !userProfile) return;
    const { interests, voterType, state } = userProfile;
    const autoMsg = buildAutoMessage(interests, voterType, state);
    if (autoMsg) {
      setAutoTriggered(true);
      setTimeout(() => sendMessage(autoMsg), 800);
    }
  }, [userProfile]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const { data } = await axios.post('/api/chat', { message: msg, history }, {
        headers: sessionHeaders(),
      });
      setMessages((prev) => [...prev, { role: 'model', content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-saffron-500 text-white rounded-br-sm'
                  : 'glass text-slate-200 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 size={16} className="text-saffron-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              onClick={() => sendMessage(qa.msg)}
              className="shrink-0 text-xs bg-white/5 hover:bg-saffron-500/20 hover:text-saffron-400 text-slate-400 px-3 py-1.5 rounded-full border border-white/10 transition-all"
            >
              {qa.label}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about elections…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-saffron-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-saffron-500 hover:bg-saffron-600 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
