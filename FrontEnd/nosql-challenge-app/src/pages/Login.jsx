import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, Terminal, Zap } from 'lucide-react';

// ── Particle canvas background ──
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,184,166,${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(20,184,166,${0.12 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ── Typing effect ──
function TypingText({ texts }) {
  const [display, setDisplay] = useState('');
  const [tIdx, setTIdx]       = useState(0);
  const [cIdx, setCIdx]       = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[tIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (cIdx < current.length) { setDisplay(current.slice(0, cIdx + 1)); setCIdx(c => c + 1); }
        else { setTimeout(() => setDeleting(true), 1800); }
      } else {
        if (cIdx > 0) { setDisplay(current.slice(0, cIdx - 1)); setCIdx(c => c - 1); }
        else { setDeleting(false); setTIdx(t => (t + 1) % texts.length); }
      }
    }, deleting ? 40 : 80);
    return () => clearTimeout(timeout);
  }, [cIdx, deleting, tIdx, texts]);

  return (
    <span className="font-mono text-teal-400">
      {display}<span className="animate-pulse">|</span>
    </span>
  );
}

const REDIRECT = { admin: '/admin', docente: '/docente', estudiante: '/estudiante' };

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo.trim()) { setError('Ingresa tu correo institucional'); return; }
    setError(''); setLoading(true);
    try {
      const u = await login(correo.trim().toLowerCase());
      navigate(REDIRECT[u.rol] || '/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión. Verifica el servidor.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center relative" style={{ background: '#020c1b' }}>
      <ParticleCanvas />
      <div className="scan-overlay" />

      <div className="relative z-10 w-full max-w-md px-4 fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0e7490)', boxShadow: '0 0 40px #14b8a644' }}>
            <Database size={40} color="white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">NoSQL Challenge</h1>
          <p className="text-slate-500 text-sm font-mono">
            <TypingText texts={['BDNE Unidad 3', 'Bases de Datos No Estructurada', 'Sistema Gamificado']} />
          </p>
        </div>

        {/* Card */}
        <div className="cyber-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <Terminal size={16} className="text-teal-400" />
            <span className="text-teal-400 font-mono text-sm">ACCESO AL SISTEMA</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">
                Correo Institucional
              </label>
              <input
                type="email"
                value={correo}
                onChange={e => { setCorreo(e.target.value); setError(''); }}
                placeholder="usuario@inacap.cl"
                className="cyber-input"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <Zap size={14} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-glow w-full py-3 text-sm font-semibold flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6 font-mono">
            No se requiere contraseña — tu correo es tu identidad
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: '🗄️', label: 'MongoDB' },
            { icon: '⚡', label: 'Gamificado' },
            { icon: '🏆', label: 'Ranking Live' },
          ].map(f => (
            <div key={f.label} className="cyber-card p-3 text-center">
              <div className="text-lg mb-1">{f.icon}</div>
              <div className="text-xs text-slate-500 font-mono">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}