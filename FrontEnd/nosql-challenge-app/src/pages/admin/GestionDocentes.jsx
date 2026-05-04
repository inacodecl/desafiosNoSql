import { useState, useEffect } from 'react';
import { docentesAPI } from '../../services/api';
import Topbar  from '../../components/layout/Topbar';
import Card    from '../../components/ui/Card';
import Badge   from '../../components/ui/Badge';
import { Plus, Search, Edit2, Trash2, X, Save, UserCheck, AlertCircle, Database } from 'lucide-react';

const EMPTY_FORM = { nombre: '', apellido: '', correo: '', asignatura: 'Bases de Datos No Estructurada' };

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

function DocenteForm({ initial = EMPTY_FORM, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      {[
        { key: 'nombre',     label: 'Nombre',      placeholder: 'Macarena' },
        { key: 'apellido',   label: 'Apellido',     placeholder: 'Angulo' },
        { key: 'correo',     label: 'Correo',       placeholder: 'm.angulo@inacap.cl', type: 'email' },
        { key: 'asignatura', label: 'Asignatura',   placeholder: 'Bases de Datos No Estructurada' },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">{f.label}</label>
          <input
            type={f.type || 'text'}
            value={form[f.key]}
            onChange={e => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="cyber-input"
          />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} disabled={loading}
          className="btn-glow flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          Guardar
        </button>
        <button onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e3a5f' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function GestionDocentes() {
  const [docentes, setDocentes]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search,   setSearch]     = useState('');
  const [modal,    setModal]      = useState(null); // 'crear' | 'editar' | 'confirmar'
  const [selected, setSelected]   = useState(null);
  const [loading,  setLoading]    = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [toast,    setToast]      = useState(null);
  const [stats,    setStats]      = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDocentes = async () => {
    setFetching(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        docentesAPI.listar(),
        docentesAPI.dashboard(),
      ]);
      setDocentes(docsRes.data);
      setFiltered(docsRes.data);
      setStats(statsRes.data);
    } catch { showToast('Error al cargar docentes', 'error'); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchDocentes(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      docentes.filter(d =>
        d.nombre?.toLowerCase().includes(q) ||
        d.apellido?.toLowerCase().includes(q) ||
        d.asignatura?.toLowerCase().includes(q)
      )
    );
  }, [search, docentes]);

  const handleCrear = async (form) => {
    if (!form.nombre || !form.apellido || !form.correo) {
      showToast('Nombre, apellido y correo son requeridos', 'error'); return;
    }
    setLoading(true);
    try {
      await docentesAPI.crear(form);
      showToast('Docente creado exitosamente');
      setModal(null);
      fetchDocentes();
    } catch (e) { showToast(e.response?.data?.error || 'Error al crear docente', 'error'); }
    finally { setLoading(false); }
  };

  const handleActualizar = async (form) => {
    setLoading(true);
    try {
      await docentesAPI.actualizar(selected.uid, form);
      showToast('Docente actualizado');
      setModal(null);
      fetchDocentes();
    } catch (e) { showToast(e.response?.data?.error || 'Error al actualizar', 'error'); }
    finally { setLoading(false); }
  };

  const handleEliminar = async () => {
    setLoading(true);
    try {
      await docentesAPI.eliminar(selected.uid);
      showToast('Docente desactivado');
      setModal(null);
      fetchDocentes();
    } catch (e) { showToast(e.response?.data?.error || 'Error al desactivar', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid-bg" style={{ background: '#020c1b' }}>
      <Topbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg fade-in flex items-center gap-2 ${
          toast.type === 'error'
            ? 'bg-red-500/20 border border-red-500/40 text-red-300'
            : 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <UserCheck size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 fade-in">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database size={20} className="text-teal-400" />
              <span className="text-teal-400 font-mono text-xs uppercase tracking-widest">Panel Admin</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Gestión de Docentes</h1>
            <p className="text-slate-500 text-sm mt-1">Administra los docentes de la plataforma</p>
          </div>
          <button onClick={() => setModal('crear')}
            className="btn-glow px-4 py-2.5 text-sm flex items-center gap-2">
            <Plus size={16} /> Nuevo Docente
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Docentes',      value: docentes.length,          color: 'text-teal-400' },
              { label: 'Estudiantes',   value: stats.totalEstudiantes,   color: 'text-cyan-400' },
              { label: 'Desafíos',      value: stats.totalDesafios,      color: 'text-purple-400' },
              { label: 'Completados',   value: stats.desafiosCompletados, color: 'text-amber-400' },
            ].map(s => (
              <Card key={s.label}>
                <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido o asignatura..."
            className="cyber-input pl-10"
          />
        </div>

        {/* Table */}
        <div className="cyber-card overflow-hidden">
          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <Database size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">No se encontraron docentes</p>
            </div>
          ) : (
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Asignatura</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr key={doc.uid}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg,#0d9488,#0e7490)', color: 'white' }}>
                          {doc.nombre?.[0]}{doc.apellido?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{doc.nombre} {doc.apellido}</div>
                          <div className="text-xs text-slate-500 font-mono">{doc.uid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-slate-400">{doc.correo || '—'}</td>
                    <td className="text-sm">{doc.asignatura}</td>
                    <td>
                      <Badge variant={doc.activo ? 'teal' : 'gray'}>
                        {doc.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelected(doc); setModal('editar'); }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-teal-400 hover:bg-teal-400/10 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => { setSelected(doc); setModal('confirmar'); }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
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
        <Modal title="Nuevo Docente" onClose={() => setModal(null)}>
          <DocenteForm onSave={handleCrear} onCancel={() => setModal(null)} loading={loading} />
        </Modal>
      )}

      {/* Modal Editar */}
      {modal === 'editar' && selected && (
        <Modal title="Editar Docente" onClose={() => setModal(null)}>
          <DocenteForm
            initial={{ nombre: selected.nombre, apellido: selected.apellido, correo: '', asignatura: selected.asignatura }}
            onSave={handleActualizar}
            onCancel={() => setModal(null)}
            loading={loading}
          />
        </Modal>
      )}

      {/* Modal Confirmar */}
      {modal === 'confirmar' && selected && (
        <Modal title="Desactivar Docente" onClose={() => setModal(null)}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Trash2 size={24} className="text-red-400" />
            </div>
            <p className="text-white font-medium mb-1">{selected.nombre} {selected.apellido}</p>
            <p className="text-slate-400 text-sm mb-6">¿Confirmas desactivar este docente? El registro se conserva.</p>
            <div className="flex gap-3">
              <button onClick={handleEliminar} disabled={loading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg text-white transition-all"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
                {loading ? 'Desactivando...' : 'Desactivar'}
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
    </div>
  );
}