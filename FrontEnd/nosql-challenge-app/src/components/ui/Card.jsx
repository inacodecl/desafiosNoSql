export default function Card({ children, className = '', glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cyber-card p-5 ${glow ? 'animate-glow-pulse' : ''} ${onClick ? 'cursor-pointer hover:border-teal-500/50 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
}