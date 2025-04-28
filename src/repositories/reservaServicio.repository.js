const ReservaServicio = require("../models/reservaServicio.model");

const getReservasServicio = async (filtros = {}) => {
  return await ReservaServicio.find(filtros)
    .populate('usuarioId', 'nombre email')
    .populate('servicioId')
    .populate('reservaEspacioId')
    .populate('pagoId');
};

const findReservaServicioById = async (id) => {
  return await ReservaServicio.findById(id)
    .populate('usuarioId', 'nombre email')
    .populate('servicioId')
    .populate('reservaEspacioId')
    .populate('pagoId');
};

const getReservasByUsuario = async (usuarioId) => {
  return await ReservaServicio.find({ usuarioId })
    .populate('servicioId')
    .populate('reservaEspacioId')
    .populate('pagoId')
    .sort({ fecha: -1 });
};

const getReservasByServicio = async (servicioId) => {
  return await ReservaServicio.find({ servicioId })
    .populate('usuarioId', 'nombre email')
    .populate('reservaEspacioId')
    .populate('pagoId')
    .sort({ fecha: -1 });
};

const getReservasByReservaEspacio = async (reservaEspacioId) => {
  return await ReservaServicio.find({ reservaEspacioId })
    .populate('usuarioId', 'nombre email')
    .populate('servicioId')
    .populate('pagoId')
    .sort({ fecha: -1 });
};

const getReservasPorEstado = async (estado) => {
  return await ReservaServicio.find({ estado })
    .populate('usuarioId', 'nombre email')
    .populate('servicioId')
    .populate('reservaEspacioId')
    .populate('pagoId')
    .sort({ fecha: -1 });
};

const getReservasPorRangoFechas = async (fechaInicio, fechaFin) => {
  return await ReservaServicio.find({
    fecha: { $gte: fechaInicio, $lte: fechaFin }
  })
    .populate('usuarioId', 'nombre email')
    .populate('servicioId')
    .populate('reservaEspacioId')
    .populate('pagoId')
    .sort({ fecha: 1 });
};

const createReservaServicio = async (reservaData) => {
  const newReserva = new ReservaServicio(reservaData);
  return await newReserva.save();
};

const updateReservaServicio = async (id, payload) => {
  return await ReservaServicio.findByIdAndUpdate(id, payload, { new: true });
};

const deleteReservaServicio = async (id) => {
  return await ReservaServicio.findByIdAndDelete(id);
};

const cambiarEstadoReserva = async (id, nuevoEstado) => {
  return await ReservaServicio.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
};

const confirmarReservaServicio = async (id) => {
  return await ReservaServicio.findByIdAndUpdate(
    id,
    { 
      estado: 'confirmado',
      fechaConfirmacion: new Date()
    },
    { new: true }
  );
};

const cancelarReservaServicio = async (id, motivo = '') => {
  return await ReservaServicio.findByIdAndUpdate(
    id,
    { 
      estado: 'cancelado',
      motivoCancelacion: motivo,
      fechaCancelacion: new Date()
    },
    { new: true }
  );
};

const completarReservaServicio = async (id) => {
  return await ReservaServicio.findByIdAndUpdate(
    id,
    { 
      estado: 'completado',
      fechaCompletado: new Date()
    },
    { new: true }
  );
};

const vincularPago = async (id, pagoId) => {
  return await ReservaServicio.findByIdAndUpdate(
    id,
    { pagoId },
    { new: true }
  );
};

const getReservasPendientesByFecha = async (fecha) => {
  // Encuentra reservas pendientes para una fecha específica
  const startOfDay = new Date(fecha);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(fecha);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await ReservaServicio.find({
    fecha: { $gte: startOfDay, $lte: endOfDay },
    estado: 'pendiente'
  })
    .populate('usuarioId', 'nombre email')
    .populate('servicioId')
    .populate('reservaEspacioId')
    .sort({ horaInicio: 1 });
};

module.exports = {
  getReservasServicio,
  findReservaServicioById,
  getReservasByUsuario,
  getReservasByServicio,
  getReservasByReservaEspacio,
  getReservasPorEstado,
  getReservasPorRangoFechas,
  createReservaServicio,
  updateReservaServicio,
  deleteReservaServicio,
  cambiarEstadoReserva,
  confirmarReservaServicio,
  cancelarReservaServicio,
  completarReservaServicio,
  vincularPago,
  getReservasPendientesByFecha
};