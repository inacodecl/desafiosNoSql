import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { docentesAPI } from '../../services/api';
import Topbar from '../../components/layout/Topbar';
import Card   from '../../components/ui/Card';
import { Users, Zap, Trophy, BarChart3, ArrowRight, Database } from 'lucide-react';

export default function DocenteDashboard() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    docentesAPI.dashboard()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { label: 'Estudiantes activos', value: stats.totalEstudiantes,     icon: Users,    color: 'text-teal-400',   bg: 'rgba(20,184,166,.1)',  border: 'rgba(20,184,166,.25)' },
    { label: 'Desafíos activos',    value: stats.totalDesafios,        icon: Zap,      color: 'text-purple-400', bg: 'rgba(168,85,247,.1)',  border: 'rgba(168,85,247,.25)' },
    { label: 'Participaciones',     value: stats.totalParticipaciones, icon: BarChart3, color: 'text-cyan-400',   bg: 'rgba(6,182,212,.1)',   border: 'rgba(6,182,212,.25)' },
    { label: 'Completados',         value: stats.desafiosCompletados,  icon: Trophy,   color: 'text-amber-400',  bg: 'rgba(245,158,11,.1)',  border: 'rgba(245,158,11,.25)' },
  ] : [];

  const ACTIONS = [
    { label: 'Gestionar Alumnos',   desc: 'Crear, buscar y gestionar estudiantes', path: '/docente/alumnos',  color: 'from-teal-600 to-teal-700',    icon: Users },
    { label: 'Gestionar Desafíos',  desc: 'Crear desafíos con preguntas y niveles', path: '/docente/desafios', color: 'from-purple-700 to-purple-800', icon: Zap },
  ];

  return (
    <div className="min-h-screen grid-bg" style={{ background: '#020c1b' }}>
      <Topbar />
      <div className="max-w-7xl mx-auto px-4 py-8 fade-in">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Database size={18} className="text-teal-400" />
            <span className="text-teal-400 font-mono text-xs uppercase tracking-widest">Panel Docente</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Bienvenido, <span className="text-teal-400">{usuario?.nombre}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-mono">Sistema NoSQL Challenge — BDNE Unidad 3</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="cyber-card h-24 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {STAT_CARDS.map(s => (
              <Card key={s.label}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <s.icon size={18} className={s.color} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {ACTIONS.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className="cyber-card p-6 text-left hover:border-teal-500/50 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${a.color}`}>
                  <a.icon size={22} color="white" />
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="font-bold text-white text-lg mb-1">{a.label}</div>
              <div className="text-slate-500 text-sm">{a.desc}</div>
            </button>
          ))}
        </div>

        {/* Quick tip */}
        <div className="cyber-card p-4 flex items-start gap-3"
          style={{ borderColor: 'rgba(20,184,166,.3)', background: 'rgba(20,184,166,.05)' }}>
          <Zap size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-400">
            <span className="text-teal-400 font-medium">Tip:</span> Crea primero los alumnos con su correo institucional.
            Luego crea desafíos con preguntas. Los alumnos inician sesión solo con su correo.
          </p>
        </div>
      </div>
    </div>
  );
}