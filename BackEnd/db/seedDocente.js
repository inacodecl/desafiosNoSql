/**
 * Script para crear un docente desde terminal.
 * Uso:
 *   node db/seedDocente.js
 */

require("dotenv").config();
const { db }         = require("../firebase/firebase");
const { hashCorreo } = require("../services/hashService");

const DOCENTE = {
  nombre:     "Macarena",                        // ← cambia esto
  apellido:   "Angulo",                          // ← cambia esto
  correo:     "m.angulo@inacap.cl",              // ← cambia esto
  asignatura: "Bases de Datos No Estructurada",  // ← cambia si necesitas
};

const crearDocente = async () => {
  const correoHash = hashCorreo(DOCENTE.correo);

  const existe = await db.collection("docentes")
    .where("correoHash", "==", correoHash)
    .limit(1)
    .get();

  if (!existe.empty) {
    console.log("El docente ya existe con uid:", existe.docs[0].id);
    process.exit(0);
  }

  const uid  = "docente_" + Date.now();
  const data = {
    uid,
    nombre:     DOCENTE.nombre,
    apellido:   DOCENTE.apellido,
    correo:     DOCENTE.correo,
    correoHash,
    rol:        "docente",
    asignatura: DOCENTE.asignatura,
    activo:     true,
    creadoEn:   new Date().toISOString(),
  };

  await db.collection("docentes").doc(uid).set(data);

  console.log("Docente creado exitosamente");
  console.log("uid:    ", uid);
  console.log("correo: ", DOCENTE.correo);
  process.exit(0);
};

crearDocente().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});