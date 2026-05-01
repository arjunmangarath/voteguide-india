import { ExternalLink } from 'lucide-react';

export default function NewsCard({ title, snippet, link, source }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="glass rounded-xl p-4 block hover:border-saffron-400/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-saffron-400 font-medium truncate">{source}</span>
        <ExternalLink size={12} className="text-slate-500 group-hover:text-saffron-400 shrink-0 mt-0.5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-white leading-snug mb-1 line-clamp-2">{title}</h3>
      <p className="text-xs text-slate-400 line-clamp-2">{snippet}</p>
    </a>
  );
}
