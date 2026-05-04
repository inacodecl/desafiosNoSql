const { col, COLLECTIONS } = require("../db/firestoreCollections");

// GET /api/ranking/:uidDesafio
const obtenerRanking = async (req, res, next) => {
  try {
    const doc = await col(COLLECTIONS.RANKING).doc(`rank_${req.params.uidDesafio}`).get();

    if (!doc.exists) {
      return res.json({ posiciones: [] });
    }

    res.json(doc.data());
  } catch (err) {
    next(err);
  }
};

// GET /api/ranking — todos los rankings (docente)
const todosLosRankings = async (req, res, next) => {
  try {
    const snap = await col(COLLECTIONS.RANKING)
      .orderBy("sesionNumero")
      .orderBy("desafioNumero")
      .get();

    res.json(snap.docs.map((doc) => doc.data()));
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerRanking, todosLosRankings };