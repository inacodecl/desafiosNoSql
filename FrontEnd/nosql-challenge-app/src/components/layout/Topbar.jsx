import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Database, User, Star } from 'lucide-react';

const NAV_LINKS = {
  admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Docentes',  path: '/admin/docentes' },
  ],
  docente: [
    { label: 'Dashboard',  path: '/docente' },
    { label: 'Alumnos',    path: '/docente/alumnos' },
    { label: 'Desafíos',   path: '/docente/desafios' },
  ],
  estudiante: [
    { label: 'Mis Desafíos', path: '/estudiante' },
    { label: 'Ranking',      path: '/estudiante/ranking' },
  ],
};

const ROL_COLOR = {
  admin:      'text-amber-400 border-amber-400/30 bg-amber-400/10',
  docente:    'text-teal-400  border-teal-400/30  bg-teal-400/10',
  estudiante: 'text-cyan-400  border-cyan-400/30  bg-cyan-400/10',
};

export default function Topbar() {
  const { usuario, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const links     = NAV_LINKS[usuario?.rol] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header style={{ background: 'rgba(10,22,40,0.95)', borderBottom: '1px solid #1e3a5f' }}
      className="sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 mr-4 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)', boxShadow: '0 0 12px #14b8a644' }}>
            <Database size={16} color="white" />
          </div>
          <span className="font-bold text-sm text-white hidden sm:block group-hover:text-teal-400 transition-colors">
            NoSQL Challenge
          </span>
        </button>

        {/* Nav links */}
        <nav className="flex gap-1 flex-1">
          {links.map(link => {
            const active = location.pathname === link.path;
            return (
              <button key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Usuario info */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2">
            <div className={`badge border text-xs ${ROL_COLOR[usuario?.rol]}`}>
              {usuario?.rol?.toUpperCase()}
            </div>
            <span className="text-slate-300 text-sm font-medium">
              {usuario?.nombre} {usuario?.apellido}
            </span>
          </div>

          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0e7490)', color: 'white' }}>
            {usuario?.nombre?.[0]}{usuario?.apellido?.[0]}
          </div>

          <button onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-400/10"
            title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}