require("dotenv").config();
require("./utils/instrument.js");

const Sentry = require("@sentry/node");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const connectMongoDB = require("./models/mongo.client");
const connectToRedis = require("./services/redis.service");
//const loggerMiddleWare = require("./middlewares/logger.middleware");
const authMiddleWare = require("./middlewares/auth.middleware");
const sanitizeMiddleware = require("./middlewares/sanitizeMiddleware");
const logger = require("./utils/logger.js");

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
const edificiosRoutes = require("./routes/edificios.router");
const empresasInmobiliariasRoutes = require("./routes/empresaInmobiliarias.router");
const salasReunionRoutes = require("./routes/salaReuniones.router");
const escritoriosFlexiblesRoutes = require("./routes/escritoriosFlexibles.router");
const serviciosAdicionalesRoutes = require("./routes/serviciosAdicionales.router");
const reservasServicioRoutes = require("./routes/reservasServicio.router");
const proveedoresRoutes = require("./routes/proveedores.router");
const facturasRoutes = require("./routes/facturas.router");
const promocionesRoutes = require("./routes/promociones.router");
const disponibilidadesRoutes = require("./routes/disponibilidades.router");

const app = express();

(async () => {
  try {
    await connectMongoDB();
    logger.info("Conexión a MongoDB establecida correctamente");
  } catch (error) {
    logger.sentryError({
      message: "Ha ocurrido un error al intentar conectarse a MongoDB: ",
      error,
    });
    process.exit(1);
  }
})();

(async () => {
  try {
    await connectToRedis();
    logger.info("Conexión a redis establecida correctamente");
  } catch (error) {
    console.log("Ha ocurrido un error al intentar conectarse a Redis: ", error);
    process.exit(1);
  }
})();

app.use(express.json());
//app.use(loggerMiddleWare);
app.use(morgan("dev"));
app.use(cors());
app.use(sanitizeMiddleware);

app.use("/", publicRoutes);
app.use("/v1/auth", authRouter);

app.use("/v1", authMiddleWare);

app.use("/v1",       espaciosRoutes);
app.use("/v1",     membresiasRoutes);
app.use("/v1", notificacionesRoutes);
app.use("/v1",       oficinasRoutes);
app.use("/v1",          pagosRoutes);
app.use("/v1",        resenasRoutes);
app.use("/v1",       reservasRoutes);
app.use("/v1",       usuariosRoutes);
app.use("/v1",             edificiosRoutes);
app.use("/v1", empresasInmobiliariasRoutes);
app.use("/v1",          salasReunionRoutes);
app.use("/v1",  escritoriosFlexiblesRoutes);
app.use("/v1",  serviciosAdicionalesRoutes);
app.use("/v1",     reservasServicioRoutes);
app.use("/v1",         proveedoresRoutes);
app.use("/v1",            facturasRoutes);
app.use("/v1",         promocionesRoutes);
app.use("/v1",    disponibilidadesRoutes);

//const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`🚀 Servidor corriendo en http://localhost:${PORT}/`);
// });

app.get("/", (req, res) => {
  res.send("🟢 API funcionando correctamente");
});

Sentry.setupExpressErrorHandler(app);

module.exports = app;