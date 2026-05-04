const { col, COLLECTIONS } = require("../db/firestoreCollections");

// POST /api/desafios — crear desafío (docente)
const crearDesafio = async (req, res, next) => {
  try {
    const {
      nombre, descripcion, dificultad, nivel,
      sesionNumero, desafioNumero, tipo,
      tiempoEstimadoMin, puntajeMaximo, intentosPermitidos,
      preguntas,
    } = req.body;

    const uid  = `des_s${sesionNumero}_d${desafioNumero}_${Date.now()}`;
    const data = {
      uid,
      nombre,
      descripcion,
      dificultad:         dificultad       || "Fácil",
      nivel:              nivel            || 1,
      sesionNumero:       sesionNumero     || 1,
      desafioNumero:      desafioNumero    || 1,
      tipo:               tipo             || "normal",
      estado:             "activo",
      tiempoEstimadoMin:  tiempoEstimadoMin || 15,
      puntajeMaximo:      puntajeMaximo    || 30,
      estrellasMaximas:   5,
      intentosPermitidos: intentosPermitidos || 3,
      preguntas:          preguntas        || [],
      creadoPor:          req.usuario.uid,
      creadoEn:           new Date().toISOString(),
    };

    await col(COLLECTIONS.DESAFIOS).doc(uid).set(data);

    res.status(201).json({ mensaje: "Desafío creado", uid });
  } catch (err) {
    next(err);
  }
};

// GET /api/desafios — listar (sin respuestas correctas para estudiantes)
const listarDesafios = async (req, res, next) => {
  try {
    const snap = await col(COLLECTIONS.DESAFIOS)
      .where("estado", "==", "activo")
      .orderBy("sesionNumero")
      .orderBy("desafioNumero")
      .get();

    const esDocente = req.usuario?.rol === "docente";

    const desafios = snap.docs.map((doc) => {
      const d = doc.data();
      if (!esDocente) {
        d.preguntas = d.preguntas.map(({ respuestaCorrecta, feedbackCorrecto, feedbackIncorrecto, ...p }) => p);
      }
      return d;
    });

    res.json(desafios);
  } catch (err) {
    next(err);
  }
};

// GET /api/desafios/:uid
const obtenerDesafio = async (req, res, next) => {
  try {
    const doc = await col(COLLECTIONS.DESAFIOS).doc(req.params.uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Desafío no encontrado" });
    }

    const d         = doc.data();
    const esDocente = req.usuario?.rol === "docente";

    if (!esDocente) {
      d.preguntas = d.preguntas.map(({ respuestaCorrecta, feedbackCorrecto, feedbackIncorrecto, ...p }) => p);
    }

    res.json(d);
  } catch (err) {
    next(err);
  }
};

// PUT /api/desafios/:uid — editar (docente)
const editarDesafio = async (req, res, next) => {
  try {
    await col(COLLECTIONS.DESAFIOS).doc(req.params.uid).update({
      ...req.body,
      actualizadoEn: new Date().toISOString(),
    });
    res.json({ mensaje: "Desafío actualizado" });
  } catch (err) {
    next(err);
  }
};

module.exports = { crearDesafio, listarDesafios, obtenerDesafio, editarDesafio };