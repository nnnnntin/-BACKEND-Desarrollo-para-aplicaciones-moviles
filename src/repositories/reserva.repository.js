const Reserva = require("../models/reserva.model");

const getReservas = async (filtros = {}) => {
  return await Reserva.find(filtros)
    .populate('usuarioId', 'nombre email')
    .populate('pagoId')
    .populate('serviciosAdicionales')
    .populate('aprobador.usuarioId', 'nombre email');
};

const findReservaById = async (id) => {
  return await Reserva.findById(id)
    .populate('usuarioId', 'nombre email')
    .populate('pagoId')
    .populate('serviciosAdicionales')
    .populate('aprobador.usuarioId', 'nombre email');
};

const getReservasByUsuario = async (usuarioId) => {
  return await Reserva.find({ usuarioId })
    .populate('pagoId')
    .populate('serviciosAdicionales');
};

const getReservasByEntidad = async (tipoEntidad, entidadId) => {
  return await Reserva.find({
    'entidadReservada.tipo': tipoEntidad,
    'entidadReservada.id': entidadId
  })
    .populate('usuarioId', 'nombre email')
    .populate('pagoId')
    .populate('serviciosAdicionales');
};

const getReservasPendientesAprobacion = async () => {
  return await Reserva.find({
    'aprobador.necesitaAprobacion': true,
    'aprobador.fechaAprobacion': { $exists: false },
    estado: 'pendiente'
  })
    .populate('usuarioId', 'nombre email')
    .populate('entidadReservada.id');
};

const getReservasPorFecha = async (fechaInicio, fechaFin) => {
  return await Reserva.find({
    $or: [
      { fechaInicio: { $gte: fechaInicio, $lte: fechaFin } },
      { fechaFin: { $gte: fechaInicio, $lte: fechaFin } },
      {
        $and: [
          { fechaInicio: { $lte: fechaInicio } },
          { fechaFin: { $gte: fechaFin } }
        ]
      }
    ]
  })
    .populate('usuarioId', 'nombre email')
    .populate('entidadReservada.id');
};

const createReserva = async (reservaData) => {
  const newReserva = new Reserva(reservaData);
  return await newReserva.save();
};

const updateReserva = async (id, payload) => {
  return await Reserva.findByIdAndUpdate(id, payload, { new: true });
};

const deleteReserva = async (id) => {
  return await Reserva.findByIdAndDelete(id);
};

const cambiarEstadoReserva = async (id, nuevoEstado) => {
  return await Reserva.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
};

const aprobarReserva = async (id, aprobadorId, notas = '') => {
  return await Reserva.findByIdAndUpdate(
    id,
    {
      estado: 'confirmada',
      'aprobador.usuarioId': aprobadorId,
      'aprobador.fechaAprobacion': new Date(),
      'aprobador.notas': notas
    },
    { new: true }
  );
};

const rechazarReserva = async (id, aprobadorId, notas) => {
  return await Reserva.findByIdAndUpdate(
    id,
    {
      estado: 'cancelada',
      'aprobador.usuarioId': aprobadorId,
      'aprobador.fechaAprobacion': new Date(),
      'aprobador.notas': notas
    },
    { new: true }
  );
};

const getReservasRecurrentes = async () => {
  return await Reserva.find({ esRecurrente: true })
    .populate('usuarioId', 'nombre email')
    .populate('entidadReservada.id');
};

const vincularPagoReserva = async (id, pagoId) => {
  return await Reserva.findByIdAndUpdate(
    id,
    { pagoId },
    { new: true }
  );
};

const agregarServicioAdicional = async (id, servicioId) => {
  return await Reserva.findByIdAndUpdate(
    id,
    { $push: { serviciosAdicionales: servicioId } },
    { new: true }
  );
};

module.exports = {
  getReservas,
  findReservaById,
  getReservasByUsuario,
  getReservasByEntidad,
  getReservasPendientesAprobacion,
  getReservasPorFecha,
  createReserva,
  updateReserva,
  deleteReserva,
  cambiarEstadoReserva,
  aprobarReserva,
  rechazarReserva,
  getReservasRecurrentes,
  vincularPagoReserva,
  agregarServicioAdicional
};