require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const connectMongoDB = require("../src/models/mongo.client");
const connectToRedis = require("../src/services/redis.service");
const loggerMiddleWare = require("../src/middlewares/logger.middleware");
const authMiddleWare = require("../src/middlewares/auth.middleware");
const sanitizeMiddleware = require("../src/middlewares/sanitizeMiddleware");

const publicRoutes = require("../src/routes/public.router");
const authRouter = require("../src/routes/auth.router");
const espaciosRoutes = require("../src/routes/espacios.router");
const membresiasRoutes = require("../src/routes/membresias.router");
const notificacionesRoutes = require("../src/routes/notificaciones.router");
const oficinasRoutes = require("../src/routes/oficinas.router");
const pagosRoutes = require("../src/routes/pagos.router");
const resenasRoutes = require("../src/routes/resenas.router");
const reservasRoutes = require("../src/routes/reservas.router");
const usuariosRoutes = require("../src/routes/usuarios.router");
const edificiosRoutes = require("../src/routes/edificios.router");
const empresasInmobiliariasRoutes = require("../src/routes/empresaInmobiliarias.router");
const salasReunionRoutes = require("../src/routes/salaReuniones.router");
const escritoriosFlexiblesRoutes = require("../src/routes/escritoriosFlexibles.router");
const serviciosAdicionalesRoutes = require("../src/routes/serviciosAdicionales.router");
const reservasServicioRoutes = require("../src/routes/reservasServicio.router");
const proveedoresRoutes = require("../src/routes/proveedores.router");
const facturasRoutes = require("../src/routes/facturas.router");
const promocionesRoutes = require("../src/routes/promociones.router");
const disponibilidadesRoutes = require("../src/routes/disponibilidades.router");

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

(async()=>{
  try {
      await connectToRedis();
      console.log("✔ Conectado a Redis establecida correctamente");
  } catch (error) {
    console.error("✘ Error al conectar a Redis:", error);
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