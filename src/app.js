require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const connectMongoDB = require("./models/mongo.client");
const loggerMiddleWare = require("./middlewares/logger.middleware");
const authMiddleWare = require("./middlewares/auth.middleware");
const sanitizeMiddleware = require("./middlewares/sanitizeMiddleware");

const publicRoutes = require("./routes/public.router");
const authRouter = require("./routes/auth.router");
const espaciosRoutes = require("./routes/espacios.router");
const membresiasRoutes = require("./routes/membresias.router");
const notificacionesRoutes = require("./routes/notificaciones.router");
const oficinasRoutes = require("./routes/oficinas.router");
const pagosRoutes = require("./routes/pagos.router");
const resenasRoutes = require("./routes/resenas.router");
const reservasRoutes = require("./routes/reservas.router");
const usuariosRoutes = require("./routes/usuarios.router");

const app = express();

(async () => {
  try {
    await connectMongoDB();
    console.log("✔ Conectado a MongoDB");
  } catch (error) {
    console.error("✘ Error al conectar a MongoDB:", error);
    process.exit(1);
  }
})();

app.use(express.json());
app.use(loggerMiddleWare);
app.use(morgan("dev"));
app.use(cors());
app.use(sanitizeMiddleware);

app.use("/public", publicRoutes);
app.use("/v1/auth", authRouter);

app.use(authMiddleWare);

app.use("/v1",       espaciosRoutes);
app.use("/v1",     membresiasRoutes);
app.use("/v1", notificacionesRoutes);
app.use("/v1",       oficinasRoutes);
app.use("/v1",          pagosRoutes);
app.use("/v1",        resenasRoutes);
app.use("/v1",       reservasRoutes);
app.use("/v1",       usuariosRoutes);

app.get("/health", (req, res) => res.sendStatus(200));
app.get("/ping",   (req, res) => res.send("pong"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}/`);
});
