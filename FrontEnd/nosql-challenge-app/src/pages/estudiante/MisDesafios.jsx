import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { desafiosAPI, progresoAPI, medallasAPI } from '../../services/api';
import Topbar     from '../../components/layout/Topbar';
import Card       from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import { Zap, Trophy, Lock, ChevronRight, Medal, Database } from 'lucide-react';

export default function MisDesafios() {
  const { usuario }  = useAuth();
  const navigate     = useNavigate();
  const [desafios,   setDesafios]   = useState([]);
  const [progreso,   setProgreso]   = useState([]);
  const [medallas,   setMedallas]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [sesionFilt, setSesionFilt] = useState(0); // 0 = todas

  useEffect(() => {
    Promise.all([
      desafiosAPI.listar(),
      progresoAPI.miProgreso(),
      medallasAPI.porEstudiante(usuario.uid),
    ]).then(([d, p, m]) => {
      setDesafios(d.data);
      setProgreso(p.data);
      setMedallas(m.data?.medallas || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [usuario.uid]);

  const getProgreso = (uid) => progreso.find(p => p.uidDesafio === uid);

  const sesiones = [...new Set(desafios.map(d => d.sesionNumero))].sort();

  const filtered = sesionFilt
    ? desafios.filter(d => d.sesionNumero === sesionFilt)
    : desafios;

  // Stats
  const completados = progreso.filter(p => p.resumen?.completado).length;
  const totalScore  = progreso.reduce((acc, p) => acc + (p.resumen?.mejorScore || 0), 0);

  const MEDAL_ICONS = { bronce: '🥉', plata: '🥈', oro: '🥇' };

  return (
    <div className="min-h-screen grid-bg" style={{ background: '#020c1b' }}>
      <Topbar />
      <div className="max-w-6xl mx-auto px-4 py-8 fade-in">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Database size={18} className="text-teal-400" />
            <span className="text-teal-400 font-mono text-xs uppercase tracking-widest">Estudiante</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Hola, <span className="text-teal-400">{usuario?.nombre}</span>
          </h1>
          <p className="text-slate-500 text-sm font-mono">NoSQL Challenge — BDNE Unidad 3</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Desafíos disponibles', value: desafios.length,   color: 'text-cyan-400' },
            { label: 'Completados',          value: completados,        color: 'text-teal-400' },
            { label: 'Score total',          value: totalScore,         color: 'text-purple-400' },
            { label: 'Medallas',             value: medallas.length,    color: 'text-amber-400' },
          ].map(s => (
            <Card key={s.label}>
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Medallas */}
        {medallas.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Medal size={16} className="text-amber-400" />
              <span className="text-amber-400 font-mono text-xs uppercase tracking-widest">Mis medallas</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {medallas.map(m => (
                <div key={m.medallaId} className="cyber-card px-4 py-2 flex items-center gap-2"
                  style={{ borderColor: 'rgba(245,158,11,.3)' }}>
                  <span className="text-lg">{MEDAL_ICONS[m.tipo]}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{m.nombre}</div>
                    <div className="text-xs text-slate-500">{m.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sesion filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setSesionFilt(0)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              sesionFilt === 0 ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-white'
            }`}>
            Todas
          </button>
          {sesiones.map(s => (
            <button key={s} onClick={() => setSesionFilt(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                sesionFilt === s ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-white'
              }`}>
              Sesión {s}
            </button>
          ))}
        </div>

        {/* Desafios */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <Zap size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No hay desafíos disponibles aún</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(d => {
              const prog  = getProgreso(d.uid);
              const score = prog?.resumen?.mejorScore || 0;
              const done  = prog?.resumen?.completado || false;
              const intentos = prog?.resumen?.intentosRealizados || 0;
              const agotado  = intentos >= d.intentosPermitidos && !done;

              return (
                <button key={d.uid}
                  onClick={() => !agotado && navigate(`/estudiante/desafio/${d.uid}`)}
                  className={`cyber-card p-5 text-left transition-all ${
                    agotado
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-teal-500/50 hover:-translate-y-1 cursor-pointer'
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={d.dificultad === 'Fácil' ? 'teal' : d.dificultad === 'Medio' ? 'amber' : 'red'}>
                        {d.dificultad}
                      </Badge>
                      {d.tipo === 'boss' && <Badge variant="purple">👾 Boss</Badge>}
                    </div>
                    {done
                      ? <span className="text-teal-400"><Trophy size={16} /></span>
                      : agotado
                        ? <span className="text-slate-600"><Lock size={16} /></span>
                        : <ChevronRight size={16} className="text-slate-600" />
                    }
                  </div>

                  <div className="text-xs text-slate-500 font-mono mb-1">Sesión {d.sesionNumero} · Desafío {d.desafioNumero}</div>
                  <h3 className="font-bold text-white mb-1 text-sm">{d.nombre}</h3>
                  <p className="text-slate-500 text-xs mb-4 line-clamp-2">{d.descripcion}</p>

                  <div className="flex items-center justify-between">
                    <StarRating score={score} max={5} size={14} />
                    <span className="text-xs text-slate-600 font-mono">
                      {intentos}/{d.intentosPermitidos} intentos
                    </span>
                  </div>

                  {done && (
                    <div className="mt-2 progress-bar">
                      <div className="progress-fill" style={{ width: `${(score / 5) * 100}%` }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}