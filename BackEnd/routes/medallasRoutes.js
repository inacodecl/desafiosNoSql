const express = require("express");
const router  = express.Router();
const { obtenerMedallas } = require("../controllers/medallasController");

router.get("/:uidEstudiante", obtenerMedallas);

module.exports = router;