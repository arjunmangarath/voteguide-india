import { useEffect, useState } from 'react';
import { RefreshCw, Newspaper, Calendar, Map, Settings } from 'lucide-react';

const STATE_LANGUAGES = {
  'Andhra Pradesh':    { name: 'Telugu',    native: 'తెలుగు' },
  'Arunachal Pradesh': { name: 'Hindi',     native: 'हिंदी' },
  'Assam':             { name: 'Assamese',  native: 'অসমীয়া' },
  'Bihar':             { name: 'Hindi',     native: 'हिंदी' },
  'Chhattisgarh':      { name: 'Hindi',     native: 'हिंदी' },
  'Goa':               { name: 'Konkani',   native: 'कोंकणी' },
  'Gujarat':           { name: 'Gujarati',  native: 'ગુજરાતી' },
  'Haryana':           { name: 'Hindi',     native: 'हिंदी' },
  'Himachal Pradesh':  { name: 'Hindi',     native: 'हिंदी' },
  'Jharkhand':         { name: 'Hindi',     native: 'हिंदी' },
  'Karnataka':         { name: 'Kannada',   native: 'ಕನ್ನಡ' },
  'Kerala':            { name: 'Malayalam', native: 'മലയാളം' },
  'Madhya Pradesh':    { name: 'Hindi',     native: 'हिंदी' },
  'Maharashtra':       { name: 'Marathi',   native: 'मराठी' },
  'Manipur':           { name: 'Meitei',    native: 'মৈতৈ' },
  'Meghalaya':         { name: 'Khasi',     native: 'Khasi' },
  'Mizoram':           { name: 'Mizo',      native: 'Mizo' },
  'Nagaland':          { name: 'Nagamese',  native: 'Nagamese' },
  'Odisha':            { name: 'Odia',      native: 'ଓଡ଼ିଆ' },
  'Punjab':            { name: 'Punjabi',   native: 'ਪੰਜਾਬੀ' },
  'Rajasthan':         { name: 'Hindi',     native: 'हिंदी' },
  'Sikkim':            { name: 'Nepali',    native: 'नेपाली' },
  'Tamil Nadu':        { name: 'Tamil',     native: 'தமிழ்' },
  'Telangana':         { name: 'Telugu',    native: 'తెలుగు' },
  'Tripura':           { name: 'Bengali',   native: 'বাংলা' },
  'Uttar Pradesh':     { name: 'Hindi',     native: 'हिंदी' },
  'Uttarakhand':       { name: 'Hindi',     native: 'हिंदी' },
  'West Bengal':       { name: 'Bengali',   native: 'বাংলা' },
  'Delhi':             { name: 'Hindi',     native: 'हिंदी' },
  'Jammu and Kashmir': { name: 'Urdu',      native: 'اردو' },
  'Ladakh':            { name: 'Hindi',     native: 'हिंदी' },
  'Lakshadweep':       { name: 'Malayalam', native: 'മലയാളം' },
  'Puducherry':        { name: 'Tamil',     native: 'தமிழ்' },
  'Andaman and Nicobar Islands': { name: 'Hindi',    native: 'हिंदी' },
  'Chandigarh':        { name: 'Hindi',     native: 'हिंदी' },
  'Dadra and Nagar Haveli and Daman and Diu': { name: 'Gujarati', native: 'ગુજરાતી' },
};
import { useNavigate } from 'react-router-dom';
import { sessionHeaders } from '../session';
import ChatPanel from '../components/Chat/ChatPanel';
import NewsCard from '../components/News/NewsCard';
import ElectionTimeline from '../components/Timeline/ElectionTimeline';
import ConstituencyMap from '../components/Map/ConstituencyMap';
import axios from 'axios';

