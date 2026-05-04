const verifyAdmin = (req, res, next) => {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ error: "Acceso restringido al administrador" });
  }
  next();
};

module.exports = verifyAdmin;