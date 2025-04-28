const Notificacion = require("../models/notificacion.model");

const getNotificaciones = async (filtros = {}) => {
  return await Notificacion.find(filtros)
    .populate('destinatarioId', 'nombre email')
    .populate('remitenteId', 'nombre email')
    .sort({ createdAt: -1 });
};

const findNotificacionById = async (id) => {
  return await Notificacion.findById(id)
    .populate('destinatarioId', 'nombre email')
    .populate('remitenteId', 'nombre email');
};

const getNotificacionesByUsuario = async (usuarioId, leidas = null) => {
  const filtros = { destinatarioId: usuarioId };
  
  if (leidas !== null) {
    filtros.leido = leidas;
  }
  
  return await Notificacion.find(filtros)
    .populate('remitenteId', 'nombre email')
    .sort({ createdAt: -1 });
};

const getNotificacionesPorTipo = async (tipoNotificacion, destinatarioId = null) => {
  const filtros = { tipoNotificacion };
  
  if (destinatarioId) {
    filtros.destinatarioId = destinatarioId;
  }
  
  return await Notificacion.find(filtros)
    .populate('destinatarioId', 'nombre email')
    .populate('remitenteId', 'nombre email')
    .sort({ createdAt: -1 });
};

const getNotificacionesPendientes = async (destinatarioId) => {
  return await Notificacion.find({
    destinatarioId,
    leido: false,
    accion: { $exists: true, $ne: null }
  })
    .populate('remitenteId', 'nombre email')
    .sort({ prioridad: 1, createdAt: -1 });
};

const createNotificacion = async (notificacionData) => {
  const newNotificacion = new Notificacion(notificacionData);
  return await newNotificacion.save();
};

const updateNotificacion = async (id, payload) => {
  return await Notificacion.findByIdAndUpdate(id, payload, { new: true });
};

const deleteNotificacion = async (id) => {
  return await Notificacion.findByIdAndDelete(id);
};

const marcarComoLeida = async (id) => {
  return await Notificacion.findByIdAndUpdate(
    id,
    {
      leido: true,
      fechaLeido: new Date()
    },
    { new: true }
  );
};

const marcarTodasComoLeidas = async (destinatarioId) => {
  return await Notificacion.updateMany(
    { destinatarioId, leido: false },
    {
      leido: true,
      fechaLeido: new Date()
    }
  );
};

const eliminarNotificacionesExpiradas = async () => {
  const fechaActual = new Date();
  return await Notificacion.deleteMany({
    expirar: { $lt: fechaActual }
  });
};

const getNotificacionesPorEntidad = async (tipoEntidad, entidadId) => {
  return await Notificacion.find({
    'entidadRelacionada.tipo': tipoEntidad,
    'entidadRelacionada.id': entidadId
  })
    .populate('destinatarioId', 'nombre email')
    .populate('remitenteId', 'nombre email')
    .sort({ createdAt: -1 });
};

module.exports = {
  getNotificaciones,
  findNotificacionById,
  getNotificacionesByUsuario,
  getNotificacionesPorTipo,
  getNotificacionesPendientes,
  createNotificacion,
  updateNotificacion,
  deleteNotificacion,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacionesExpiradas,
  getNotificacionesPorEntidad
};