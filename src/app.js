require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const loggerMiddleWare = require("./middlewares/logger.middleware");
const authMiddleWare = require("./middlewares/auth.middleware");
const espaciosRoutes = require('./routes/espacios.router');
const membresiasRoutes = require('./routes/membresias.router');
const notificacionesRoutes = require('./routes/notificaciones.router');
const oficinasRoutes = require('./routes/oficinas.router');
const pagosRoutes = require('./routes/pagos.router');
const resenasRoutes = require('./routes/resenas.router');
const reservasRoutes = require('./routes/reservas.router');
const usuariosRoutes = require('./routes/usuarios.router');
const publicRoutes = require("./routes/public.router");

app.use(express.json());
app.use(loggerMiddleWare);
app.use(morgan('dev'));
app.use(cors());

app.use("/public", publicRoutes);
app.use(authMiddleWare);

app.use('/v1', espaciosRoutes);
app.use('/v1', membresiasRoutes);
app.use('/v1', notificacionesRoutes);
app.use('/v1', oficinasRoutes);
app.use('/v1', pagosRoutes);
app.use('/v1', resenasRoutes);
app.use('/v1', reservasRoutes);
app.use('/v1', usuariosRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listen & serve PORT: ${PORT}`);
});
