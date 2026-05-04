const express         = require("express");
const router          = express.Router();
const verifyToken     = require("../middlewares/verifyToken");
const verifyDocente   = require("../middlewares/verifyDocente");
const {
  crearUsuario, listarUsuarios,
  obtenerUsuario, desactivarUsuario,
} = require("../controllers/usuariosController");

router.use(verifyToken, verifyDocente);

router.post("/",        crearUsuario);
router.get("/",         listarUsuarios);
router.get("/:uid",     obtenerUsuario);
router.delete("/:uid",  desactivarUsuario);

module.exports = router;