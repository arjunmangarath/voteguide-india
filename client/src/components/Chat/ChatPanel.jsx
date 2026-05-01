import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { sessionHeaders } from '../../session';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const GREETINGS = {
  Hindi:     (s) => `नमस्ते! 🙏 मैं VoteGuide India हूँ, आपका चुनाव सहायक।\n\nमैं भारतीय चुनाव, मतदाता पंजीकरण, मतदान प्रक्रियाएं और${s ? ` ${s} में` : ' भारत भर में'} आगामी चुनाव कार्यक्रम समझने में मदद कर सकता हूँ।\n\nआप क्या जानना चाहेंगे?`,
  Telugu:    (s) => `నమస్కారం! 🙏 నేను VoteGuide India, మీ ఎన్నికల మార్గదర్శి.\n\nభారత ఎన్నికలు, ఓటర్ నమోదు, పోలింగ్ విధానాలు మరియు${s ? ` ${s}లో` : ' భారతదేశంలో'} రాబోయే ఎన్నికల షెడ్యూల్‌లను అర్థం చేసుకోవడంలో నేను మీకు సహాయం చేయగలను.\n\nమీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?`,
  Bengali:   (s) => `নমস্কার! 🙏 আমি VoteGuide India, আপনার নির্বাচন সহায়ক।\n\nভারতীয় নির্বাচন, ভোটার নিবন্ধন, ভোটদান প্রক্রিয়া এবং${s ? ` ${s}-এ` : ' ভারত জুড়ে'} আসন্ন নির্বাচনের সময়সূচি বুঝতে সাহায্য করতে পারি।\n\nআপনি কী জানতে চান?`,
  Marathi:   (s) => `नमस्कार! 🙏 मी VoteGuide India आहे, तुमचा निवडणूक मार्गदर्शक।\n\nभारतीय निवडणुका, मतदार नोंदणी, मतदान प्रक्रिया आणि${s ? ` ${s} मध्ये` : ' भारतभर'} आगामी निवडणूक वेळापत्रके समजून घेण्यात मदत करू शकतो।\n\nतुम्हाला काय जाणून घ्यायचे आहे?`,
  Tamil:     (s) => `வணக்கம்! 🙏 நான் VoteGuide India, உங்கள் தேர்தல் வழிகாட்டி.\n\nஇந்திய தேர்தல்கள், வாக்காளர் பதிவு, வாக்களிக்கும் நடைமுறைகள் மற்றும்${s ? ` ${s}-இல்` : ' இந்தியா முழுவதும்'} வரவிருக்கும் தேர்தல் அட்டவணைகளை புரிந்துகொள்ள உதவுவேன்.\n\nநீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?`,
  Gujarati:  (s) => `નમસ્તે! 🙏 હું VoteGuide India છું, તમારો ચૂંટણી સહાયક.\n\nભારતીય ચૂંટણીઓ, મતદાર નોંધણી, મતદાન પ્રક્રિયાઓ અને${s ? ` ${s}માં` : ' ભારત ભરમાં'} આગામી ચૂંટણી કાર્યક્રમો સમજવામાં મદદ કરી શકું છું.\n\nતમે શું જાણવા માગો છો?`,
  Kannada:   (s) => `ನಮಸ್ಕಾರ! 🙏 ನಾನು VoteGuide India, ನಿಮ್ಮ ಚುನಾವಣಾ ಮಾರ್ಗದರ್ಶಿ.\n\nಭಾರತೀಯ ಚುನಾವಣೆಗಳು, ಮತದಾರ ನೋಂದಣಿ, ಮತದಾನ ಕಾರ್ಯವಿಧಾನಗಳು ಮತ್ತು${s ? ` ${s}ದಲ್ಲಿ` : ' ಭಾರತದಾದ್ಯಂತ'} ಮುಂಬರುವ ಚುನಾವಣಾ ವೇಳಾಪಟ್ಟಿಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.\n\nನೀವು ಏನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?`,
  Malayalam: (s) => `നമസ്കാരം! 🙏 ഞാൻ VoteGuide India, നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ് സഹായി.\n\nഭാരതീയ തിരഞ്ഞെടുപ്പുകൾ, വോട്ടർ രജിസ്ട്രേഷൻ, വോട്ടിംഗ് നടപടിക്രമങ്ങൾ, ${s ? `${s}-ലെ` : 'ഭാരതം മുഴുവൻ'} ആസന്നമായ ഷെഡ്യൂളുകൾ മനസ്സിലാക്കാൻ ഞാൻ സഹായിക്കും.\n\nനിങ്ങൾക്ക് എന്ത് അറിയണം?`,
  Punjabi:   (s) => `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! 🙏 ਮੈਂ VoteGuide India ਹਾਂ, ਤੁਹਾਡਾ ਚੋਣ ਸਹਾਇਕ।\n\nਭਾਰਤੀ ਚੋਣਾਂ, ਵੋਟਰ ਰਜਿਸਟ੍ਰੇਸ਼ਨ, ਵੋਟਿੰਗ ਪ੍ਰਕਿਰਿਆਵਾਂ ਅਤੇ${s ? ` ${s} ਵਿੱਚ` : ' ਪੂਰੇ ਭਾਰਤ ਵਿੱਚ'} ਆਉਣ ਵਾਲੀਆਂ ਚੋਣਾਂ ਦੇ ਕਾਰਜਕ੍ਰਮ ਸਮਝਣ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।\n\nਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੋਗੇ?`,
  Odia:      (s) => `ନମସ୍କାର! 🙏 ମୁଁ VoteGuide India, ଆପଣଙ୍କ ନିର୍ବାଚନ ସହାୟକ।\n\nଭାରତୀୟ ନିର୍ବାଚନ, ଭୋଟର ପଞ୍ଜୀକରଣ, ଭୋଟ ଦେବା ପ୍ରକ୍ରିୟା ଏବଂ${s ? ` ${s}ରେ` : ' ଭାରତ ଜୁଡ଼ାଇ'} ଆସନ୍ତା ନିର୍ବାଚନ ସମୟ ସୂଚୀ ବୁଝିବାରେ ସାହାଯ୍ୟ କରିପାରିବି।\n\nଆପଣ କ'ଣ ଜାଣିବାକୁ ଚାହୁଁଛନ୍ତି?`,
  Urdu:      (s) => `السلام علیکم! 🙏 میں VoteGuide India ہوں، آپ کا انتخابات رہنما۔\n\nہندوستانی انتخابات، ووٹر رجسٹریشن، ووٹنگ کے طریقہ کار اور${s ? ` ${s} میں` : ' پورے ہندوستان میں'} آنے والے انتخابات کے شیڈول کو سمجھنے میں آپ کی مدد کر سکتا ہوں۔\n\nآپ کیا جاننا چاہتے ہیں؟`,
};

