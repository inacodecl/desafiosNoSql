const { db } = require("./firebase");

const COLLECTIONS = {
  USUARIOS:              "usuarios",
  DOCENTES:              "docentes",
  DESAFIOS:              "desafios",
  PROGRESO_ESTUDIANTES:  "progreso_estudiantes",
  RANKING:               "ranking",
  MEDALLAS:              "medallas",
};

const col = (name) => db.collection(name);

module.exports = { COLLECTIONS, col };