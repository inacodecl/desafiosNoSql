import { useState, useEffect } from 'react';
import { desafiosAPI } from '../../services/api';
import Topbar from '../../components/layout/Topbar';
import Card   from '../../components/ui/Card';
import Badge  from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import { Plus, Search, Edit2, X, Save, Zap, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const EMPTY_DESAFIO = {
  nombre: '', descripcion: '', dificultad: 'Fácil', nivel: 3,
  sesionNumero: 1, desafioNumero: 1, tipo: 'normal',
  tiempoEstimadoMin: 15, puntajeMaximo: 30, intentosPermitidos: 3,
  preguntas: [],
};

const EMPTY_PREGUNTA = {
  preguntaId: '', orden: 1, tipo: 'opcion_multiple',
  enunciado: '', opciones: [{ id: 'a', texto: '' }, { id: 'b', texto: '' }, { id: 'c', texto: '' }],
  respuestaCorrecta: 'a', puntaje: 10,
  feedbackCorrecto: '¡Correcto!', feedbackIncorrecto: 'Revisa tu respuesta.',
};

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`cyber-card ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'} p-6 fade-in max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5 sticky top-0 pb-3" style={{ background: '#0a1628', zIndex: 1, borderBottom: '1px solid #1e3a5f' }}>
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PreguntaEditor({ pregunta, onChange, onRemove, idx }) {
  const [open, setOpen] = useState(true);
  const upd = (k, v) => onChange({ ...pregunta, [k]: v });
  const updOpcion = (i, v) => {
    const opts = [...pregunta.opciones];
    opts[i] = { ...opts[i], texto: v };
    onChange({ ...pregunta, opciones: opts });
  };

  return (
    <div className="cyber-card mb-3 p-4" style={{ borderColor: 'rgba(168,85,247,.3)' }}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-mono text-xs font-bold">P{idx + 1}</span>
          <span className="text-slate-300 text-sm truncate">{pregunta.enunciado || 'Sin enunciado'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onRemove(); }} className="text-slate-600 hover:text-red-400 transition-colors p-1">
            <Trash2 size={13} />
          </button>
          {open ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Enunciado</label>
            <textarea value={pregunta.enunciado} onChange={e => upd('enunciado', e.target.value)}
              rows={2} className="cyber-input resize-none text-sm" placeholder="¿Qué operador filtra documentos en un pipeline?" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Tipo</label>
              <select value={pregunta.tipo} onChange={e => upd('tipo', e.target.value)} className="cyber-input text-sm">
                <option value="opcion_multiple">Opción múltiple</option>
                <option value="codigo">Código</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Puntaje</label>
              <input type="number" value={pregunta.puntaje} onChange={e => upd('puntaje', +e.target.value)}
                className="cyber-input text-sm" min={1} max={30} />
            </div>
          </div>

          {pregunta.tipo === 'opcion_multiple' && (
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Opciones</label>
              {pregunta.opciones.map((op, i) => (
                <div key={op.id} className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400 w-5">{op.id.toUpperCase()}.</span>
                  <input value={op.texto} onChange={e => updOpcion(i, e.target.value)}
                    className="cyber-input text-sm flex-1" placeholder={`Opción ${op.id.toUpperCase()}`} />
                  <button onClick={() => upd('respuestaCorrecta', op.id)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors ${
                      pregunta.respuestaCorrecta === op.id
                        ? 'bg-teal-500 border-teal-500'
                        : 'border-slate-600 hover:border-teal-500'
                    }`} title="Marcar como correcta" />
                </div>
              ))}
              <p className="text-xs text-slate-600 font-mono">● = respuesta correcta</p>
            </div>
          )}

          {pregunta.tipo === 'codigo' && (
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Respuesta correcta</label>
              <input value={pregunta.respuestaCorrecta} onChange={e => upd('respuestaCorrecta', e.target.value)}
                className="cyber-input text-xs font-mono" placeholder="db.coleccion.aggregate([...])" />
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <input value={pregunta.feedbackCorrecto} onChange={e => upd('feedbackCorrecto', e.target.value)}
              className="cyber-input text-sm" placeholder="Feedback correcto: ¡Excelente!" />
            <input value={pregunta.feedbackIncorrecto} onChange={e => upd('feedbackIncorrecto', e.target.value)}
              className="cyber-input text-sm" placeholder="Feedback incorrecto: Revisa..." />
          </div>
        </div>
      )}
    </div>
  );
}

