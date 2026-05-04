const verifyDocente = (req, res, next) => {
  const rol = req.usuario?.rol;
  if (rol !== "docente" && rol !== "admin") {
    return res.status(403).json({ error: "Acceso restringido a docentes" });
  }
  next();
};

module.exports = verifyDocente;