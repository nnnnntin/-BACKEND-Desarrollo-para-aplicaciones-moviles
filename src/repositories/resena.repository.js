const Resena = require("../models/resena.model");
const connectToRedis = require("../services/redis.service");

const _getResenasRedisKey = (id) => `id:${id}-resenas`;
const _getResenasFilterRedisKey = (filtros) => `resenas:${JSON.stringify(filtros)}`;
const _getResenasByUsuarioRedisKey = (usuarioId) => `usuario:${usuarioId}-resenas`;
const _getResenasByEntidadRedisKey = (tipoEntidad, entidadId) => `entidad:${tipoEntidad}:${entidadId}-resenas`;
const _getResenasByReservaRedisKey = (reservaId) => `reserva:${reservaId}-resenas`;
const _getResenasPorCalificacionRedisKey = (calificacionMinima) => `resenas:calificacion-min:${calificacionMinima}`;
const _getPromedioCalificacionEntidadRedisKey = (tipoEntidad, entidadId) => `entidad:${tipoEntidad}:${entidadId}-promedio-calificacion`;

const getResenas = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getResenasFilterRedisKey(filtros);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
    const result = await Resena.find(filtros)
      .populate('usuarioId', 'nombre email')
      .populate('reservaId')
      .populate('respuesta.usuarioId', 'nombre email')
      .sort({ createdAt: -1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Resena.find(filtros)
      .populate('usuarioId', 'nombre email')
      .populate('reservaId')
      .populate('respuesta.usuarioId', 'nombre email')
      .sort({ createdAt: -1 })
      .lean();
  }
};

const findResenaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getResenasRedisKey(id);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
    const doc = await Resena.findById(id)
      .populate('usuarioId', 'nombre email')
      .populate('reservaId')
      .populate('respuesta.usuarioId', 'nombre email')
      .lean();
    
    if (doc) {
      await redisClient.set(key, doc, { ex: 3600 });
    }
    
    return doc;
  } catch (error) {
    return await Resena.findById(id)
      .populate('usuarioId', 'nombre email')
      .populate('reservaId')
      .populate('respuesta.usuarioId', 'nombre email')
      .lean();
  }
};

const getResenasByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getResenasByUsuarioRedisKey(usuarioId);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
    const result = await Resena.find({ usuarioId })
      .populate('reservaId')
      .sort({ createdAt: -1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Resena.find({ usuarioId })
      .populate('reservaId')
      .sort({ createdAt: -1 })
      .lean();
  }
};

const getResenasByEntidad = async (tipoEntidad, entidadId) => {
  const redisClient = connectToRedis();
  const key = _getResenasByEntidadRedisKey(tipoEntidad, entidadId);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
    const result = await Resena.find({
      'entidadResenada.tipo': tipoEntidad,
      'entidadResenada.id': entidadId
    })
      .populate('usuarioId', 'nombre email')
      .populate('respuesta.usuarioId', 'nombre email')
      .sort({ createdAt: -1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Resena.find({
      'entidadResenada.tipo': tipoEntidad,
      'entidadResenada.id': entidadId
    })
      .populate('usuarioId', 'nombre email')
      .populate('respuesta.usuarioId', 'nombre email')
      .sort({ createdAt: -1 })
      .lean();
  }
};

const getResenasByReserva = async (reservaId) => {
  const redisClient = connectToRedis();
  const key = _getResenasByReservaRedisKey(reservaId);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
    const result = await Resena.find({ reservaId })
      .populate('usuarioId', 'nombre email')
      .populate('respuesta.usuarioId', 'nombre email')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Resena.find({ reservaId })
      .populate('usuarioId', 'nombre email')
      .populate('respuesta.usuarioId', 'nombre email')
      .lean();
  }
};

