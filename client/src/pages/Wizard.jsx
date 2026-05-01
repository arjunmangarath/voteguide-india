import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionHeaders } from '../session';
import axios from 'axios';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
  'West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

const INTERESTS = [
  { id: 'register', label: '📋 Register to Vote', desc: 'New voter registration process' },
  { id: 'process', label: '🗳️ Understand the Process', desc: 'How elections work in India' },
  { id: 'track', label: '📡 Track Elections', desc: 'Upcoming dates and schedules' },
  { id: 'booth', label: '📍 Find My Booth', desc: 'Locate polling stations' },
];

const LANGUAGES = [
  { name: 'English',   native: 'English'   },
  { name: 'Hindi',     native: 'हिंदी'     },
  { name: 'Bengali',   native: 'বাংলা'     },
  { name: 'Telugu',    native: 'తెలుగు'   },
  { name: 'Marathi',   native: 'मराठी'     },
  { name: 'Tamil',     native: 'தமிழ்'    },
  { name: 'Gujarati',  native: 'ગુજરાતી'  },
  { name: 'Kannada',   native: 'ಕನ್ನಡ'    },
  { name: 'Malayalam', native: 'മലയാളം'   },
  { name: 'Punjabi',   native: 'ਪੰਜਾਬੀ'    },
  { name: 'Odia',      native: 'ଓଡ଼ିଆ'    },
  { name: 'Urdu',      native: 'اردو'      },
];

const STATE_LANG_MAP = {
  'Andhra Pradesh': 'Telugu',    'Assam': 'Bengali',      'Bihar': 'Hindi',
  'Chhattisgarh': 'Hindi',      'Goa': 'Hindi',          'Gujarat': 'Gujarati',
  'Haryana': 'Hindi',           'Himachal Pradesh': 'Hindi', 'Jharkhand': 'Hindi',
  'Karnataka': 'Kannada',       'Kerala': 'Malayalam',   'Madhya Pradesh': 'Hindi',
  'Maharashtra': 'Marathi',     'Odisha': 'Odia',        'Punjab': 'Punjabi',
  'Rajasthan': 'Hindi',         'Tamil Nadu': 'Tamil',   'Telangana': 'Telugu',
  'Tripura': 'Bengali',         'Uttar Pradesh': 'Hindi','Uttarakhand': 'Hindi',
  'West Bengal': 'Bengali',     'Delhi': 'Hindi',        'Jammu & Kashmir': 'Urdu',
  'Puducherry': 'Tamil',        'Ladakh': 'Hindi',
};

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [voterType, setVoterType] = useState('');
  const [state, setState] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [language, setLanguage] = useState(null);
  const [interests, setInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const filteredStates = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  function toggleInterest(id) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function selectState(s) {
    setState(s);
    const langName = STATE_LANG_MAP[s];
    const suggested = langName ? LANGUAGES.find((l) => l.name === langName) : null;
    setLanguage(suggested || null);
    setStep(2);
  }

  function selectLanguage(lang) {
    setLanguage(lang.name === 'English' ? null : lang);
    setStep(3);
  }

  async function finish() {
    setSaving(true);
    try {
      await axios.put('/api/auth/profile', { state, voterType, interests, language }, {
        headers: sessionHeaders(),
      });
    } catch {
    } finally {
      navigate('/dashboard');
    }
  }

  const suggestedLangName = STATE_LANG_MAP[state];

  const steps = [
    {
      title: 'Welcome to VoteGuide India',
      subtitle: 'Are you a first-time voter?',
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[{ id: 'first', label: "Yes, it's my first time", icon: '🌟' },
            { id: 'experienced', label: "No, I've voted before", icon: '✅' }].map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setVoterType(opt.id); setStep(1); }}
              className={`glass rounded-xl p-6 text-center hover:border-saffron-400 transition-all ${voterType === opt.id ? 'border-saffron-400' : ''}`}
            >
              <div className="text-4xl mb-3">{opt.icon}</div>
              <p className="text-sm text-slate-300">{opt.label}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Which state are you in?',
      subtitle: "We'll personalise election info for you",
      content: (
        <div>
          <input
            type="text"
            placeholder="Search state…"
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-saffron-400 mb-3"
          />
          <div className="max-h-56 overflow-y-auto scrollbar-hide space-y-1">
            {filteredStates.map((s) => (
              <button
                key={s}
                onClick={() => selectState(s)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${state === s ? 'bg-saffron-500/20 text-saffron-400' : 'hover:bg-white/5 text-slate-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Preferred language',
      subtitle: 'AI responses will be in your chosen language',
      content: (
        <div className="space-y-4">
          {suggestedLangName && suggestedLangName !== 'English' && (
            <p className="text-xs text-saffron-400/80 px-1">
              🌐 Suggested for {state}: <strong>{suggestedLangName}</strong>
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto scrollbar-hide pr-1">
            {LANGUAGES.map((lang) => {
              const isSelected = language?.name === lang.name || (!language && lang.name === 'English');
              const isSuggested = lang.name === suggestedLangName && lang.name !== 'English';
              return (
                <button
                  key={lang.name}
                  onClick={() => selectLanguage(lang)}
                  className={`relative flex flex-col items-center gap-1 rounded-xl p-3 border transition-all text-center ${
                    isSelected
                      ? 'border-saffron-400 bg-saffron-500/10 text-saffron-400'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8'
                  }`}
                >
                  {isSuggested && !isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-saffron-500 text-white px-1 rounded-full leading-4">✦</span>
                  )}
                  <span className="text-base font-medium leading-tight">{lang.native}</span>
                  {lang.name !== lang.native && (
                    <span className="text-[10px] text-slate-500">{lang.name}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      title: 'What do you want to do?',
      subtitle: 'Select all that apply',
      content: (
        <div className="space-y-3">
          {INTERESTS.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`w-full flex items-center gap-4 glass rounded-xl p-4 text-left transition-all ${interests.includes(interest.id) ? 'border-saffron-400 bg-saffron-500/10' : 'hover:border-white/20'}`}
            >
              <span className="text-xl">{interest.label.split(' ')[0]}</span>
              <div>
                <p className="text-white text-sm font-medium">{interest.label.split(' ').slice(1).join(' ')}</p>
                <p className="text-slate-400 text-xs">{interest.desc}</p>
              </div>
              {interests.includes(interest.id) && <span className="ml-auto text-saffron-400">✓</span>}
            </button>
          ))}
          <button
            onClick={finish}
            disabled={saving || interests.length === 0}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-semibold py-3 rounded-xl transition-all mt-2 disabled:opacity-50"
          >
            {saving ? 'Setting up…' : 'Get Started →'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="w-full text-slate-500 text-sm py-2 hover:text-slate-300">
            Skip for now
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-[#1a0a2e]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl" />

      <motion.div className="relative z-10 w-full max-w-lg mx-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-3xl">🗳️</span>
            <h1 className="text-2xl font-bold text-white">VoteGuide India</h1>
          </div>
          <div className="flex gap-2 mb-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-saffron-400' : 'bg-white/10'}`} />
            ))}
          </div>
          <p className="text-slate-500 text-xs text-right">{step + 1} of {steps.length}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="glass rounded-2xl p-8"
          >
            <h2 className="text-xl font-bold text-white mb-1">{steps[step].title}</h2>
            <p className="text-slate-400 text-sm mb-6">{steps[step].subtitle}</p>
            {steps[step].content}
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="mt-4 text-slate-500 text-sm hover:text-slate-300">
                ← Back
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