function DesafioForm({ initial = EMPTY_DESAFIO, onSave, onCancel, loading }) {
  const [form, setForm] = useState({ ...initial, preguntas: initial.preguntas || [] });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addPregunta = () => {
    const n = form.preguntas.length + 1;
    setForm(f => ({
      ...f,
      preguntas: [...f.preguntas, { ...EMPTY_PREGUNTA, preguntaId: `p${n}`, orden: n }]
    }));
  };

  const updPregunta = (i, p) => {
    const arr = [...form.preguntas]; arr[i] = p;
    setForm(f => ({ ...f, preguntas: arr }));
  };

  const removePregunta = (i) => {
    setForm(f => ({ ...f, preguntas: f.preguntas.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { k:'nombre',      l:'Nombre del desafío', ph:'Pipeline básico',  col:2 },
        ].map(f => (
          <div key={f.k} style={{ gridColumn: `span ${f.col||1}` }}>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">{f.l}</label>
            <input value={form[f.k]} onChange={e => upd(f.k, e.target.value)} className="cyber-input text-sm" placeholder={f.ph} />
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Descripción</label>
        <textarea value={form.descripcion} onChange={e => upd('descripcion', e.target.value)}
          rows={2} className="cyber-input resize-none text-sm" placeholder="Descripción del desafío..." />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Sesión</label>
          <select value={form.sesionNumero} onChange={e => upd('sesionNumero', +e.target.value)} className="cyber-input text-sm">
            {[1,2,3,4].map(n => <option key={n} value={n}>Sesión {n}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Desafío #</label>
          <select value={form.desafioNumero} onChange={e => upd('desafioNumero', +e.target.value)} className="cyber-input text-sm">
            {[1,2,3].map(n => <option key={n} value={n}>Desafío {n}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Tipo</label>
          <select value={form.tipo} onChange={e => upd('tipo', e.target.value)} className="cyber-input text-sm">
            <option value="normal">Normal</option>
            <option value="boss">Boss 👾</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Dificultad</label>
          <select value={form.dificultad} onChange={e => upd('dificultad', e.target.value)} className="cyber-input text-sm">
            <option>Fácil</option><option>Medio</option><option>Difícil</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Nivel (1-5)</label>
          <input type="number" min={1} max={5} value={form.nivel}
            onChange={e => upd('nivel', +e.target.value)} className="cyber-input text-sm" />
        </div>
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Tiempo (min)</label>
          <input type="number" min={5} value={form.tiempoEstimadoMin}
            onChange={e => upd('tiempoEstimadoMin', +e.target.value)} className="cyber-input text-sm" />
        </div>
      </div>

      {/* Preguntas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Preguntas ({form.preguntas.length})
          </label>
          <button onClick={addPregunta}
            className="text-xs text-teal-400 hover:text-teal-300 font-mono flex items-center gap-1 transition-colors">
            <Plus size={13} /> Agregar pregunta
          </button>
        </div>
        {form.preguntas.length === 0 && (
          <div className="cyber-card p-4 text-center text-slate-600 text-sm font-mono border-dashed">
            Sin preguntas — agrega al menos una
          </div>
        )}
        {form.preguntas.map((p, i) => (
          <PreguntaEditor key={i} idx={i} pregunta={p}
            onChange={p => updPregunta(i, p)}
            onRemove={() => removePregunta(i)} />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} disabled={loading}
          className="btn-glow flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          Guardar Desafío
        </button>
        <button onClick={onCancel}
          className="flex-1 py-2.5 text-sm text-slate-400 hover:text-white rounded-lg"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e3a5f' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function GestionDesafios() {
  const [desafios, setDesafios] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchDesafios = async () => {
    setFetching(true);
    try { const r = await desafiosAPI.listar(); setDesafios(r.data); setFiltered(r.data); }
    catch { showToast('Error al cargar desafíos', 'error'); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchDesafios(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(desafios.filter(d =>
      !q || d.nombre?.toLowerCase().includes(q) || d.descripcion?.toLowerCase().includes(q)
    ));
  }, [search, desafios]);

  const handleCrear = async (form) => {
    if (!form.nombre) { showToast('El nombre es requerido', 'error'); return; }
    setLoading(true);
    try {
      await desafiosAPI.crear(form);
      showToast('Desafío creado exitosamente');
      setModal(null);
      fetchDesafios();
    } catch (e) { showToast(e.response?.data?.error || 'Error al crear', 'error'); }
    finally { setLoading(false); }
  };

  const handleEditar = async (form) => {
    setLoading(true);
    try {
      await desafiosAPI.actualizar(selected.uid, form);
      showToast('Desafío actualizado');
      setModal(null);
      fetchDesafios();
    } catch (e) { showToast(e.response?.data?.error || 'Error al actualizar', 'error'); }
    finally { setLoading(false); }
  };

  const DIFICULTAD_COLOR = { 'Fácil': 'teal', 'Medio': 'amber', 'Difícil': 'red' };

  return (
    <div className="min-h-screen grid-bg" style={{ background: '#020c1b' }}>
      <Topbar />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg fade-in flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <Zap size={15} />} {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-purple-400" />
              <span className="text-purple-400 font-mono text-xs uppercase tracking-widest">Docente</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Gestión de Desafíos</h1>
            <p className="text-slate-500 text-sm mt-1">{desafios.length} desafíos configurados</p>
          </div>
          <button onClick={() => { setSelected(null); setModal('crear'); }}
            className="btn-glow px-4 py-2.5 text-sm flex items-center gap-2">
            <Plus size={16} /> Nuevo Desafío
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar desafío..." className="cyber-input pl-9 text-sm" />
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <Zap size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">Sin desafíos — crea el primero</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(d => (
              <Card key={d.uid} className="hover:border-purple-500/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={DIFICULTAD_COLOR[d.dificultad] || 'gray'}>{d.dificultad}</Badge>
                    {d.tipo === 'boss' && <Badge variant="red">👾 Boss</Badge>}
                    <Badge variant="gray">S{d.sesionNumero}·D{d.desafioNumero}</Badge>
                  </div>
                  <button onClick={() => { setSelected(d); setModal('editar'); }}
                    className="text-slate-500 hover:text-teal-400 transition-colors p-1">
                    <Edit2 size={14} />
                  </button>
                </div>

                <h3 className="font-bold text-white mb-1">{d.nombre}</h3>
                <p className="text-slate-500 text-xs mb-3 line-clamp-2">{d.descripcion}</p>

                <div className="flex items-center justify-between text-xs text-slate-600 font-mono mb-3">
                  <span>{d.preguntas?.length || 0} preguntas</span>
                  <span>{d.tiempoEstimadoMin} min</span>
                  <span>{d.intentosPermitidos} intentos</span>
                </div>

                <div className="flex items-center justify-between">
                  <StarRating score={d.nivel || 0} max={5} size={14} />
                  <Badge variant={d.estado === 'activo' ? 'teal' : 'gray'}>{d.estado}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {modal === 'crear' && (
        <Modal title="Nuevo Desafío" onClose={() => setModal(null)} wide>
          <DesafioForm onSave={handleCrear} onCancel={() => setModal(null)} loading={loading} />
        </Modal>
      )}

      {modal === 'editar' && selected && (
        <Modal title="Editar Desafío" onClose={() => setModal(null)} wide>
          <DesafioForm initial={selected} onSave={handleEditar} onCancel={() => setModal(null)} loading={loading} />
        </Modal>
      )}
    </div>
  );
}