export default function Dashboard() {
  const [profile, setProfile] = useState({});
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsExpanded, setNewsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [mapExpanded, setMapExpanded] = useState(false);
  const [langMode, setLangMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const headers = sessionHeaders();
    const [profileRes, newsRes, calRes] = await Promise.allSettled([
      axios.post('/api/auth/profile', {}, { headers }),
      axios.get('/api/news', { headers }),
      axios.get('/api/calendar', { headers }),
    ]);
    if (profileRes.status === 'fulfilled') {
      const p = profileRes.value.data.profile || {};
      setProfile(p);
      if (p.language && p.language.name !== 'English') setLangMode(true);
    }
    if (newsRes.status === 'fulfilled') setNews(newsRes.value.data.news || []);
    if (calRes.status === 'fulfilled') setEvents(calRes.value.data.events || []);
    setNewsLoading(false);
  }

  async function refreshNews() {
    setNewsLoading(true);
    try {
      const { data } = await axios.get(`/api/news?state=${encodeURIComponent(profile?.state || '')}`, {
        headers: sessionHeaders(),
      });
      setNews(data.news || []);
    } finally {
      setNewsLoading(false);
    }
  }

  return (
    <div className="h-screen bg-navy-900 flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-[#1a0a2e] pointer-events-none" />

      <header
        className="relative z-20 shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 glass-dark"
        style={{ background: 'linear-gradient(90deg, rgba(255,153,51,0.25) 0%, rgba(255,153,51,0.06) 30%, rgba(15,20,40,0.85) 50%, rgba(19,136,8,0.06) 70%, rgba(19,136,8,0.25) 100%)' }}
      >
        <div className="flex items-center gap-3">
          <svg width="28" height="19" viewBox="0 0 30 20" className="rounded-[2px] shadow-sm shrink-0">
            <rect x="0" y="0" width="30" height="6.67" fill="#FF9933" />
            <rect x="0" y="6.67" width="30" height="6.67" fill="#FFFFFF" />
            <rect x="0" y="13.33" width="30" height="6.67" fill="#138808" />
            <circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" strokeWidth="0.6" />
            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map((i) => {
              const a = (i * Math.PI * 2) / 24;
              return <line key={i} x1="15" y1="10" x2={15 + 2.4 * Math.cos(a)} y2={10 + 2.4 * Math.sin(a)} stroke="#000080" strokeWidth="0.3" />;
            })}
          </svg>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">VoteGuide India</h1>
            {profile?.state && (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-saffron-400 text-xs">{profile.state}</p>
                {(profile?.language || STATE_LANGUAGES[profile.state]) && (() => {
                  const lang = profile?.language || STATE_LANGUAGES[profile.state];
                  return (
                    <button
                      onClick={() => setLangMode((p) => !p)}
                      title={langMode ? 'Switch to English' : `Switch to ${lang.name}`}
                      aria-pressed={langMode}
                      className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                        langMode
                          ? 'bg-saffron-500/20 border-saffron-400 text-saffron-400'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                      }`}
                    >
                      <span>🌐</span>
                      <span>{langMode ? lang.native : lang.name}</span>
                    </button>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/wizard')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <Settings size={15} /> <span className="hidden sm:block">Preferences</span>
        </button>
      </header>

      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-0 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
        <aside className="hidden lg:flex flex-col border-r border-white/5 overflow-hidden" aria-label="Election news and polling booths">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Newspaper size={15} className="text-saffron-400" /> Election News
            </div>
            <button onClick={refreshNews} className="text-slate-500 hover:text-saffron-400 transition-colors">
              <RefreshCw size={13} className={newsLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-3 min-h-0">
            {newsLoading
              ? Array(3).fill(0).map((_, i) => <div key={i} className="glass rounded-xl h-24 animate-pulse" />)
              : (newsExpanded ? news : news.slice(0, 3)).map((n, i) => <NewsCard key={i} {...n} />)
            }
            {!newsLoading && news.length > 3 && (
              <button
                onClick={() => setNewsExpanded((p) => !p)}
                aria-expanded={newsExpanded}
                className="w-full text-xs text-slate-500 hover:text-saffron-400 py-2 border border-white/5 rounded-xl transition-colors"
              >
                {newsExpanded ? '▲ Show less' : `▼ Show ${news.length - 3} more`}
              </button>
            )}
          </div>
          <div className="border-t border-white/5 flex flex-col" style={{ height: '260px', minHeight: '260px' }}>
            <div className="flex items-center gap-2 text-white font-semibold text-sm px-4 py-2.5">
              <Map size={15} className="text-saffron-400" />
              {profile?.state ? `${profile.state} Polling Booths` : 'Nearby Polling Booths'}
            </div>
            <div
              className="flex-1 px-3 pb-3 cursor-pointer relative group"
              onClick={() => setMapExpanded(true)}
            >
              <ConstituencyMap state={profile?.state} />
              <div className="absolute inset-3 flex items-end justify-end opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm">
                  Click to expand
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-col overflow-hidden" aria-label="AI election chat assistant">
          <div className="lg:hidden flex flex-col border-b border-white/5">
            <div className="flex h-[3px]">
              <div className="flex-[1] bg-[#FF9933]" />
              <div className="flex-[1] bg-white" />
              <div className="flex-[1] bg-[#138808]" />
            </div>
            <div className="flex">
              {[
                { id: 'chat',     icon: <span>💬</span>,          label: 'Chat',     color: '#FF9933' },
                { id: 'news',     icon: <Newspaper size={14} />,  label: 'News',     color: '#ffffff' },
                { id: 'timeline', icon: <Calendar size={14} />,   label: 'Timeline', color: '#138808' },
                { id: 'map',      icon: <Map size={14} />,        label: 'Map',      color: '#FF9933' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={activeTab === tab.id ? { color: tab.color, borderBottomColor: tab.color } : {}}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 border-transparent ${activeTab === tab.id ? '' : 'text-slate-500'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className={`h-full ${activeTab !== 'chat' ? 'hidden lg:flex' : 'flex'} flex-col`}>
              <ChatPanel
                userState={profile?.state}
                userProfile={profile}
                language={langMode ? (profile?.language || STATE_LANGUAGES[profile?.state] || null) : null}
              />
            </div>
            {activeTab === 'news' && (
              <div className="lg:hidden p-3 overflow-y-auto space-y-3 h-full">
                {news.map((n, i) => <NewsCard key={i} {...n} />)}
              </div>
            )}
            {activeTab === 'timeline' && (
              <div className="lg:hidden p-4 overflow-y-auto h-full">
                <ElectionTimeline events={events} />
              </div>
            )}
            {activeTab === 'map' && (
              <div className="lg:hidden p-4 h-full">
                <ConstituencyMap state={profile?.state} />
              </div>
            )}
          </div>
        </main>

        <aside className="hidden lg:flex flex-col border-l border-white/5 overflow-hidden" aria-label="Election timeline">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Calendar size={15} className="text-saffron-400" /> Upcoming Elections
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
            <ElectionTimeline events={events} />
          </div>
        </aside>
      </div>

      {mapExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setMapExpanded(false)}
        >
          <div
            className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ height: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMapExpanded(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-slate-800 rounded-full w-9 h-9 flex items-center justify-center text-base font-bold shadow-lg transition-colors"
            >
              ✕
            </button>
            <ConstituencyMap state={profile?.state} />
          </div>
        </div>
      )}
    </div>
  );
}
