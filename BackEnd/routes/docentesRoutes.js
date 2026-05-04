const express      = require("express");
const router       = express.Router();
const verifyToken  = require("../middlewares/verifyToken");
const verifyAdmin  = require("../middlewares/verifyAdmin");
const verifyDocente = require("../middlewares/verifyDocente");

const {
  getDashboard,
  crearDocente,
  listarDocentes,
  obtenerDocente,
  actualizarDocente,
  eliminarDocente,
} = require("../controllers/docentesController");

// Docente autenticado — dashboard propio
router.get("/dashboard", verifyToken, verifyDocente, getDashboard);

// Solo admin — CRUD de docentes
router.post("/",        verifyToken, verifyAdmin, crearDocente);
router.get("/",         verifyToken, verifyAdmin, listarDocentes);
router.get("/:uid",     verifyToken, verifyAdmin, obtenerDocente);
router.put("/:uid",     verifyToken, verifyAdmin, actualizarDocente);
router.delete("/:uid",  verifyToken, verifyAdmin, eliminarDocente);

module.exports = router;