const express       = require("express");
const router        = express.Router();
const verifyToken   = require("../middlewares/verifyToken");
const verifyDocente = require("../middlewares/verifyDocente");
const {
  crearDesafio, listarDesafios,
  obtenerDesafio, editarDesafio,
} = require("../controllers/desafiosController");

router.get("/",        verifyToken, listarDesafios);
router.get("/:uid",    verifyToken, obtenerDesafio);
router.post("/",       verifyToken, verifyDocente, crearDesafio);
router.put("/:uid",    verifyToken, verifyDocente, editarDesafio);

module.exports = router;