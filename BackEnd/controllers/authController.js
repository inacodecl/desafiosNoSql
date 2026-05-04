const { col, COLLECTIONS } = require("../db/firestoreCollections");
const { hashCorreo }        = require("../services/hashService");
const { generarToken }      = require("../services/authService");

const login = async (req, res, next) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ error: "El correo es requerido" });
    }

    const correoHash = hashCorreo(correo);

    // Buscar en estudiantes
    let snap = await col(COLLECTIONS.USUARIOS)
      .where("correoHash", "==", correoHash)
      .where("activo", "==", true)
      .limit(1)
      .get();

    // Si no existe, buscar en docentes
    if (snap.empty) {
      snap = await col(COLLECTIONS.DOCENTES)
        .where("correoHash", "==", correoHash)
        .where("activo", "==", true)
        .limit(1)
        .get();
    }

    if (snap.empty) {
      return res.status(401).json({ error: "Correo no registrado o inactivo" });
    }

    const usuario = { uid: snap.docs[0].id, ...snap.docs[0].data() };

    // Actualizar ultimo acceso (solo estudiantes)
    if (usuario.rol === "estudiante") {
      await col(COLLECTIONS.USUARIOS).doc(usuario.uid).update({
        ultimoAcceso: new Date().toISOString(),
      });
    }

    const token = generarToken({
      uid:      usuario.uid,
      nombre:   usuario.nombre,
      apellido: usuario.apellido,
      rol:      usuario.rol,
      seccion:  usuario.seccion || null,
    });

    res.json({
      token,
      usuario: {
        uid:      usuario.uid,
        nombre:   usuario.nombre,
        apellido: usuario.apellido,
        rol:      usuario.rol,
        seccion:  usuario.seccion || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };