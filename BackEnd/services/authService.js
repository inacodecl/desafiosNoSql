const jwt = require("jsonwebtoken");

const SECRET  = process.env.JWT_SECRET  || "secret_dev";
const EXPIRES = process.env.JWT_EXPIRES_IN || "8h";

const generarToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
};

const verificarToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = { generarToken, verificarToken };