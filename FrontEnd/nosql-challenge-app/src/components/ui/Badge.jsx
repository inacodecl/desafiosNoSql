const VARIANTS = {
  teal:    'bg-teal-500/15  text-teal-400  border border-teal-500/30',
  amber:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  red:     'bg-red-500/15   text-red-400   border border-red-500/30',
  blue:    'bg-blue-500/15  text-blue-400  border border-blue-500/30',
  purple:  'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  gray:    'bg-slate-700/40  text-slate-400  border border-slate-600/30',
  green:   'bg-green-500/15  text-green-400  border border-green-500/30',
};

export default function Badge({ children, variant = 'teal', className = '' }) {
  return (
    <span className={`badge text-xs ${VARIANTS[variant] || VARIANTS.gray} ${className}`}>
      {children}
    </span>
  );
}