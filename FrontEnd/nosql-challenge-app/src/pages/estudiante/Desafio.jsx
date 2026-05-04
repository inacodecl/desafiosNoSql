import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { desafiosAPI, progresoAPI } from '../../services/api';
import Topbar     from '../../components/layout/Topbar';
import StarRating from '../../components/ui/StarRating';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Send, Clock, Zap } from 'lucide-react';

export default function Desafio() {
  const { uid }    = useParams();
  const navigate   = useNavigate();
  const timerRef   = useRef(null);

  const [desafio,   setDesafio]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [qIdx,      setQIdx]      = useState(0);
  const [answers,   setAnswers]   = useState({});
  const [timers,    setTimers]    = useState({});
  const [elapsed,   setElapsed]   = useState(0);
  const [sending,   setSending]   = useState(false);
  const [resultado, setResultado] = useState(null);
  const [evalResp,  setEvalResp]  = useState(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    desafiosAPI.obtener(uid)
      .then(r => setDesafio(r.data))
      .catch(() => navigate('/estudiante'))
      .finally(() => setLoading(false));
  }, [uid]);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const selectAnswer = (preguntaId, value) => {
    setAnswers(a => ({ ...a, [preguntaId]: value }));
    setTimers(t => ({ ...t, [preguntaId]: Math.floor((Date.now() - startTime.current) / 1000) }));
  };

  const handleSubmit = async () => {
    if (!desafio) return;
    clearInterval(timerRef.current);
    setSending(true);

    const respuestas = desafio.preguntas.map(p => ({
      preguntaId:   p.preguntaId,
      respuestaDada: answers[p.preguntaId] || '',
      tiempoSeg:    timers[p.preguntaId] || elapsed,
    }));

    try {
      const r = await progresoAPI.enviarIntento({
        uidDesafio:     uid,
        tiempoTotalSeg: elapsed,
        fechaInicio:    new Date(startTime.current).toISOString(),
        respuestas,
      });
      setResultado(r.data.resultado);
      setEvalResp(r.data.respuestasEvaluadas);
    } catch (e) {
      alert(e.response?.data?.error || 'Error al enviar');
    } finally { setSending(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#020c1b' }}>
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!desafio) return null;

  const preguntas = desafio.preguntas || [];
  const current   = preguntas[qIdx];
  const answered  = Object.keys(answers).length;

  // ── Pantalla de resultado ──
  if (resultado) {
    const SCORE_LABELS = ['', 'Intento inicial', 'En desarrollo', 'Logro básico', 'Logro avanzado', 'Dominio completo'];
    const SCORE_COLOR  = ['', 'text-red-400', 'text-amber-400', 'text-teal-400', 'text-cyan-400', 'text-purple-400'];

    return (
      <div className="min-h-screen grid-bg" style={{ background: '#020c1b' }}>
        <Topbar />
        <div className="max-w-2xl mx-auto px-4 py-12 fade-in">
          <div className="cyber-card p-8 text-center mb-6">
            <div className="text-5xl mb-4">{resultado.completado ? '🏆' : '⚡'}</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {resultado.completado ? '¡Desafío completado!' : 'Intento registrado'}
            </h2>
            <div className={`text-lg font-bold mb-1 ${SCORE_COLOR[resultado.score]}`}>
              {SCORE_LABELS[resultado.score]}
            </div>
            <div className="flex justify-center my-4">
              <StarRating score={resultado.score} max={5} size={28} />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="cyber-card p-3">
                <div className="text-xl font-bold font-mono text-teal-400">{resultado.puntaje}</div>
                <div className="text-xs text-slate-500">puntos</div>
              </div>
              <div className="cyber-card p-3">
                <div className="text-xl font-bold font-mono text-cyan-400">{resultado.porcentaje}%</div>
                <div className="text-xs text-slate-500">correcto</div>
              </div>
              <div className="cyber-card p-3">
                <div className="text-xl font-bold font-mono text-purple-400">{formatTime(elapsed)}</div>
                <div className="text-xs text-slate-500">tiempo</div>
              </div>
            </div>
          </div>

          {/* Detalle de respuestas */}
          <div className="space-y-3 mb-6">
            {evalResp?.map((r, i) => (
              <div key={r.preguntaId} className="cyber-card p-4"
                style={{ borderColor: r.correcta ? 'rgba(20,184,166,.3)' : 'rgba(239,68,68,.3)' }}>
                <div className="flex items-start gap-3">
                  {r.correcta
                    ? <CheckCircle size={18} className="text-teal-400 flex-shrink-0 mt-0.5" />
                    : <XCircle    size={18} className="text-red-400 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className="text-xs text-slate-500 font-mono mb-1">Pregunta {i+1}</div>
                    <div className="text-sm text-slate-300 mb-1">
                      {r.correcta ? r.feedback : r.feedback}
                    </div>
                    {!r.correcta && (
                      <div className="text-xs text-teal-400 font-mono">
                        Correcta: {r.respuestaCorrecta}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/estudiante')}
              className="btn-glow flex-1 py-3 text-sm font-semibold">
              Volver a mis desafíos
            </button>
            <button onClick={() => navigate('/estudiante/ranking')}
              className="flex-1 py-3 text-sm font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid #1e3a5f' }}>
              Ver ranking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pantalla del desafío ──
  return (
    <div className="min-h-screen grid-bg" style={{ background: '#020c1b' }}>
      <Topbar />
      <div className="max-w-3xl mx-auto px-4 py-8 fade-in">

        {/* Header desafío */}
        <div className="cyber-card p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-slate-500 font-mono mb-0.5">Sesión {desafio.sesionNumero} · Desafío {desafio.desafioNumero}</div>
            <div className="font-bold text-white">{desafio.nombre}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-mono">
              <Clock size={14} className={elapsed > desafio.tiempoEstimadoMin * 60 * 0.7 ? 'text-amber-400' : 'text-teal-400'} />
              <span className={elapsed > desafio.tiempoEstimadoMin * 60 * 0.7 ? 'text-amber-400' : 'text-slate-300'}>
                {formatTime(elapsed)}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono">{answered}/{preguntas.length} respondidas</div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {preguntas.map((p, i) => (
            <button key={i} onClick={() => setQIdx(i)}
              className={`w-8 h-8 rounded-full text-xs font-bold font-mono transition-all ${
                i === qIdx
                  ? 'bg-teal-500 text-white'
                  : answers[p.preguntaId]
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        {current && (
          <div className="cyber-card p-6 mb-6 fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-mono text-purple-400 font-bold uppercase">Pregunta {qIdx + 1} de {preguntas.length}</span>
              <span className="text-xs text-slate-600 font-mono">· {current.puntaje} pts</span>
            </div>

            <p className="text-white font-medium mb-6 leading-relaxed">{current.enunciado}</p>

            {current.tipo === 'opcion_multiple' && (
              <div className="space-y-3">
                {current.opciones?.map(op => (
                  <button key={op.id} onClick={() => selectAnswer(current.preguntaId, op.id)}
                    className={`w-full p-4 rounded-xl text-left text-sm transition-all flex items-center gap-3 ${
                      answers[current.preguntaId] === op.id
                        ? 'border-teal-500 bg-teal-500/15 text-white'
                        : 'border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white'
                    }`}
                    style={{ border: `1px solid ${answers[current.preguntaId] === op.id ? '#14b8a6' : '#334155'}` }}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      answers[current.preguntaId] === op.id ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {op.id.toUpperCase()}
                    </span>
                    {op.texto}
                  </button>
                ))}
              </div>
            )}

            {current.tipo === 'codigo' && (
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Tu respuesta (código)</label>
                <textarea
                  value={answers[current.preguntaId] || ''}
                  onChange={e => selectAnswer(current.preguntaId, e.target.value)}
                  rows={4}
                  className="cyber-input resize-none font-mono text-sm text-teal-400"
                  placeholder="db.coleccion.aggregate([...])"
                />
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setQIdx(q => Math.max(0, q - 1))} disabled={qIdx === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            style={{ border: '1px solid #1e3a5f' }}>
            <ChevronLeft size={16} /> Anterior
          </button>

          {qIdx < preguntas.length - 1 ? (
            <button onClick={() => setQIdx(q => q + 1)}
              className="btn-glow px-4 py-2.5 text-sm flex items-center gap-2">
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={sending || answered < preguntas.length}
              className="btn-glow px-6 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
              {sending
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={16} />}
              {answered < preguntas.length ? `Responde todas (${answered}/${preguntas.length})` : 'Enviar desafío'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}