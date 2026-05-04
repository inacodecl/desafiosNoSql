const express            = require("express");
const router             = express.Router();
const verifyToken        = require("../middlewares/verifyToken");
const verifyDocente      = require("../middlewares/verifyDocente");
const verifyEstudiante   = require("../middlewares/verifyEstudiante");
const {
  registrarIntento, miProgreso,
  todosLosProgresos, progresoPorEstudiante,
} = require("../controllers/progresoController");

router.post("/",                   verifyToken, verifyEstudiante, registrarIntento);
router.get("/mio",                 verifyToken, verifyEstudiante, miProgreso);
router.get("/",                    verifyToken, verifyDocente,    todosLosProgresos);
router.get("/:uidEstudiante",      verifyToken, verifyDocente,    progresoPorEstudiante);

module.exports = router;