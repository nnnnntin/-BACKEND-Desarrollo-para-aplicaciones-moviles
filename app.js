require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./src/middlewares/errorHandler');

const EspaciosRoutes = require('./src/routes/EspaciosRoutes');
const MembresiasRoutes = require('./src/routes/MembresiasRoutes');
const NotificacionesRoutes = require('./src/routes/NotificacionesRoutes');
const OficinasRoutes = require('./src/routes/OficinasRoutes');
const PagosRoutes = require('./src/routes/PagosRoutes');
const ResenasRoutes = require('./src/routes/ResenasRoutes');
const ReservasRoutes = require('./src/routes/ReservasRoutes');
const UsuariosRoutes = require('./src/routes/UsuariosRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenido a la API de Gestión de Oficinas');
});

app.use('/v1/espacios', EspaciosRoutes);
app.use('/v1/membresias', MembresiasRoutes);
app.use('/v1/notificaciones', NotificacionesRoutes);
app.use('/v1/oficinas', OficinasRoutes);
app.use('/v1/pagos', PagosRoutes);
app.use('/v1/resenas', ResenasRoutes);
app.use('/v1/reservas', ReservasRoutes);
app.use('/v1/usuarios', UsuariosRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});