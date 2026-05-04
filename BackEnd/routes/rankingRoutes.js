const express = require("express");
const router  = express.Router();
const { obtenerRanking, todosLosRankings } = require("../controllers/rankingController");
const verifyToken   = require("../middlewares/verifyToken");
const verifyDocente = require("../middlewares/verifyDocente");

router.get("/",               verifyToken, verifyDocente, todosLosRankings);
router.get("/:uidDesafio",    obtenerRanking);

module.exports = router;