function getGreeting(lang, state) {
  if (lang && GREETINGS[lang.name]) return GREETINGS[lang.name](state);
  return `Namaste! 🙏 I'm VoteGuide India, your election companion.\n\nI can help you understand Indian elections, voter registration, polling procedures, and upcoming election schedules${state ? ` in ${state}` : ' across India'}.\n\nWhat would you like to know?`;
}

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

export default function ChatPanel({ userState, userProfile, language }) {
  const [messages, setMessages] = useState(() => [{ role: 'model', content: getGreeting(language, userState) }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 1) return prev;
      return [{ role: 'model', content: getGreeting(language, userState) }];
    });
  }, [language, userState]);

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
      const raw = messages.slice(-10);
      const firstUser = raw.findIndex((m) => m.role === 'user');
      const history = firstUser === -1 ? [] : raw.slice(firstUser).map((m) => ({ role: m.role, content: m.content }));
      const serverMsg = language
        ? `[Please respond in ${language.name} (${language.native}).] ${msg}`
        : msg;
      const { data } = await axios.post('/api/chat', { message: serverMsg, history }, {
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
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-saffron-500 text-white rounded-br-sm'
                  : 'glass text-slate-200 rounded-bl-sm'
              }`}>
                {msg.role === 'user' ? (
                  <span>{msg.content}</span>
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                      li: ({ children }) => <li className="text-slate-200">{children}</li>,
                      h1: ({ children }) => <h1 className="text-white font-bold text-base mb-2 mt-3">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-white font-semibold text-sm mb-1 mt-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-saffron-400 font-semibold text-sm mb-1 mt-2">{children}</h3>,
                      hr: () => <hr className="border-white/10 my-3" />,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-saffron-400 pl-3 italic text-slate-300">{children}</blockquote>,
                      code: ({ children }) => <code className="bg-white/10 px-1 rounded text-xs">{children}</code>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
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
        {language && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <span className="text-xs text-saffron-400">🌐</span>
            <span className="text-xs text-saffron-400 font-medium">Responding in {language.native} ({language.name})</span>
          </div>
        )}
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
