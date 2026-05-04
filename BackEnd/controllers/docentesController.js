const { col, COLLECTIONS } = require("../db/firestoreCollections");
const { hashCorreo }        = require("../services/hashService");

// ── Dashboard (docente) ──────────────────────────────────────

const getDashboard = async (req, res, next) => {
  try {
    const [usuariosSnap, desafiosSnap, progresoSnap] = await Promise.all([
      col(COLLECTIONS.USUARIOS).where("activo", "==", true).get(),
      col(COLLECTIONS.DESAFIOS).where("estado", "==", "activo").get(),
      col(COLLECTIONS.PROGRESO_ESTUDIANTES).get(),
    ]);

    const completados = progresoSnap.docs.filter(
      (d) => d.data().resumen?.completado === true
    ).length;

    res.json({
      totalEstudiantes:     usuariosSnap.size,
      totalDesafios:        desafiosSnap.size,
      totalParticipaciones: progresoSnap.size,
      desafiosCompletados:  completados,
    });
  } catch (err) {
    next(err);
  }
};

// ── CRUD docentes (solo admin) ───────────────────────────────

// POST /api/docentes
const crearDocente = async (req, res, next) => {
  try {
    const { nombre, apellido, correo, asignatura } = req.body;

    if (!nombre || !apellido || !correo) {
      return res.status(400).json({ error: "nombre, apellido y correo son requeridos" });
    }

    const correoHash = hashCorreo(correo);

    const existe = await col(COLLECTIONS.DOCENTES)
      .where("correoHash", "==", correoHash)
      .limit(1)
      .get();

    if (!existe.empty) {
      return res.status(409).json({ error: "El correo ya está registrado como docente" });
    }

    const uid  = "docente_" + Date.now();
    const data = {
      uid,
      nombre,
      apellido,
      correo,
      correoHash,
      rol:        "docente",
      asignatura: asignatura || "Bases de Datos No Estructurada",
      activo:     true,
      creadoPor:  req.usuario.uid,
      creadoEn:   new Date().toISOString(),
    };

    await col(COLLECTIONS.DOCENTES).doc(uid).set(data);
    res.status(201).json({ mensaje: "Docente creado exitosamente", uid });
  } catch (err) {
    next(err);
  }
};

// GET /api/docentes
const listarDocentes = async (req, res, next) => {
  try {
    const snap = await col(COLLECTIONS.DOCENTES).orderBy("apellido").get();

    const docentes = snap.docs.map((doc) => {
      const { correo, correoHash, ...safe } = doc.data();
      return safe;
    });

    res.json(docentes);
  } catch (err) {
    next(err);
  }
};

// GET /api/docentes/:uid
const obtenerDocente = async (req, res, next) => {
  try {
    const doc = await col(COLLECTIONS.DOCENTES).doc(req.params.uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    const { correo, correoHash, ...safe } = doc.data();
    res.json(safe);
  } catch (err) {
    next(err);
  }
};

// PUT /api/docentes/:uid
const actualizarDocente = async (req, res, next) => {
  try {
    const { nombre, apellido, correo, asignatura, activo } = req.body;
    const uid = req.params.uid;

    const docSnap = await col(COLLECTIONS.DOCENTES).doc(uid).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    const cambios = { actualizadoEn: new Date().toISOString() };

    if (nombre     !== undefined) cambios.nombre     = nombre;
    if (apellido   !== undefined) cambios.apellido   = apellido;
    if (asignatura !== undefined) cambios.asignatura = asignatura;
    if (activo     !== undefined) cambios.activo     = activo;

    if (correo) {
      const correoHash = hashCorreo(correo);
      const existe = await col(COLLECTIONS.DOCENTES)
        .where("correoHash", "==", correoHash)
        .limit(1)
        .get();

      if (!existe.empty && existe.docs[0].id !== uid) {
        return res.status(409).json({ error: "El correo ya está en uso por otro docente" });
      }

      cambios.correo     = correo;
      cambios.correoHash = correoHash;
    }

    await col(COLLECTIONS.DOCENTES).doc(uid).update(cambios);
    res.json({ mensaje: "Docente actualizado correctamente" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/docentes/:uid
const eliminarDocente = async (req, res, next) => {
  try {
    const uid = req.params.uid;

    if (uid === req.usuario.uid) {
      return res.status(400).json({ error: "No puedes desactivar tu propia cuenta" });
    }

    const docSnap = await col(COLLECTIONS.DOCENTES).doc(uid).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    await col(COLLECTIONS.DOCENTES).doc(uid).update({
      activo:        false,
      actualizadoEn: new Date().toISOString(),
    });

    res.json({ mensaje: "Docente desactivado correctamente" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  crearDocente,
  listarDocentes,
  obtenerDocente,
  actualizarDocente,
  eliminarDocente,
};