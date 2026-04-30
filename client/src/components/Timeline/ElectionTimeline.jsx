const TYPE_COLORS = {
  voting: { dot: 'bg-saffron-500', badge: 'bg-saffron-500' },
  results: { dot: 'bg-green-500', badge: 'bg-green-600' },
  registration: { dot: 'bg-blue-500', badge: 'bg-blue-600' },
  mcc: { dot: 'bg-purple-500', badge: 'bg-purple-600' },
};

const TYPE_LABELS = { voting: 'Voting', results: 'Results', registration: 'Registration', mcc: 'MCC' };

export default function ElectionTimeline({ events = [] }) {
  const upcoming = events.filter((e) => !e.isPast);
  const past = events.filter((e) => e.isPast);

  function renderEvent(event, i, arr) {
    const date = new Date(event.date);
    const daysLeft = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    const colors = TYPE_COLORS[event.type] || { dot: 'bg-slate-500', badge: 'bg-slate-600' };

    return (
      <div key={i} className={`flex gap-3 items-start ${event.isPast ? 'opacity-50' : ''}`}>
        <div className="flex flex-col items-center">
          <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${event.isPast ? 'bg-slate-500' : colors.dot}`} />
          {i < arr.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1 min-h-[24px]" />}
        </div>
        <div className="pb-3 flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${event.isPast ? 'text-slate-400' : 'text-white'}`}>
            {event.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-slate-500 text-xs">
              {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded text-white ${event.isPast ? 'bg-slate-600' : colors.badge}`}>
              {TYPE_LABELS[event.type] || event.type}
            </span>
            {!event.isPast && daysLeft <= 30 && daysLeft > 0 && (
              <span className="text-xs text-saffron-400 font-medium">{daysLeft}d left</span>
            )}
            {event.isPast && <span className="text-xs text-slate-500 italic">Completed</span>}
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-4">No events found</p>;
  }

  return (
    <div className="space-y-1">
      {upcoming.length > 0 && (
        <>
          <p className="text-xs font-semibold text-saffron-400 uppercase tracking-wide mb-3">Upcoming</p>
          {upcoming.map((e, i) => renderEvent(e, i, upcoming))}
        </>
      )}
      {past.length > 0 && (
        <>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4 mb-3">Past (Last 12 months)</p>
          {past.map((e, i) => renderEvent(e, i, past))}
        </>
      )}
    </div>
  );
}
