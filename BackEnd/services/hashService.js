const crypto = require("crypto");

const SALT = process.env.HASH_SALT || "nosql_challenge_salt";

const hashCorreo = (correo) => {
  return crypto
    .createHash("sha256")
    .update(correo.toLowerCase().trim() + SALT)
    .digest("hex");
};

module.exports = { hashCorreo };