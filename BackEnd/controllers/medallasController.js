const { col, COLLECTIONS } = require("../db/firestoreCollections");

const MEDALLAS_REGLAS = [
  { id: "primera_estrella", nombre: "Primera estrella",  descripcion: "Completó su primer desafío",              tipo: "bronce", condicion: (r) => r.completado },
  { id: "velocista",        nombre: "Velocista",          descripcion: "Resolvió en menos del 50% del tiempo",    tipo: "plata",  condicion: (r) => r.score === 5  },
  { id: "perfecto",         nombre: "Perfección",         descripcion: "100% correcto en primer intento",         tipo: "oro",    condicion: (r) => r.score >= 4   },
  { id: "persistente",      nombre: "Persistente",        descripcion: "Completó un desafío en el 3er intento",   tipo: "bronce", condicion: (r, n) => r.completado && n === 3 },
];

// Otorgar medallas después de un intento
const otorgarMedallas = async (uidEstudiante, resultado, numeroIntento, usuario, uidDesafio) => {
  const medDocId  = `med_${uidEstudiante}`;
  const medDocRef = col(COLLECTIONS.MEDALLAS).doc(medDocId);
  const medDoc    = await medDocRef.get();

  const medallasActuales = medDoc.exists ? medDoc.data().medallas : [];
  const nuevas           = [];

  for (const regla of MEDALLAS_REGLAS) {
    const yaLaTiene = medallasActuales.some((m) => m.medallaId === regla.id);
    if (!yaLaTiene && regla.condicion(resultado, numeroIntento)) {
      nuevas.push({
        medallaId:   regla.id,
        nombre:      regla.nombre,
        descripcion: regla.descripcion,
        tipo:        regla.tipo,
        uidDesafio,
        otorgadaEn:  new Date().toISOString(),
      });
    }
  }

  if (nuevas.length > 0) {
    const todasLasMedallas = [...medallasActuales, ...nuevas];
    await medDocRef.set({
      uid:           medDocId,
      uidEstudiante,
      nombre:        usuario.nombre,
      apellido:      usuario.apellido,
      seccion:       usuario.seccion || "",
      medallas:      todasLasMedallas,
      totalMedallas: todasLasMedallas.length,
      actualizadoEn: new Date().toISOString(),
    });
  }

  return nuevas;
};

// GET /api/medallas/:uidEstudiante
const obtenerMedallas = async (req, res, next) => {
  try {
    const doc = await col(COLLECTIONS.MEDALLAS).doc(`med_${req.params.uidEstudiante}`).get();

    if (!doc.exists) {
      return res.json({ medallas: [], totalMedallas: 0 });
    }

    res.json(doc.data());
  } catch (err) {
    next(err);
  }
};

module.exports = { otorgarMedallas, obtenerMedallas };