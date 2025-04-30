const Notificacion = require("../models/notificacion.model");
const connectToRedis = require("../services/redis.service");

const _getNotificacionRedisKey = (id) => `id:${id}-notificacion`;
const _getNotificacionesFilterRedisKey = (filtros) => `notificaciones:${JSON.stringify(filtros)}`;
const _getNotificacionesByUsuarioRedisKey = (usuarioId, leidas) => `usuario:${usuarioId}-notificaciones:leidas:${leidas}`;
const _getNotificacionesPorTipoRedisKey = (tipoNotificacion, destinatarioId) => `notificaciones:tipo:${tipoNotificacion}:destinatario:${destinatarioId || 'todos'}`;
const _getNotificacionesPorEntidadRedisKey = (tipoEntidad, entidadId) => `entidad:${tipoEntidad}:${entidadId}-notificaciones`;

const getNotificaciones = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getNotificacionesFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getNotificaciones desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getNotificaciones, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getNotificaciones desde MongoDB]");
  const result = await Notificacion.find(filtros)
    .populate('destinatarioId', 'nombre email')
    .populate('remitenteId', 'nombre email')
    .sort({ createdAt: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findNotificacionById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getNotificacionRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findNotificacionById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findNotificacionById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findNotificacionById desde MongoDB]");
  const result = await Notificacion.findById(id)
    .populate('destinatarioId', 'nombre email')
    .populate('remitenteId', 'nombre email');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getNotificacionesByUsuario = async (usuarioId, leidas = null) => {
  const redisClient = connectToRedis();
  const key = _getNotificacionesByUsuarioRedisKey(usuarioId, leidas);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getNotificacionesByUsuario desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getNotificacionesByUsuario, volviendo a MongoDB", err);
    }
  }
  
  console.log("[Leyendo getNotificacionesByUsuario desde MongoDB]");
  const filtros = { destinatarioId: usuarioId };
  
  if (leidas !== null) {
    filtros.leido = leidas;
  }
  
  const result = await Notificacion.find(filtros)
    .populate('remitenteId', 'nombre email')
    .sort({ createdAt: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getNotificacionesPorTipo = async (tipoNotificacion, destinatarioId = null) => {
  const redisClient = connectToRedis();
  const key = _getNotificacionesPorTipoRedisKey(tipoNotificacion, destinatarioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getNotificacionesPorTipo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getNotificacionesPorTipo, volviendo a MongoDB", err);
    }
  }
  
  console.log("[Leyendo getNotificacionesPorTipo desde MongoDB]");
  const filtros = { tipoNotificacion };
  
  if (destinatarioId) {
    filtros.destinatarioId = destinatarioId;
  }
  
  const result = await Notificacion.find(filtros)
    .populate('destinatarioId', 'nombre email')
    .populate('remitenteId', 'nombre email')
    .sort({ createdAt: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createNotificacion = async (notificacionData) => {
  const redisClient = connectToRedis();
  const newNotificacion = new Notificacion(notificacionData);
  const saved = await newNotificacion.save();
  
  // Invalidar caches
  await redisClient.del(_getNotificacionesFilterRedisKey({}));
  
  if (saved.destinatarioId) {
    // Invalidar todas las caches del usuario destinatario
    await redisClient.keys(`usuario:${saved.destinatarioId.toString()}-notificaciones:*`).then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  if (saved.tipoNotificacion) {
    await redisClient.del(_getNotificacionesPorTipoRedisKey(saved.tipoNotificacion));
    if (saved.destinatarioId) {
      await redisClient.del(_getNotificacionesPorTipoRedisKey(saved.tipoNotificacion, saved.destinatarioId.toString()));
    }
  }
  
  if (saved.entidadRelacionada && saved.entidadRelacionada.tipo && saved.entidadRelacionada.id) {
    await redisClient.del(_getNotificacionesPorEntidadRedisKey(
      saved.entidadRelacionada.tipo,
      saved.entidadRelacionada.id.toString()
    ));
  }
  
  return saved;
};

const updateNotificacion = async (id, payload) => {
  const redisClient = connectToRedis();
  const notificacion = await Notificacion.findById(id);
  const updated = await Notificacion.findByIdAndUpdate(id, payload, { new: true });
  
  // Invalidar caches
  await redisClient.del(_getNotificacionRedisKey(id));
  await redisClient.del(_getNotificacionesFilterRedisKey({}));
  
  if (notificacion.destinatarioId) {
    await redisClient.keys(`usuario:${notificacion.destinatarioId.toString()}-notificaciones:*`).then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  if (updated.destinatarioId && (!notificacion.destinatarioId || 
      notificacion.destinatarioId.toString() !== updated.destinatarioId.toString())) {
    await redisClient.keys(`usuario:${updated.destinatarioId.toString()}-notificaciones:*`).then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  if (notificacion.tipoNotificacion) {
    await redisClient.del(_getNotificacionesPorTipoRedisKey(notificacion.tipoNotificacion));
    if (notificacion.destinatarioId) {
      await redisClient.del(_getNotificacionesPorTipoRedisKey(notificacion.tipoNotificacion, notificacion.destinatarioId.toString()));
    }
  }
  if (updated.tipoNotificacion && notificacion.tipoNotificacion !== updated.tipoNotificacion) {
    await redisClient.del(_getNotificacionesPorTipoRedisKey(updated.tipoNotificacion));
    if (updated.destinatarioId) {
      await redisClient.del(_getNotificacionesPorTipoRedisKey(updated.tipoNotificacion, updated.destinatarioId.toString()));
    }
  }
  
  if (notificacion.entidadRelacionada && notificacion.entidadRelacionada.tipo && notificacion.entidadRelacionada.id) {
    await redisClient.del(_getNotificacionesPorEntidadRedisKey(
      notificacion.entidadRelacionada.tipo,
      notificacion.entidadRelacionada.id.toString()
    ));
  }
  if (updated.entidadRelacionada && updated.entidadRelacionada.tipo && updated.entidadRelacionada.id) {
    await redisClient.del(_getNotificacionesPorEntidadRedisKey(
      updated.entidadRelacionada.tipo,
      updated.entidadRelacionada.id.toString()
    ));
  }
  
  return updated;
};

const deleteNotificacion = async (id) => {
  const redisClient = connectToRedis();
  const notificacion = await Notificacion.findById(id);
  const removed = await Notificacion.findByIdAndDelete(id);
  
  // Invalidar caches
  await redisClient.del(_getNotificacionRedisKey(id));
  await redisClient.del(_getNotificacionesFilterRedisKey({}));
  
  if (notificacion.destinatarioId) {
    await redisClient.keys(`usuario:${notificacion.destinatarioId.toString()}-notificaciones:*`).then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  if (notificacion.tipoNotificacion) {
    await redisClient.del(_getNotificacionesPorTipoRedisKey(notificacion.tipoNotificacion));
    if (notificacion.destinatarioId) {
      await redisClient.del(_getNotificacionesPorTipoRedisKey(notificacion.tipoNotificacion, notificacion.destinatarioId.toString()));
    }
  }
  
  if (notificacion.entidadRelacionada && notificacion.entidadRelacionada.tipo && notificacion.entidadRelacionada.id) {
    await redisClient.del(_getNotificacionesPorEntidadRedisKey(
      notificacion.entidadRelacionada.tipo,
      notificacion.entidadRelacionada.id.toString()
    ));
  }
  
  return removed;
};

const marcarComoLeida = async (id) => {
  const redisClient = connectToRedis();
  const notificacion = await Notificacion.findById(id);
  const updated = await Notificacion.findByIdAndUpdate(
    id,
    {
      leido: true,
      fechaLeido: new Date()
    },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getNotificacionRedisKey(id));
  
  if (notificacion.destinatarioId) {
    await redisClient.keys(`usuario:${notificacion.destinatarioId.toString()}-notificaciones:*`).then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

const marcarTodasComoLeidas = async (destinatarioId) => {
  const redisClient = connectToRedis();
  const result = await Notificacion.updateMany(
    { destinatarioId, leido: false },
    {
      leido: true,
      fechaLeido: new Date()
    }
  );
  
  // Invalidar caches
  await redisClient.keys(`usuario:${destinatarioId.toString()}-notificaciones:*`).then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return result;
};

const getNotificacionesPorEntidad = async (tipoEntidad, entidadId) => {
  const redisClient = connectToRedis();
  const key = _getNotificacionesPorEntidadRedisKey(tipoEntidad, entidadId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getNotificacionesPorEntidad desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getNotificacionesPorEntidad, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getNotificacionesPorEntidad desde MongoDB]");
  const result = await Notificacion.find({
    'entidadRelacionada.tipo': tipoEntidad,
    'entidadRelacionada.id': entidadId
  })
    .populate('destinatarioId', 'nombre email')
    .populate('remitenteId', 'nombre email')
    .sort({ createdAt: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

module.exports = {
  getNotificaciones,
  findNotificacionById,
  getNotificacionesByUsuario,
  getNotificacionesPorTipo,
  createNotificacion,
  updateNotificacion,
  deleteNotificacion,
  marcarComoLeida,
  marcarTodasComoLeidas,
  getNotificacionesPorEntidad
};