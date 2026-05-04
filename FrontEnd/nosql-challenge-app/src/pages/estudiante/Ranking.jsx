import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { rankingAPI, desafiosAPI } from '../../services/api';
import Topbar     from '../../components/layout/Topbar';
import Card       from '../../components/ui/Card';
import StarRating from '../../components/ui/StarRating';
import Badge      from '../../components/ui/Badge';
import { Trophy, Medal, Zap } from 'lucide-react';

const PODIUM_COLORS = [
  { bg: 'linear-gradient(180deg,#fbbf24,#f59e0b)', min: '90px', label: '🥇' },
  { bg: 'linear-gradient(180deg,#93c5fd,#60a5fa)', min: '70px', label: '🥈' },
  { bg: 'linear-gradient(180deg,#6ee7b7,#34d399)', min: '55px', label: '🥉' },
];

export default function Ranking() {
  const { usuario } = useAuth();
  const [desafios,  setDesafios]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [ranking,   setRanking]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);

  useEffect(() => {
    desafiosAPI.listar()
      .then(r => { setDesafios(r.data); if (r.data.length) setSelected(r.data[0].uid); })
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    rankingAPI.porDesafio(selected)
      .then(r => setRanking(r.data))
      .catch(() => setRanking(null))
      .finally(() => setLoading(false));
  }, [selected]);

  const posiciones = ranking?.posiciones || [];
  const top3       = posiciones.slice(0, 3);
  const rest       = posiciones.slice(3);
  const myPos      = posiciones.find(p => p.uidEstudiante === usuario?.uid);

  return (
    <div className="min-h-screen grid-bg" style={{ background: '#020c1b' }}>
      <Topbar />
      <div className="max-w-4xl mx-auto px-4 py-8 fade-in">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} className="text-amber-400" />
            <span className="text-amber-400 font-mono text-xs uppercase tracking-widest">Ranking</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Tabla de posiciones</h1>
        </div>

        {/* My position */}
        {myPos && (
          <div className="cyber-card p-4 mb-6 flex items-center gap-4 flex-wrap"
            style={{ borderColor: 'rgba(20,184,166,.4)', background: 'rgba(20,184,166,.05)' }}>
            <div className="text-3xl font-bold font-mono text-teal-400">#{myPos.posicion}</div>
            <div>
              <div className="font-bold text-white">Tu posición actual</div>
              <div className="text-slate-500 text-sm">{myPos.puntaje} pts · {myPos.tiempoSeg}s</div>
            </div>
            <div className="ml-auto">
              <StarRating score={myPos.score} max={5} size={18} showLabel />
            </div>
          </div>
        )}

        {/* Desafio selector */}
        {fetching ? null : (
          <div className="flex gap-2 mb-8 flex-wrap">
            {desafios.map(d => (
              <button key={d.uid} onClick={() => setSelected(d.uid)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selected === d.uid
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}>
                S{d.sesionNumero}·D{d.desafioNumero} {d.nombre}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posiciones.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <Trophy size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">Nadie ha completado este desafío aún</p>
            <p className="text-teal-400 text-sm mt-1 cursor-pointer hover:underline"
              onClick={() => window.history.back()}>
              ¡Sé el primero!
            </p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 1 && (
              <div className="cyber-card p-6 mb-6">
                <div className="text-center mb-6">
                  <span className="text-amber-400 font-mono text-xs uppercase tracking-widest">Podio</span>
                </div>
                <div className="flex items-end justify-center gap-4">
                  {[top3[1], top3[0], top3[2]].filter(Boolean).map((pos, i) => {
                    const realIdx = pos === top3[0] ? 0 : pos === top3[1] ? 1 : 2;
                    const pc      = PODIUM_COLORS[realIdx];
                    const isMe    = pos.uidEstudiante === usuario?.uid;
                    return (
                      <div key={pos.uidEstudiante} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${isMe ? 'ring-2 ring-teal-400' : ''}`}
                          style={{ background: 'linear-gradient(135deg,#0d9488,#0e7490)', color: 'white', boxShadow: isMe ? '0 0 12px #14b8a644' : '' }}>
                          {pos.nombre?.[0]}{pos.apellido?.[0]}
                        </div>
                        <div className="text-xs font-bold text-white text-center mb-1 max-w-16 truncate">
                          {pos.nombre} {isMe && <span className="text-teal-400">(tú)</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mb-2">{pos.puntaje}pts</div>
                        <div className="w-20 rounded-t-lg flex flex-col items-center justify-end pb-3 pt-2"
                          style={{ background: pc.bg, minHeight: pc.min }}>
                          <div className="text-lg">{pc.label}</div>
                          <div className="text-white font-bold text-sm">#{pos.posicion}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full table */}
            {posiciones.length > 0 && (
              <div className="cyber-card overflow-hidden">
                <table className="cyber-table">
                  <thead>
                    <tr><th>#</th><th>Estudiante</th><th>Sección</th><th>Estrellas</th><th>Puntos</th><th>Tiempo</th></tr>
                  </thead>
                  <tbody>
                    {posiciones.map(pos => {
                      const isMe = pos.uidEstudiante === usuario?.uid;
                      return (
                        <tr key={pos.uidEstudiante} style={isMe ? { background: 'rgba(20,184,166,.07)' } : {}}>
                          <td className="font-mono font-bold text-slate-400">
                            {pos.posicion <= 3
                              ? ['🥇','🥈','🥉'][pos.posicion - 1]
                              : `#${pos.posicion}`}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg,#0d9488,#0e7490)', color: 'white' }}>
                                {pos.nombre?.[0]}{pos.apellido?.[0]}
                              </div>
                              <span className={`font-medium text-sm ${isMe ? 'text-teal-400' : 'text-white'}`}>
                                {pos.nombre} {pos.apellido} {isMe && <span className="text-xs">(tú)</span>}
                              </span>
                            </div>
                          </td>
                          <td><Badge variant="blue" className="text-xs">{pos.seccion || '—'}</Badge></td>
                          <td><StarRating score={pos.score} max={5} size={13} /></td>
                          <td className="font-mono font-bold text-teal-400">{pos.puntaje}</td>
                          <td className="font-mono text-xs text-slate-500">{pos.tiempoSeg}s</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}