const { col, COLLECTIONS } = require("../db/firestoreCollections");
const { calcularEstrellas } = require("../utils/calcularEstrellas");
const { admin }             = require("../db/firebase");

// POST /api/progreso — estudiante envía intento
const registrarIntento = async (req, res, next) => {
  try {
    const { uidDesafio, respuestas, tiempoTotalSeg } = req.body;
    const uidEstudiante = req.usuario.uid;

    // Obtener desafío
    const desafioDoc = await col(COLLECTIONS.DESAFIOS).doc(uidDesafio).get();
    if (!desafioDoc.exists) {
      return res.status(404).json({ error: "Desafío no encontrado" });
    }
    const desafio = desafioDoc.data();

    // Obtener o crear documento de progreso
    const progresoId  = `${uidEstudiante}_${uidDesafio}`;
    const progresoRef = col(COLLECTIONS.PROGRESO_ESTUDIANTES).doc(progresoId);
    const progresoDoc = await progresoRef.get();

    const intentosRealizados = progresoDoc.exists
      ? progresoDoc.data().resumen.intentosRealizados
      : 0;

    if (intentosRealizados >= desafio.intentosPermitidos) {
      return res.status(400).json({ error: "Se alcanzó el límite de intentos" });
    }

    const numeroIntento = intentosRealizados + 1;

    // Evaluar respuestas
    let preguntasCorrectas = 0;
    const respuestasEvaluadas = respuestas.map((r) => {
      const pregunta       = desafio.preguntas.find((p) => p.preguntaId === r.preguntaId);
      const correcta       = pregunta && r.respuestaDada === pregunta.respuestaCorrecta;
      const puntajeObtenido = correcta ? pregunta.puntaje : 0;
      if (correcta) preguntasCorrectas++;

      return {
        preguntaId:        r.preguntaId,
        respuestaDada:     r.respuestaDada,
        respuestaCorrecta: pregunta?.respuestaCorrecta || "",
        correcta:          !!correcta,
        puntajeObtenido,
        puntajeMaximo:     pregunta?.puntaje || 0,
        tiempoSeg:         r.tiempoSeg || 0,
        feedback:          correcta
          ? pregunta.feedbackCorrecto
          : pregunta?.feedbackIncorrecto,
      };
    });

    // Calcular score
    const resultado = calcularEstrellas(
      preguntasCorrectas,
      desafio.preguntas.length,
      numeroIntento,
      tiempoTotalSeg,
      desafio.tiempoEstimadoMin
    );

    const ahora     = new Date().toISOString();
    const intentoId = `intento_${String(numeroIntento).padStart(3, "0")}`;

    // Guardar intento en sub-colección (inmutable)
    await progresoRef
      .collection("intentos")
      .doc(intentoId)
      .set({
        intentoId,
        numeroIntento,
        respuestas:     respuestasEvaluadas,
        resultado:      { ...resultado, preguntasCorrectas, preguntasTotal: desafio.preguntas.length },
        tiempoTotalSeg,
        fechaInicio:    req.body.fechaInicio || ahora,
        fechaFin:       ahora,
      });

    // Actualizar resumen de progreso
    const mejorScore = progresoDoc.exists
      ? Math.max(progresoDoc.data().resumen.mejorScore, resultado.score)
      : resultado.score;

    await progresoRef.set(
      {
        uid:            progresoId,
        uidEstudiante,
        uidDesafio,
        sesionNumero:   desafio.sesionNumero,
        desafioNumero:  desafio.desafioNumero,
        resumen: {
          intentosRealizados: numeroIntento,
          intentosMaximos:    desafio.intentosPermitidos,
          mejorScore,
          mejorPuntaje:       mejorScore * 6,
          completado:         resultado.completado,
          ultimaActividad:    ahora,
        },
        primeraParticipacion: progresoDoc.exists
          ? progresoDoc.data().primeraParticipacion
          : ahora,
        ultimoIntento: ahora,
      },
      { merge: true }
    );

    // Actualizar ranking si mejoró
    if (resultado.completado) {
      await actualizarRanking(uidEstudiante, uidDesafio, desafio, mejorScore, tiempoTotalSeg, req.usuario);
    }

    res.status(201).json({
      mensaje:    "Intento registrado",
      intentoId,
      resultado,
      respuestasEvaluadas,
    });
  } catch (err) {
    next(err);
  }
};

// Actualiza el documento de ranking del desafío
const actualizarRanking = async (uidEstudiante, uidDesafio, desafio, score, tiempoSeg, usuarioJWT) => {
  const rankingId  = `rank_${uidDesafio}`;
  const rankingRef = col(COLLECTIONS.RANKING).doc(rankingId);
  const rankingDoc = await rankingRef.get();

  const posiciones = rankingDoc.exists ? rankingDoc.data().posiciones : [];

  const idx = posiciones.findIndex((p) => p.uidEstudiante === uidEstudiante);
  const entrada = {
    uidEstudiante,
    nombre:    usuarioJWT.nombre,
    apellido:  usuarioJWT.apellido,
    seccion:   usuarioJWT.seccion || "",
    score,
    puntaje:   score * 6,
    tiempoSeg,
    completado: true,
  };

  if (idx >= 0) {
    if (score > posiciones[idx].score || (score === posiciones[idx].score && tiempoSeg < posiciones[idx].tiempoSeg)) {
      posiciones[idx] = entrada;
    }
  } else {
    posiciones.push(entrada);
  }

  posiciones.sort((a, b) => b.score - a.score || a.tiempoSeg - b.tiempoSeg);
  posiciones.forEach((p, i) => { p.posicion = i + 1; });

  await rankingRef.set({
    uid:           rankingId,
    uidDesafio,
    sesionNumero:  desafio.sesionNumero,
    desafioNumero: desafio.desafioNumero,
    posiciones,
    actualizadoEn: new Date().toISOString(),
  });
};

// GET /api/progreso/mio — progreso del estudiante autenticado
const miProgreso = async (req, res, next) => {
  try {
    const snap = await col(COLLECTIONS.PROGRESO_ESTUDIANTES)
      .where("uidEstudiante", "==", req.usuario.uid)
      .orderBy("sesionNumero")
      .orderBy("desafioNumero")
      .get();

    const progreso = snap.docs.map((doc) => doc.data());
    res.json(progreso);
  } catch (err) {
    next(err);
  }
};

// GET /api/progreso — todos los resultados (docente)
const todosLosProgresos = async (req, res, next) => {
  try {
    const snap = await col(COLLECTIONS.PROGRESO_ESTUDIANTES)
      .orderBy("ultimoIntento", "desc")
      .get();

    res.json(snap.docs.map((doc) => doc.data()));
  } catch (err) {
    next(err);
  }
};

// GET /api/progreso/:uidEstudiante — progreso individual (docente)
const progresoPorEstudiante = async (req, res, next) => {
  try {
    const snap = await col(COLLECTIONS.PROGRESO_ESTUDIANTES)
      .where("uidEstudiante", "==", req.params.uidEstudiante)
      .orderBy("sesionNumero")
      .get();

    res.json(snap.docs.map((doc) => doc.data()));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registrarIntento,
  miProgreso,
  todosLosProgresos,
  progresoPorEstudiante,
};