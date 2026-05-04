require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes      = require("./routes/authRoutes");
const usuariosRoutes  = require("./routes/usuariosRoutes");
const desafiosRoutes  = require("./routes/desafiosRoutes");
const progresoRoutes  = require("./routes/progresoRoutes");
const rankingRoutes   = require("./routes/rankingRoutes");
const medallasRoutes  = require("./routes/medallasRoutes");
const docentesRoutes  = require("./routes/docentesRoutes");
const errorHandler    = require("./middlewares/errorHandler");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth",      authRoutes);
app.use("/api/usuarios",  usuariosRoutes);
app.use("/api/desafios",  desafiosRoutes);
app.use("/api/progreso",  progresoRoutes);
app.use("/api/ranking",   rankingRoutes);
app.use("/api/medallas",  medallasRoutes);
app.use("/api/docentes",  docentesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});