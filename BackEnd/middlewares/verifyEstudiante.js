const verifyEstudiante = (req, res, next) => {
  if (req.usuario?.rol !== "estudiante") {
    return res.status(403).json({ error: "Acceso restringido a estudiantes" });
  }
  next();
};

module.exports = verifyEstudiante;