const LABELS = ['', 'Intento inicial', 'En desarrollo', 'Logro básico', 'Logro avanzado', 'Dominio completo'];

export default function StarRating({ score = 0, max = 5, size = 18, showLabel = false }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i < score ? '#14b8a6' : '#1e3a5f'}
            stroke={i < score ? '#2dd4bf' : '#1e3a5f'}
            strokeWidth="1"
            style={i < score ? { filter: 'drop-shadow(0 0 4px #14b8a688)' } : {}}
          />
        </svg>
      ))}
      {showLabel && score > 0 && (
        <span className="text-xs text-teal-400 ml-1 font-mono">{LABELS[score]}</span>
      )}
    </div>
  );
}