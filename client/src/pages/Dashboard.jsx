import { useEffect, useState } from 'react';
import { RefreshCw, Newspaper, Calendar, Map, Settings } from 'lucide-react';
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
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const headers = sessionHeaders();
    const [profileRes, newsRes, calRes] = await Promise.allSettled([
      axios.post('/api/auth/profile', {}, { headers }),
      axios.get('/api/news', { headers }),
      axios.get('/api/calendar', { headers }),
    ]);
    if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.profile || {});
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
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-[#1a0a2e] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 glass-dark">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇮🇳</span>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">VoteGuide India <span className="text-base">🇮🇳</span></h1>
            {profile?.state && <p className="text-saffron-400 text-xs mt-0.5">{profile.state}</p>}
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
        <aside className="hidden lg:flex flex-col border-r border-white/5 overflow-hidden">
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
            <div className="flex-1 px-3 pb-3">
              <ConstituencyMap state={profile?.state} />
            </div>
          </div>
        </aside>

        <main className="flex flex-col overflow-hidden">
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
              <ChatPanel userState={profile?.state} userProfile={profile} />
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

        <aside className="hidden lg:flex flex-col border-l border-white/5 overflow-hidden">
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
    </div>
  );
}
