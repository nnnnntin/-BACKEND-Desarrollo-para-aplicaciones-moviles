const Reserva = require("../models/reserva.model");
const connectToRedis = require("../services/redis.service");

const _getReservasRedisKey = (id) => `id:${id}-reservas`;
const _getReservasFilterRedisKey = (filtros, skip, limit) =>
  `reservas:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getReservasByUsuarioRedisKey = (usuarioId) => `usuario:${usuarioId}-reservas`;
const _getReservasByClienteRedisKey = (clienteId) => `cliente:${clienteId}-reservas`; // NUEVO
const _getReservasByEntidadRedisKey = (tipoEntidad, entidadId) => `entidad:${tipoEntidad}:${entidadId}-reservas`;
const _getReservasPendientesAprobacionRedisKey = () => `reservas:pendientes-aprobacion`;
const _getReservasPorFechaRedisKey = (fechaInicio, fechaFin) => `reservas:fecha:${fechaInicio}-${fechaFin}`;
const _getReservasRecurrentesRedisKey = () => `reservas:recurrentes`;

const getReservas = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getReservasFilterRedisKey(filtros, skip, limit);

  try {
    if (await redisClient.exists(key)) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try { return JSON.parse(cached); }
        catch {  }
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getReservas con skip/limit");
    const result = await Reserva.find(filtros)
      .populate("usuarioId", "nombre email")
      .populate("clienteId", "nombre email") // NUEVO: Poblar datos del cliente
      .populate("pagoId")
      .populate("serviciosAdicionales")
      .populate("aprobador.usuarioId", "nombre email")
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (err) {
    console.log("[Error Redis] fallback a Mongo sin cache", err);
    return await Reserva.find(filtros)
      .populate("usuarioId", "nombre email")
      .populate("clienteId", "nombre email") // NUEVO
      .populate("pagoId")
      .populate("serviciosAdicionales")
      .populate("aprobador.usuarioId", "nombre email")
      .skip(skip)
      .limit(limit)
      .lean();
  }
};

const findReservaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getReservasRedisKey(id);
  
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
    
    const doc = await Reserva.findById(id)
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email') // NUEVO
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .populate('aprobador.usuarioId', 'nombre email')
      .lean();
    
    if (doc) {
      await redisClient.set(key, doc, { ex: 3600 });
    }
    
    return doc;
  } catch (error) {
    return await Reserva.findById(id)
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email') // NUEVO
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .populate('aprobador.usuarioId', 'nombre email')
      .lean();
  }
};

// NUEVO: Obtener reservas por cliente/propietario
const getReservasByCliente = async (clienteId) => {
  const redisClient = connectToRedis();
  const key = _getReservasByClienteRedisKey(clienteId);
  
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
    
    const result = await Reserva.find({ clienteId })
      .populate('usuarioId', 'nombre email')
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Reserva.find({ clienteId })
      .populate('usuarioId', 'nombre email')
      .populate('pagoId')
      .populate('serviciosAdicionales')
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
    
    const result = await Reserva.find({ usuarioId })
      .populate('clienteId', 'nombre email') // NUEVO: Poblar cliente
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Reserva.find({ usuarioId })
      .populate('clienteId', 'nombre email') // NUEVO
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .lean();
  }
};

const createReserva = async (reservaData) => {
  const redisClient = connectToRedis();
  const newReserva = new Reserva(reservaData);
  const saved = await newReserva.save();
  
  // Limpiar caches relevantes
  await redisClient.del(_getReservasFilterRedisKey({}));
  if (saved.usuarioId) {
    await redisClient.del(_getReservasByUsuarioRedisKey(saved.usuarioId.toString()));
  }
  if (saved.clienteId) { // NUEVO: Limpiar cache del cliente
    await redisClient.del(_getReservasByClienteRedisKey(saved.clienteId.toString()));
  }
  if (saved.entidadReservada && saved.entidadReservada.tipo && saved.entidadReservada.id) {
    await redisClient.del(_getReservasByEntidadRedisKey(
      saved.entidadReservada.tipo,
      saved.entidadReservada.id.toString()
    ));
  }
  await redisClient.del(_getReservasPendientesAprobacionRedisKey());
  if (saved.esRecurrente) {
    await redisClient.del(_getReservasRecurrentesRedisKey());
  }
  
  return saved;
};

const updateReserva = async (id, payload) => {
  const redisClient = connectToRedis();
  const reserva = await Reserva.findById(id);
  const updated = await Reserva.findByIdAndUpdate(id, payload, { new: true });
  
  // Limpiar caches
  await redisClient.del(_getReservasRedisKey(id));
  await redisClient.del(_getReservasFilterRedisKey({}));
  
  if (reserva.usuarioId) {
    await redisClient.del(_getReservasByUsuarioRedisKey(reserva.usuarioId.toString()));
  }
  if (updated.usuarioId && reserva.usuarioId.toString() !== updated.usuarioId.toString()) {
    await redisClient.del(_getReservasByUsuarioRedisKey(updated.usuarioId.toString()));
  }
  
  // NUEVO: Limpiar caches del cliente
  if (reserva.clienteId) {
    await redisClient.del(_getReservasByClienteRedisKey(reserva.clienteId.toString()));
  }
  if (updated.clienteId && reserva.clienteId.toString() !== updated.clienteId.toString()) {
    await redisClient.del(_getReservasByClienteRedisKey(updated.clienteId.toString()));
  }
  
  if (reserva.entidadReservada && reserva.entidadReservada.tipo && reserva.entidadReservada.id) {
    await redisClient.del(_getReservasByEntidadRedisKey(
      reserva.entidadReservada.tipo,
      reserva.entidadReservada.id.toString()
    ));
  }
  if (updated.entidadReservada && updated.entidadReservada.tipo && updated.entidadReservada.id) {
    await redisClient.del(_getReservasByEntidadRedisKey(
      updated.entidadReservada.tipo,
      updated.entidadReservada.id.toString()
    ));
  }
  
  await redisClient.del(_getReservasPendientesAprobacionRedisKey());
  await redisClient.del(_getReservasRecurrentesRedisKey());
  
  return updated;
};

const deleteReserva = async (id) => {
  const redisClient = connectToRedis();
  const reserva = await Reserva.findById(id);
  const removed = await Reserva.findByIdAndDelete(id);
  
  await redisClient.del(_getReservasRedisKey(id));
  await redisClient.del(_getReservasFilterRedisKey({}));
  if (reserva.usuarioId) {
    await redisClient.del(_getReservasByUsuarioRedisKey(reserva.usuarioId.toString()));
  }
  if (reserva.clienteId) { // NUEVO
    await redisClient.del(_getReservasByClienteRedisKey(reserva.clienteId.toString()));
  }
  if (reserva.entidadReservada && reserva.entidadReservada.tipo && reserva.entidadReservada.id) {
    await redisClient.del(_getReservasByEntidadRedisKey(
      reserva.entidadReservada.tipo,
      reserva.entidadReservada.id.toString()
    ));
  }
  await redisClient.del(_getReservasPendientesAprobacionRedisKey());
  if (reserva.esRecurrente) {
    await redisClient.del(_getReservasRecurrentesRedisKey());
  }
  
  return removed;
};

// Resto de funciones sin cambios...
const getReservasByEntidad = async (tipoEntidad, entidadId) => {
  // Implementación sin cambios (solo agregar populate para clienteId)
  const redisClient = connectToRedis();
  const key = _getReservasByEntidadRedisKey(tipoEntidad, entidadId);
  
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
    
    const result = await Reserva.find({
      'entidadReservada.tipo': tipoEntidad,
      'entidadReservada.id': entidadId
    })
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email') // NUEVO
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Reserva.find({
      'entidadReservada.tipo': tipoEntidad,
      'entidadReservada.id': entidadId
    })
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email') // NUEVO
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .lean();
  }
};

// Funciones adicionales sin cambios...
const cambiarEstadoReserva = async (id, nuevoEstado) => {
  return await updateReserva(id, { estado: nuevoEstado });
};

const aprobarReserva = async (id, aprobadorId, notas = '') => {
  return await updateReserva(id, {
    estado: 'confirmada',
    'aprobador.usuarioId': aprobadorId,
    'aprobador.fechaAprobacion': new Date(),
    'aprobador.notas': notas
  });
};

const rechazarReserva = async (id, aprobadorId, notas) => {
  return await updateReserva(id, {
    estado: 'cancelada',
    'aprobador.usuarioId': aprobadorId,
    'aprobador.fechaAprobacion': new Date(),
    'aprobador.notas': notas
  });
};

const vincularPagoReserva = async (id, pagoId) => {
  return await updateReserva(id, { pagoId });
};

const agregarServicioAdicional = async (id, servicioId) => {
  const redisClient = connectToRedis();
  const updated = await Reserva.findByIdAndUpdate(
    id,
    { $push: { serviciosAdicionales: servicioId } },
    { new: true }
  );
  
  await redisClient.del(_getReservasRedisKey(id));
  
  return updated;
};

// NUEVO: Obtener estadísticas de ganancias por cliente
const getEstadisticasGananciasCliente = async (clienteId, fechaInicio, fechaFin) => {
  try {
    const filtros = { 
      clienteId,
      estado: { $in: ['confirmada', 'completada'] }
    };
    
    if (fechaInicio && fechaFin) {
      filtros.fechaInicio = { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) };
    }
    
    const reservas = await Reserva.find(filtros).lean();
    
    const totalGanancias = reservas.reduce((total, reserva) => {
      return total + (reserva.precioFinalPagado || 0);
    }, 0);
    
    return {
      totalReservas: reservas.length,
      totalGanancias,
      promedioGananciasPorReserva: reservas.length > 0 ? totalGanancias / reservas.length : 0,
      reservas
    };
  } catch (error) {
    throw error;
  }
};

// Agregar estas funciones al archivo reserva.repository.js después de getReservasByEntidad

const getReservasPendientesAprobacion = async () => {
  const redisClient = connectToRedis();
  const key = _getReservasPendientesAprobacionRedisKey();
  
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
    
    console.log("[Mongo] getReservasPendientesAprobacion");
    const result = await Reserva.find({ 
      estado: 'pendiente',
      'aprobador.necesitaAprobacion': true 
    })
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email')
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .lean();
    
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error Redis] fallback a Mongo sin cache", error);
    return await Reserva.find({ 
      estado: 'pendiente',
      'aprobador.necesitaAprobacion': true 
    })
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email')
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .lean();
  }
};

const getReservasPorFecha = async (fechaInicio, fechaFin) => {
  const redisClient = connectToRedis();
  const key = _getReservasPorFechaRedisKey(fechaInicio.toISOString().split('T')[0], fechaFin.toISOString().split('T')[0]);
  
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
    
    console.log("[Mongo] getReservasPorFecha");
    const result = await Reserva.find({
      $or: [
        {
          fechaInicio: { $gte: fechaInicio, $lte: fechaFin }
        },
        {
          fechaFin: { $gte: fechaInicio, $lte: fechaFin }
        },
        {
          fechaInicio: { $lte: fechaInicio },
          fechaFin: { $gte: fechaFin }
        }
      ]
    })
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email')
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .populate('aprobador.usuarioId', 'nombre email')
      .lean();
    
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error Redis] fallback a Mongo sin cache", error);
    return await Reserva.find({
      $or: [
        {
          fechaInicio: { $gte: fechaInicio, $lte: fechaFin }
        },
        {
          fechaFin: { $gte: fechaInicio, $lte: fechaFin }
        },
        {
          fechaInicio: { $lte: fechaInicio },
          fechaFin: { $gte: fechaFin }
        }
      ]
    })
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email')
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .populate('aprobador.usuarioId', 'nombre email')
      .lean();
  }
};

const getReservasRecurrentes = async () => {
  const redisClient = connectToRedis();
  const key = _getReservasRecurrentesRedisKey();
  
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
    
    console.log("[Mongo] getReservasRecurrentes");
    const result = await Reserva.find({ esRecurrente: true })
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email')
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .populate('aprobador.usuarioId', 'nombre email')
      .lean();
    
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error Redis] fallback a Mongo sin cache", error);
    return await Reserva.find({ esRecurrente: true })
      .populate('usuarioId', 'nombre email')
      .populate('clienteId', 'nombre email')
      .populate('pagoId')
      .populate('serviciosAdicionales')
      .populate('aprobador.usuarioId', 'nombre email')
      .lean();
  }
};

module.exports = {
  getReservas,
  findReservaById,
  getReservasByUsuario,
  getReservasByCliente, // NUEVO
  getReservasByEntidad,
  getReservasPendientesAprobacion, // Ahora implementada
  getReservasPorFecha, // Ahora implementada
  getReservasRecurrentes, // Ahora implementada
  createReserva,
  updateReserva,
  deleteReserva,
  cambiarEstadoReserva,
  aprobarReserva,
  rechazarReserva,
  vincularPagoReserva,
  agregarServicioAdicional,
  getEstadisticasGananciasCliente // NUEVO
};