const { col, COLLECTIONS } = require("../db/firestoreCollections");
const { hashCorreo }        = require("../services/hashService");

// POST /api/usuarios — docente crea alumno
const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, apellido, correo, seccion, jornada } = req.body;

    if (!nombre || !apellido || !correo) {
      return res.status(400).json({ error: "nombre, apellido y correo son requeridos" });
    }

    const correoHash = hashCorreo(correo);

    // Verificar que no exista
    const existe = await col(COLLECTIONS.USUARIOS)
      .where("correoHash", "==", correoHash)
      .limit(1)
      .get();

    if (!existe.empty) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    const uid  = "est_" + Date.now();
    const data = {
      uid,
      nombre,
      apellido,
      correo,
      correoHash,
      rol:        "estudiante",
      seccion:    seccion  || "",
      asignatura: "Bases de Datos No Estructurada",
      jornada:    jornada  || "",
      activo:     true,
      creadoPor:  req.usuario.uid,
      creadoEn:   new Date().toISOString(),
      ultimoAcceso: null,
    };

    await col(COLLECTIONS.USUARIOS).doc(uid).set(data);

    res.status(201).json({ mensaje: "Alumno creado exitosamente", uid });
  } catch (err) {
    next(err);
  }
};

// GET /api/usuarios — listar todos
const listarUsuarios = async (req, res, next) => {
  try {
    const snap = await col(COLLECTIONS.USUARIOS)
      .where("activo", "==", true)
      .orderBy("apellido")
      .get();

    const usuarios = snap.docs.map((doc) => {
      const d = doc.data();
      const { correo, correoHash, ...safe } = d;
      return safe;
    });

    res.json(usuarios);
  } catch (err) {
    next(err);
  }
};

// GET /api/usuarios/:uid — detalle de un alumno
const obtenerUsuario = async (req, res, next) => {
  try {
    const doc = await col(COLLECTIONS.USUARIOS).doc(req.params.uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const { correo, correoHash, ...safe } = doc.data();
    res.json(safe);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/usuarios/:uid — desactivar alumno
const desactivarUsuario = async (req, res, next) => {
  try {
    await col(COLLECTIONS.USUARIOS).doc(req.params.uid).update({ activo: false });
    res.json({ mensaje: "Alumno desactivado" });
  } catch (err) {
    next(err);
  }
};

module.exports = { crearUsuario, listarUsuarios, obtenerUsuario, desactivarUsuario };