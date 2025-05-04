const Reserva = require("../models/reserva.model");
const connectToRedis = require("../services/redis.service");

const _getReservasRedisKey = (id) => `id:${id}-reservas`;
const _getReservasFilterRedisKey = (filtros) => `reservas:${JSON.stringify(filtros)}`;
const _getReservasByUsuarioRedisKey = (usuarioId) => `usuario:${usuarioId}-reservas`;
const _getReservasByEntidadRedisKey = (tipoEntidad, entidadId) => `entidad:${tipoEntidad}:${entidadId}-reservas`;
const _getReservasPendientesAprobacionRedisKey = () => `reservas:pendientes-aprobacion`;
const _getReservasPorFechaRedisKey = (fechaInicio, fechaFin) => `reservas:fecha:${fechaInicio}-${fechaFin}`;
const _getReservasRecurrentesRedisKey = () => `reservas:recurrentes`;

const getReservas = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getReservasFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getReservas desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getReservas, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getReservas desde MongoDB]");
  const result = await Reserva.find(filtros)
    .populate('usuarioId', 'nombre email')
    .populate('pagoId')
    .populate('serviciosAdicionales')
    .populate('aprobador.usuarioId', 'nombre email');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findReservaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getReservasRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findReservaById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findReservaById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findReservaById desde MongoDB]");
  const doc = await Reserva.findById(id)
    .populate('usuarioId', 'nombre email')
    .populate('pagoId')
    .populate('serviciosAdicionales')
    .populate('aprobador.usuarioId', 'nombre email');
  if (doc) {
    await redisClient.set(key, JSON.stringify(doc), { ex: 3600 });
  }
  return doc;
};

const getReservasByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getReservasByUsuarioRedisKey(usuarioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getReservasByUsuario desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getReservasByUsuario, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getReservasByUsuario desde MongoDB]");
  const result = await Reserva.find({ usuarioId })
    .populate('pagoId')
    .populate('serviciosAdicionales');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getReservasByEntidad = async (tipoEntidad, entidadId) => {
  const redisClient = connectToRedis();
  const key = _getReservasByEntidadRedisKey(tipoEntidad, entidadId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getReservasByEntidad desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getReservasByEntidad, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getReservasByEntidad desde MongoDB]");
  const result = await Reserva.find({
    'entidadReservada.tipo': tipoEntidad,
    'entidadReservada.id': entidadId
  })
    .populate('usuarioId', 'nombre email')
    .populate('pagoId')
    .populate('serviciosAdicionales');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getReservasPendientesAprobacion = async () => {
  const redisClient = connectToRedis();
  const key = _getReservasPendientesAprobacionRedisKey();
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getReservasPendientesAprobacion desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getReservasPendientesAprobacion, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getReservasPendientesAprobacion desde MongoDB]");
  const result = await Reserva.find({
    'aprobador.necesitaAprobacion': true,
    'aprobador.fechaAprobacion': { $exists: false },
    estado: 'pendiente'
  })
    .populate('usuarioId', 'nombre email')
    .populate('entidadReservada.id');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getReservasPorFecha = async (fechaInicio, fechaFin) => {
  const redisClient = connectToRedis();
  const key = _getReservasPorFechaRedisKey(fechaInicio, fechaFin);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getReservasPorFecha desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getReservasPorFecha, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getReservasPorFecha desde MongoDB]");
  const result = await Reserva.find({
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
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createReserva = async (reservaData) => {
  const redisClient = connectToRedis();
  const newReserva = new Reserva(reservaData);
  const saved = await newReserva.save();
  
  await redisClient.del(_getReservasFilterRedisKey({}));
  if (saved.usuarioId) {
    await redisClient.del(_getReservasByUsuarioRedisKey(saved.usuarioId.toString()));
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
  
  await redisClient.del(_getReservasRedisKey(id));
  await redisClient.del(_getReservasFilterRedisKey({}));
  if (reserva.usuarioId) {
    await redisClient.del(_getReservasByUsuarioRedisKey(reserva.usuarioId.toString()));
  }
  if (updated.usuarioId && reserva.usuarioId.toString() !== updated.usuarioId.toString()) {
    await redisClient.del(_getReservasByUsuarioRedisKey(updated.usuarioId.toString()));
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

const getReservasRecurrentes = async () => {
  const redisClient = connectToRedis();
  const key = _getReservasRecurrentesRedisKey();
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getReservasRecurrentes desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getReservasRecurrentes, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getReservasRecurrentes desde MongoDB]");
  const result = await Reserva.find({ esRecurrente: true })
    .populate('usuarioId', 'nombre email')
    .populate('entidadReservada.id');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
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