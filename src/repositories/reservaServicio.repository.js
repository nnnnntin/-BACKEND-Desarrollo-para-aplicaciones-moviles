const ReservaServicio = require("../models/reservaServicio.model");
const connectToRedis = require("../services/redis.service");

const _getReservasServicioRedisKey = (id) => `id:${id}-reservasServicio`;
const _getReservasServicioFilterRedisKey = (filtros, skip, limit) =>
  `reservasServicio:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getReservasByUsuarioRedisKey = (usuarioId) => `usuario:${usuarioId}-reservasServicio`;
const _getReservasByServicioRedisKey = (servicioId) => `servicio:${servicioId}-reservas`;
const _getReservasByReservaEspacioRedisKey = (reservaEspacioId) => `reservaEspacio:${reservaEspacioId}-reservasServicio`;
const _getReservasPorEstadoRedisKey = (estado) => `reservasServicio:estado:${estado}`;
const _getReservasPorRangoFechasRedisKey = (fechaInicio, fechaFin) => `reservasServicio:fecha:${fechaInicio}-${fechaFin}`;
const _getReservasPendientesByFechaRedisKey = (fecha) => `reservasServicio:pendientes:${fecha}`;

const getReservasServicio = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getReservasServicioFilterRedisKey(filtros, skip, limit);

  try {
    if (await redisClient.exists(key)) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try { return JSON.parse(cached); }
        catch { /* parse fallido, seguimos a Mongo */ }
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getReservasServicio con skip/limit");
    const result = await ReservaServicio.find(filtros)
      .populate("usuarioId", "nombre email")
      .populate("servicioId")
      .populate("reservaEspacioId")
      .populate("pagoId")
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;
  } catch (err) {
    console.log("[Error Redis] fallback a Mongo sin cache", err);
    return await ReservaServicio.find(filtros)
      .populate("usuarioId", "nombre email")
      .populate("servicioId")
      .populate("reservaEspacioId")
      .populate("pagoId")
      .skip(skip)
      .limit(limit)
      .lean();
  }
};

const findReservaServicioById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getReservasServicioRedisKey(id);
  
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
    
    const result = await ReservaServicio.findById(id)
      .populate('usuarioId', 'nombre email')
      .populate('servicioId')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .lean();
    
    if (result) {
      await redisClient.set(key, result, { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    return await ReservaServicio.findById(id)
      .populate('usuarioId', 'nombre email')
      .populate('servicioId')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .lean();
  }
};

const getReservasByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getReservasByUsuarioRedisKey(usuarioId);
  
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
    
    const result = await ReservaServicio.find({ usuarioId })
      .populate('servicioId')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .sort({ fecha: -1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ReservaServicio.find({ usuarioId })
      .populate('servicioId')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .sort({ fecha: -1 })
      .lean();
  }
};

const getReservasByServicio = async (servicioId) => {
  const redisClient = connectToRedis();
  const key = _getReservasByServicioRedisKey(servicioId);
  
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
    
    const result = await ReservaServicio.find({ servicioId })
      .populate('usuarioId', 'nombre email')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .sort({ fecha: -1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ReservaServicio.find({ servicioId })
      .populate('usuarioId', 'nombre email')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .sort({ fecha: -1 })
      .lean();
  }
};

const getReservasByReservaEspacio = async (reservaEspacioId) => {
  const redisClient = connectToRedis();
  const key = _getReservasByReservaEspacioRedisKey(reservaEspacioId);
  
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
    
    const result = await ReservaServicio.find({ reservaEspacioId })
      .populate('usuarioId', 'nombre email')
      .populate('servicioId')
      .populate('pagoId')
      .sort({ fecha: -1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ReservaServicio.find({ reservaEspacioId })
      .populate('usuarioId', 'nombre email')
      .populate('servicioId')
      .populate('pagoId')
      .sort({ fecha: -1 })
      .lean();
  }
};

const getReservasPorEstado = async (estado) => {
  const redisClient = connectToRedis();
  const key = _getReservasPorEstadoRedisKey(estado);
  
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
    
    const result = await ReservaServicio.find({ estado })
      .populate('usuarioId', 'nombre email')
      .populate('servicioId')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .sort({ fecha: -1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ReservaServicio.find({ estado })
      .populate('usuarioId', 'nombre email')
      .populate('servicioId')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .sort({ fecha: -1 })
      .lean();
  }
};

const getReservasPorRangoFechas = async (fechaInicio, fechaFin) => {
  const redisClient = connectToRedis();
  const key = _getReservasPorRangoFechasRedisKey(fechaInicio, fechaFin);
  
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
    
    const result = await ReservaServicio.find({
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    })
      .populate('usuarioId', 'nombre email')
      .populate('servicioId')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .sort({ fecha: 1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ReservaServicio.find({
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    })
      .populate('usuarioId', 'nombre email')
      .populate('servicioId')
      .populate('reservaEspacioId')
      .populate('pagoId')
      .sort({ fecha: 1 })
      .lean();
  }
};

const getReservasPendientesByFecha = async (fecha) => {
  const redisClient = connectToRedis();
  const key = _getReservasPendientesByFechaRedisKey(fecha);
  
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
    
    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(fecha);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await ReservaServicio.find({
      fecha: { $gte: startOfDay, $lte: endOfDay },
      estado: 'pendiente'
    })
      .populate('usuarioId', 'nombre email')
      .populate('servicioId')
      .populate('reservaEspacioId')
      .sort({ horaInicio: 1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
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
      .sort({ horaInicio: 1 })
      .lean();
  }
};

const createReservaServicio = async (reservaData) => {
  const redisClient = connectToRedis();
  const newReserva = new ReservaServicio(reservaData);
  const saved = await newReserva.save();
  
  await redisClient.del(_getReservasServicioFilterRedisKey({}));
  if (saved.usuarioId) {
    await redisClient.del(_getReservasByUsuarioRedisKey(saved.usuarioId.toString()));
  }
  if (saved.servicioId) {
    await redisClient.del(_getReservasByServicioRedisKey(saved.servicioId.toString()));
  }
  if (saved.reservaEspacioId) {
    await redisClient.del(_getReservasByReservaEspacioRedisKey(saved.reservaEspacioId.toString()));
  }
  if (saved.estado) {
    await redisClient.del(_getReservasPorEstadoRedisKey(saved.estado));
  }
  if (saved.fecha) {
    const fecha = new Date(saved.fecha).toISOString().split('T')[0];
    await redisClient.del(_getReservasPendientesByFechaRedisKey(fecha));
  }
  
  return saved;
};

const updateReservaServicio = async (id, payload) => {
  const redisClient = connectToRedis();
  const reserva = await ReservaServicio.findById(id);
  const updated = await ReservaServicio.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getReservasServicioRedisKey(id));
  await redisClient.del(_getReservasServicioFilterRedisKey({}));
  
  if (reserva.usuarioId) {
    await redisClient.del(_getReservasByUsuarioRedisKey(reserva.usuarioId.toString()));
  }
  if (updated.usuarioId && (!reserva.usuarioId || reserva.usuarioId.toString() !== updated.usuarioId.toString())) {
    await redisClient.del(_getReservasByUsuarioRedisKey(updated.usuarioId.toString()));
  }
  
  if (reserva.servicioId) {
    await redisClient.del(_getReservasByServicioRedisKey(reserva.servicioId.toString()));
  }
  if (updated.servicioId && (!reserva.servicioId || reserva.servicioId.toString() !== updated.servicioId.toString())) {
    await redisClient.del(_getReservasByServicioRedisKey(updated.servicioId.toString()));
  }
  
  if (reserva.reservaEspacioId) {
    await redisClient.del(_getReservasByReservaEspacioRedisKey(reserva.reservaEspacioId.toString()));
  }
  if (updated.reservaEspacioId && (!reserva.reservaEspacioId || reserva.reservaEspacioId.toString() !== updated.reservaEspacioId.toString())) {
    await redisClient.del(_getReservasByReservaEspacioRedisKey(updated.reservaEspacioId.toString()));
  }
  
  if (reserva.estado) {
    await redisClient.del(_getReservasPorEstadoRedisKey(reserva.estado));
  }
  if (updated.estado && reserva.estado !== updated.estado) {
    await redisClient.del(_getReservasPorEstadoRedisKey(updated.estado));
  }
  
  if (reserva.fecha) {
    const fecha = new Date(reserva.fecha).toISOString().split('T')[0];
    await redisClient.del(_getReservasPendientesByFechaRedisKey(fecha));
  }
  if (updated.fecha && (!reserva.fecha || reserva.fecha.toString() !== updated.fecha.toString())) {
    const fecha = new Date(updated.fecha).toISOString().split('T')[0];
    await redisClient.del(_getReservasPendientesByFechaRedisKey(fecha));
  }
  
  return updated;
};

const deleteReservaServicio = async (id) => {
  const redisClient = connectToRedis();
  const reserva = await ReservaServicio.findById(id);
  const removed = await ReservaServicio.findByIdAndDelete(id);
  
  await redisClient.del(_getReservasServicioRedisKey(id));
  await redisClient.del(_getReservasServicioFilterRedisKey({}));
  
  if (reserva.usuarioId) {
    await redisClient.del(_getReservasByUsuarioRedisKey(reserva.usuarioId.toString()));
  }
  if (reserva.servicioId) {
    await redisClient.del(_getReservasByServicioRedisKey(reserva.servicioId.toString()));
  }
  if (reserva.reservaEspacioId) {
    await redisClient.del(_getReservasByReservaEspacioRedisKey(reserva.reservaEspacioId.toString()));
  }
  if (reserva.estado) {
    await redisClient.del(_getReservasPorEstadoRedisKey(reserva.estado));
  }
  if (reserva.fecha) {
    const fecha = new Date(reserva.fecha).toISOString().split('T')[0];
    await redisClient.del(_getReservasPendientesByFechaRedisKey(fecha));
  }
  
  return removed;
};

const cambiarEstadoReserva = async (id, nuevoEstado) => {
  return await updateReservaServicio(id, { estado: nuevoEstado });
};

const confirmarReservaServicio = async (id) => {
  return await updateReservaServicio(id, { 
    estado: 'confirmado',
    fechaConfirmacion: new Date()
  });
};

const cancelarReservaServicio = async (id, motivo = '') => {
  return await updateReservaServicio(id, { 
    estado: 'cancelado',
    motivoCancelacion: motivo,
    fechaCancelacion: new Date()
  });
};

const completarReservaServicio = async (id) => {
  return await updateReservaServicio(id, { 
    estado: 'completado',
    fechaCompletado: new Date()
  });
};

const vincularPago = async (id, pagoId) => {
  return await updateReservaServicio(id, { pagoId });
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