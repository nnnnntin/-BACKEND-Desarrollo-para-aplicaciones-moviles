const Resena = require("../models/resena.model");

const getResenas = async (filtros = {}) => {
  return await Resena.find(filtros)
    .populate('usuarioId', 'nombre email')
    .populate('reservaId')
    .populate('respuesta.usuarioId', 'nombre email')
    .sort({ createdAt: -1 });
};

const findResenaById = async (id) => {
  return await Resena.findById(id)
    .populate('usuarioId', 'nombre email')
    .populate('reservaId')
    .populate('respuesta.usuarioId', 'nombre email');
};

const getResenasByUsuario = async (usuarioId) => {
  return await Resena.find({ usuarioId })
    .populate('reservaId')
    .sort({ createdAt: -1 });
};

const getResenasByEntidad = async (tipoEntidad, entidadId) => {
  return await Resena.find({
    'entidadResenada.tipo': tipoEntidad,
    'entidadResenada.id': entidadId
  })
    .populate('usuarioId', 'nombre email')
    .populate('respuesta.usuarioId', 'nombre email')
    .sort({ createdAt: -1 });
};

const getResenasByReserva = async (reservaId) => {
  return await Resena.find({ reservaId })
    .populate('usuarioId', 'nombre email')
    .populate('respuesta.usuarioId', 'nombre email');
};

const getResenasPorCalificacion = async (calificacionMinima) => {
  return await Resena.find({ calificacion: { $gte: calificacionMinima } })
    .populate('usuarioId', 'nombre email')
    .populate('entidadResenada.id')
    .sort({ calificacion: -1 });
};

const getResenasPendientesModeracion = async () => {
  return await Resena.find({ estado: 'pendiente' })
    .populate('usuarioId', 'nombre email')
    .populate('entidadResenada.id')
    .sort({ createdAt: -1 });
};

const createResena = async (resenaData) => {
  const newResena = new Resena(resenaData);
  return await newResena.save();
};

const updateResena = async (id, payload) => {
  return await Resena.findByIdAndUpdate(id, payload, { new: true });
};

const deleteResena = async (id) => {
  return await Resena.findByIdAndDelete(id);
};

const cambiarEstadoResena = async (id, nuevoEstado) => {
  return await Resena.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
};

const responderResena = async (id, usuarioId, texto) => {
  return await Resena.findByIdAndUpdate(
    id,
    {
      respuesta: {
        usuarioId,
        texto,
        fecha: new Date()
      }
    },
    { new: true }
  );
};

const moderarResena = async (id, estado, usuarioModeradorId = null) => {
  return await Resena.findByIdAndUpdate(
    id,
    {
      estado,
      usuarioModeradorId,
      fechaModeracion: new Date()
    },
    { new: true }
  );
};

const getPromedioCalificacionEntidad = async (tipoEntidad, entidadId) => {
  const result = await Resena.aggregate([
    {
      $match: {
        'entidadResenada.tipo': tipoEntidad,
        'entidadResenada.id': entidadId,
        estado: 'aprobada'
      }
    },
    {
      $group: {
        _id: null,
        promedioCalificacion: { $avg: '$calificacion' },
        totalResenas: { $sum: 1 },
        promedioLimpieza: { $avg: '$aspectosEvaluados.limpieza' },
        promedioUbicacion: { $avg: '$aspectosEvaluados.ubicacion' },
        promedioServicios: { $avg: '$aspectosEvaluados.servicios' },
        promedioCalidadPrecio: { $avg: '$aspectosEvaluados.relacionCalidadPrecio' }
      }
    }
  ]);
  
  return result[0] || { promedioCalificacion: 0, totalResenas: 0 };
};

module.exports = {
  getResenas,
  findResenaById,
  getResenasByUsuario,
  getResenasByEntidad,
  getResenasByReserva,
  getResenasPorCalificacion,
  getResenasPendientesModeracion,
  createResena,
  updateResena,
  deleteResena,
  cambiarEstadoResena,
  responderResena,
  moderarResena,
  getPromedioCalificacionEntidad
};