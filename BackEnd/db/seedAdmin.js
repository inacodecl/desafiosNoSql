/**
 * Script para crear el administrador central.
 * Ejecutar UNA sola vez:
 *   node db/seedAdmin.js
 */

require("dotenv").config();
const { db }         = require("./firebase");
const { hashCorreo } = require("../services/hashService");

const ADMIN = {
  nombre:     "Admin",
  apellido:   "NoSQL Challenge",
  correo:     "admin@nosqlchallenge.cl",   // ← cambia esto
};

const crearAdmin = async () => {
  const correoHash = hashCorreo(ADMIN.correo);

  // Verificar si ya existe
  const existe = await db.collection("docentes")
    .where("correoHash", "==", correoHash)
    .limit(1)
    .get();

  if (!existe.empty) {
    console.log("El admin ya existe con uid:", existe.docs[0].id);
    process.exit(0);
  }

  const uid  = "admin_" + Date.now();
  const data = {
    uid,
    nombre:     ADMIN.nombre,
    apellido:   ADMIN.apellido,
    correo:     ADMIN.correo,
    correoHash,
    rol:        "admin",
    activo:     true,
    creadoEn:   new Date().toISOString(),
  };

  await db.collection("docentes").doc(uid).set(data);

  console.log("Admin creado exitosamente");
  console.log("uid:    ", uid);
  console.log("correo: ", ADMIN.correo);
  console.log("Login con: POST /api/auth/login  { correo: '" + ADMIN.correo + "' }");
  process.exit(0);
};

crearAdmin().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});