const getResenasPorCalificacion = async (calificacionMinima) => {
  const redisClient = connectToRedis();
  const key = _getResenasPorCalificacionRedisKey(calificacionMinima);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
    const result = await Resena.find({ calificacion: { $gte: calificacionMinima } })
      .populate('usuarioId', 'nombre email')
      .populate('entidadResenada.id')
      .sort({ calificacion: -1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Resena.find({ calificacion: { $gte: calificacionMinima } })
      .populate('usuarioId', 'nombre email')
      .populate('entidadResenada.id')
      .sort({ calificacion: -1 })
      .lean();
  }
};

const createResena = async (resenaData) => {
  const redisClient = connectToRedis();
  const newResena = new Resena(resenaData);
  const saved = await newResena.save();
  
  await redisClient.del(_getResenasFilterRedisKey({}));
  if (saved.usuarioId) {
    await redisClient.del(_getResenasByUsuarioRedisKey(saved.usuarioId.toString()));
  }
  if (saved.reservaId) {
    await redisClient.del(_getResenasByReservaRedisKey(saved.reservaId.toString()));
  }
  if (saved.entidadResenada && saved.entidadResenada.tipo && saved.entidadResenada.id) {
    await redisClient.del(_getResenasByEntidadRedisKey(
      saved.entidadResenada.tipo,
      saved.entidadResenada.id.toString()
    ));
    await redisClient.del(_getPromedioCalificacionEntidadRedisKey(
      saved.entidadResenada.tipo,
      saved.entidadResenada.id.toString()
    ));
  }
  
  return saved;
};

const updateResena = async (id, payload) => {
  const redisClient = connectToRedis();
  const updated = await Resena.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getResenasRedisKey(id));
  await redisClient.del(_getResenasFilterRedisKey({}));
  if (updated.usuarioId) {
    await redisClient.del(_getResenasByUsuarioRedisKey(updated.usuarioId.toString()));
  }
  if (updated.reservaId) {
    await redisClient.del(_getResenasByReservaRedisKey(updated.reservaId.toString()));
  }
  if (updated.entidadResenada && updated.entidadResenada.tipo && updated.entidadResenada.id) {
    await redisClient.del(_getResenasByEntidadRedisKey(
      updated.entidadResenada.tipo,
      updated.entidadResenada.id.toString()
    ));
    await redisClient.del(_getPromedioCalificacionEntidadRedisKey(
      updated.entidadResenada.tipo,
      updated.entidadResenada.id.toString()
    ));
  }
  
  return updated;
};

const deleteResena = async (id) => {
  const redisClient = connectToRedis();
  const resena = await Resena.findById(id);
  const removed = await Resena.findByIdAndDelete(id);
  
  await redisClient.del(_getResenasRedisKey(id));
  await redisClient.del(_getResenasFilterRedisKey({}));
  if (resena.usuarioId) {
    await redisClient.del(_getResenasByUsuarioRedisKey(resena.usuarioId.toString()));
  }
  if (resena.reservaId) {
    await redisClient.del(_getResenasByReservaRedisKey(resena.reservaId.toString()));
  }
  if (resena.entidadResenada && resena.entidadResenada.tipo && resena.entidadResenada.id) {
    await redisClient.del(_getResenasByEntidadRedisKey(
      resena.entidadResenada.tipo,
      resena.entidadResenada.id.toString()
    ));
    await redisClient.del(_getPromedioCalificacionEntidadRedisKey(
      resena.entidadResenada.tipo,
      resena.entidadResenada.id.toString()
    ));
  }
  
  return removed;
};

const cambiarEstadoResena = async (id, nuevoEstado) => {
  const updated = await updateResena(id, { estado: nuevoEstado });
  return updated;
};

const responderResena = async (id, usuarioId, texto) => {
  const updated = await updateResena(id, {
    respuesta: {
      usuarioId,
      texto,
      fecha: new Date()
    }
  });
  return updated;
};

const moderarResena = async (id, estado, usuarioModeradorId = null) => {
  const updated = await updateResena(id, {
    estado,
    usuarioModeradorId,
    fechaModeracion: new Date()
  });
  return updated;
};

const getPromedioCalificacionEntidad = async (tipoEntidad, entidadId) => {
  const redisClient = connectToRedis();
  const key = _getPromedioCalificacionEntidadRedisKey(tipoEntidad, entidadId);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
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
    
    const promedio = result[0] || { promedioCalificacion: 0, totalResenas: 0 };
    
    await redisClient.set(key, promedio, { ex: 3600 });
    
    return promedio;
  } catch (error) {
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
  }
};

module.exports = {
  getResenas,
  findResenaById,
  getResenasByUsuario,
  getResenasByEntidad,
  getResenasByReserva,
  getResenasPorCalificacion,
  createResena,
  updateResena,
  deleteResena,
  cambiarEstadoResena,
  responderResena,
  moderarResena,
  getPromedioCalificacionEntidad
};