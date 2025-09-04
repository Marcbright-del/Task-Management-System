
import React from 'react';

// Light: bg-color-100 text-color-800 border-color-200
// Dark:  bg-color-900/80 text-color-300 border-color-700
const TAG_COLORS = [
  'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/80 dark:text-sky-300 dark:border-sky-700',
  'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/80 dark:text-emerald-300 dark:border-emerald-700',
  'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/80 dark:text-amber-300 dark:border-amber-700',
  'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/80 dark:text-violet-300 dark:border-violet-700',
  'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/80 dark:text-fuchsia-300 dark:border-fuchsia-700',
  'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/80 dark:text-indigo-300 dark:border-indigo-700',
  'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/80 dark:text-rose-300 dark:border-rose-700',
  'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
];

const getTagColorClasses = (tag: string): string => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash % TAG_COLORS.length);
  return TAG_COLORS[index];
};

interface TagProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  isActive?: boolean;
}

export const Tag: React.FC<TagProps> = ({ tag, onRemove, onClick, isActive }) => {
  const colorClasses = getTagColorClasses(tag);
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-80' : '';
  const activeClasses = isActive ? 'ring-2 ring-brand-primary' : '';

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${colorClasses} ${interactiveClasses} ${activeClasses} transition-all`}
        onClick={onClick}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => {
              e.stopPropagation(); // prevent tag click if remove is clicked
              onRemove();
          }}
          className="ml-1.5 -mr-0.5 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-inherit hover:bg-black/20 focus:outline-none"
          aria-label={`Remove tag ${tag}`}
        >
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </span>
  );
};
