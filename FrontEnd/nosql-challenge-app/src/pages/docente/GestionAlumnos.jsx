import { useState, useEffect } from 'react';
import { usuariosAPI } from '../../services/api';
import Topbar from '../../components/layout/Topbar';
import Card   from '../../components/ui/Card';
import Badge  from '../../components/ui/Badge';
import { Plus, Search, Trash2, X, Save, Users, AlertCircle, Filter } from 'lucide-react';

const EMPTY = { nombre: '', apellido: '', correo: '', seccion: '', jornada: 'Diurno' };

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cyber-card w-full max-w-md p-6 fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function GestionAlumnos() {
  const [alumnos,  setAlumnos]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState('');
  const [secFilter, setSecFilter] = useState('');
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAlumnos = async () => {
    setFetching(true);
    try { const r = await usuariosAPI.listar(); setAlumnos(r.data); setFiltered(r.data); }
    catch { showToast('Error al cargar alumnos', 'error'); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchAlumnos(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(alumnos.filter(a =>
      (!q || a.nombre?.toLowerCase().includes(q) || a.apellido?.toLowerCase().includes(q)) &&
      (!secFilter || a.seccion === secFilter)
    ));
  }, [search, secFilter, alumnos]);

  const secciones = [...new Set(alumnos.map(a => a.seccion).filter(Boolean))];

  const handleCrear = async () => {
    if (!form.nombre || !form.apellido || !form.correo) {
      showToast('Nombre, apellido y correo son requeridos', 'error'); return;
    }
    setLoading(true);
    try {
      await usuariosAPI.crear(form);
      showToast('Alumno creado exitosamente');
      setModal(null);
      setForm(EMPTY);
      fetchAlumnos();
    } catch (e) { showToast(e.response?.data?.error || 'Error al crear alumno', 'error'); }
    finally { setLoading(false); }
  };

  const handleDesactivar = async () => {
    setLoading(true);
    try {
      await usuariosAPI.desactivar(selected.uid);
      showToast('Alumno desactivado');
      setModal(null);
      fetchAlumnos();
    } catch (e) { showToast(e.response?.data?.error || 'Error', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid-bg" style={{ background: '#020c1b' }}>
      <Topbar />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg fade-in flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <Users size={15} />} {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users size={18} className="text-teal-400" />
              <span className="text-teal-400 font-mono text-xs uppercase tracking-widest">Docente</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Gestión de Alumnos</h1>
            <p className="text-slate-500 text-sm mt-1">{alumnos.length} alumnos registrados</p>
          </div>
          <button onClick={() => { setForm(EMPTY); setModal('crear'); }}
            className="btn-glow px-4 py-2.5 text-sm flex items-center gap-2">
            <Plus size={16} /> Nuevo Alumno
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o apellido..." className="cyber-input pl-9 text-sm" />
          </div>
          {secciones.length > 0 && (
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select value={secFilter} onChange={e => setSecFilter(e.target.value)}
                className="cyber-input pl-9 pr-8 text-sm appearance-none min-w-36"
                style={{ backgroundImage: 'none' }}>
                <option value="">Todas las secciones</option>
                {secciones.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="cyber-card overflow-hidden">
          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">No hay alumnos registrados</p>
              <button onClick={() => setModal('crear')} className="mt-4 text-teal-400 text-sm hover:underline">
                Crear el primer alumno
              </button>
            </div>
          ) : (
            <table className="cyber-table">
              <thead>
                <tr><th>Alumno</th><th>Sección</th><th>Jornada</th><th>Estado</th><th>Último acceso</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.uid}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#0e7490,#0284c7)', color: 'white' }}>
                          {a.nombre?.[0]}{a.apellido?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{a.nombre} {a.apellido}</div>
                          <div className="text-xs text-slate-500 font-mono">{a.uid}</div>
                        </div>
                      </div>
                    </td>
                    <td><Badge variant="blue">{a.seccion || '—'}</Badge></td>
                    <td className="text-sm text-slate-400">{a.jornada || '—'}</td>
                    <td><Badge variant={a.activo ? 'teal' : 'gray'}>{a.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td className="text-xs text-slate-500 font-mono">
                      {a.ultimoAcceso ? new Date(a.ultimoAcceso).toLocaleDateString('es-CL') : 'Nunca'}
                    </td>
                    <td>
                      <button onClick={() => { setSelected(a); setModal('confirmar'); }}
                        className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Crear */}
      {modal === 'crear' && (
        <Modal title="Nuevo Alumno" onClose={() => setModal(null)}>
          <div className="space-y-4">
            {[
              { key:'nombre',   label:'Nombre',   ph:'Juan' },
              { key:'apellido', label:'Apellido',  ph:'Perez' },
              { key:'correo',   label:'Correo',    ph:'juan.perez@inacap.cl', type:'email' },
              { key:'seccion',  label:'Sección',   ph:'BDNE-3B' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">{f.label}</label>
                <input type={f.type||'text'} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.ph} className="cyber-input" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Jornada</label>
              <select value={form.jornada} onChange={e => setForm(p => ({ ...p, jornada: e.target.value }))} className="cyber-input">
                <option>Diurno</option><option>Vespertino</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCrear} disabled={loading}
                className="btn-glow flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                Crear Alumno
              </button>
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 text-sm text-slate-400 hover:text-white transition-colors rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e3a5f' }}>
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Confirmar */}
      {modal === 'confirmar' && selected && (
        <Modal title="Desactivar Alumno" onClose={() => setModal(null)}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)' }}>
              <Trash2 size={24} className="text-red-400" />
            </div>
            <p className="text-white font-medium mb-1">{selected.nombre} {selected.apellido}</p>
            <p className="text-slate-400 text-sm mb-6">El alumno no podrá iniciar sesión. El historial se conserva.</p>
            <div className="flex gap-3">
              <button onClick={handleDesactivar} disabled={loading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg text-white"
                style={{ background: 'rgba(239,68,68,.2)', border: '1px solid rgba(239,68,68,.4)' }}>
                {loading ? 'Desactivando...' : 'Desactivar'}
              </button>
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 text-sm text-slate-400 rounded-lg"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid #1e3a5f' }}>
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}