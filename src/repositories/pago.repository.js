const Pago = require("../models/pago.model");
const connectToRedis = require("../services/redis.service");

const _getPagoRedisKey = (id) => `id:${id}-pago`;
const _getPagosFilterRedisKey = (filtros) => `pagos:${JSON.stringify(filtros)}`;
const _getPagosByUsuarioRedisKey = (usuarioId) => `usuario:${usuarioId}-pagos`;
const _getPagosPorConceptoRedisKey = (conceptoPago) => `pagos:concepto:${conceptoPago}`;
const _getPagosPorEstadoRedisKey = (estado) => `pagos:estado:${estado}`;
const _getPagosPorEntidadRedisKey = (tipoEntidad, entidadId) => `entidad:${tipoEntidad}:${entidadId}-pagos`;
const _getPagosPorRangoMontosRedisKey = (montoMin, montoMax) => `pagos:monto:${montoMin}-${montoMax}`;

const getPagos = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getPagosFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPagos desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPagos, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPagos desde MongoDB]");
  const result = await Pago.find(filtros)
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ fecha: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findPagoById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getPagoRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findPagoById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findPagoById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findPagoById desde MongoDB]");
  const result = await Pago.findById(id)
    .populate('usuarioId', 'nombre email')
    .populate('facturaId');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getPagosByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getPagosByUsuarioRedisKey(usuarioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPagosByUsuario desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPagosByUsuario, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPagosByUsuario desde MongoDB]");
  const result = await Pago.find({ usuarioId })
    .populate('facturaId')
    .sort({ fecha: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getPagosPorConcepto = async (conceptoPago) => {
  const redisClient = connectToRedis();
  const key = _getPagosPorConceptoRedisKey(conceptoPago);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPagosPorConcepto desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPagosPorConcepto, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPagosPorConcepto desde MongoDB]");
  const result = await Pago.find({ conceptoPago })
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ fecha: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getPagosPorEstado = async (estado) => {
  const redisClient = connectToRedis();
  const key = _getPagosPorEstadoRedisKey(estado);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPagosPorEstado desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPagosPorEstado, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPagosPorEstado desde MongoDB]");
  const result = await Pago.find({ estado })
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ fecha: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getPagosPorEntidad = async (tipoEntidad, entidadId) => {
  const redisClient = connectToRedis();
  const key = _getPagosPorEntidadRedisKey(tipoEntidad, entidadId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPagosPorEntidad desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPagosPorEntidad, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPagosPorEntidad desde MongoDB]");
  const result = await Pago.find({
    'entidadRelacionada.tipo': tipoEntidad,
    'entidadRelacionada.id': entidadId
  })
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ fecha: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createPago = async (pagoData) => {
  const redisClient = connectToRedis();
  const newPago = new Pago(pagoData);
  const saved = await newPago.save();
  
  await redisClient.del(_getPagosFilterRedisKey({}));
  if (saved.usuarioId) {
    await redisClient.del(_getPagosByUsuarioRedisKey(saved.usuarioId.toString()));
  }
  if (saved.conceptoPago) {
    await redisClient.del(_getPagosPorConceptoRedisKey(saved.conceptoPago));
  }
  if (saved.estado) {
    await redisClient.del(_getPagosPorEstadoRedisKey(saved.estado));
  }
  if (saved.entidadRelacionada && saved.entidadRelacionada.tipo && saved.entidadRelacionada.id) {
    await redisClient.del(_getPagosPorEntidadRedisKey(
      saved.entidadRelacionada.tipo,
      saved.entidadRelacionada.id.toString()
    ));
  }
  
  await redisClient.keys('pagos:monto:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return saved;
};

const updatePago = async (id, payload) => {
  const redisClient = connectToRedis();
  const pago = await Pago.findById(id);
  const updated = await Pago.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getPagoRedisKey(id));
  await redisClient.del(_getPagosFilterRedisKey({}));
  
  if (pago.usuarioId) {
    await redisClient.del(_getPagosByUsuarioRedisKey(pago.usuarioId.toString()));
  }
  if (updated.usuarioId && (!pago.usuarioId || pago.usuarioId.toString() !== updated.usuarioId.toString())) {
    await redisClient.del(_getPagosByUsuarioRedisKey(updated.usuarioId.toString()));
  }
  
  if (pago.conceptoPago) {
    await redisClient.del(_getPagosPorConceptoRedisKey(pago.conceptoPago));
  }
  if (updated.conceptoPago && pago.conceptoPago !== updated.conceptoPago) {
    await redisClient.del(_getPagosPorConceptoRedisKey(updated.conceptoPago));
  }
  
  if (pago.estado) {
    await redisClient.del(_getPagosPorEstadoRedisKey(pago.estado));
  }
  if (updated.estado && pago.estado !== updated.estado) {
    await redisClient.del(_getPagosPorEstadoRedisKey(updated.estado));
  }
  
  if (pago.entidadRelacionada && pago.entidadRelacionada.tipo && pago.entidadRelacionada.id) {
    await redisClient.del(_getPagosPorEntidadRedisKey(
      pago.entidadRelacionada.tipo,
      pago.entidadRelacionada.id.toString()
    ));
  }
  if (updated.entidadRelacionada && updated.entidadRelacionada.tipo && updated.entidadRelacionada.id) {
    await redisClient.del(_getPagosPorEntidadRedisKey(
      updated.entidadRelacionada.tipo,
      updated.entidadRelacionada.id.toString()
    ));
  }
  
  if (payload.monto && pago.monto !== payload.monto) {
    await redisClient.keys('pagos:monto:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

const deletePago = async (id) => {
  const redisClient = connectToRedis();
  const pago = await Pago.findById(id);
  const removed = await Pago.findByIdAndDelete(id);
  
  await redisClient.del(_getPagoRedisKey(id));
  await redisClient.del(_getPagosFilterRedisKey({}));
  
  if (pago.usuarioId) {
    await redisClient.del(_getPagosByUsuarioRedisKey(pago.usuarioId.toString()));
  }
  if (pago.conceptoPago) {
    await redisClient.del(_getPagosPorConceptoRedisKey(pago.conceptoPago));
  }
  if (pago.estado) {
    await redisClient.del(_getPagosPorEstadoRedisKey(pago.estado));
  }
  if (pago.entidadRelacionada && pago.entidadRelacionada.tipo && pago.entidadRelacionada.id) {
    await redisClient.del(_getPagosPorEntidadRedisKey(
      pago.entidadRelacionada.tipo,
      pago.entidadRelacionada.id.toString()
    ));
  }
  
  await redisClient.keys('pagos:monto:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return removed;
};

const cambiarEstadoPago = async (id, nuevoEstado) => {
  const redisClient = connectToRedis();
  const pago = await Pago.findById(id);
  const updated = await Pago.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
  
  await redisClient.del(_getPagoRedisKey(id));
  
  if (pago.estado) {
    await redisClient.del(_getPagosPorEstadoRedisKey(pago.estado));
  }
  await redisClient.del(_getPagosPorEstadoRedisKey(nuevoEstado));
  
  return updated;
};

const completarPago = async (id, comprobante = null) => {
  const redisClient = connectToRedis();
  const pago = await Pago.findById(id);
  const actualizacion = {
    estado: 'completado'
  };
  
  if (comprobante) {
    actualizacion.comprobante = comprobante;
  }
  
  const updated = await Pago.findByIdAndUpdate(id, actualizacion, { new: true });
  
  await redisClient.del(_getPagoRedisKey(id));
  
  if (pago.estado) {
    await redisClient.del(_getPagosPorEstadoRedisKey(pago.estado));
  }
  await redisClient.del(_getPagosPorEstadoRedisKey('completado'));
  
  return updated;
};

const reembolsarPago = async (id, motivoReembolso) => {
  const redisClient = connectToRedis();
  const pago = await Pago.findById(id);
  const updated = await Pago.findByIdAndUpdate(
    id,
    { 
      estado: 'reembolsado',
      motivoReembolso
    },
    { new: true }
  );
  
  await redisClient.del(_getPagoRedisKey(id));
  
  if (pago.estado) {
    await redisClient.del(_getPagosPorEstadoRedisKey(pago.estado));
  }
  await redisClient.del(_getPagosPorEstadoRedisKey('reembolsado'));
  
  return updated;
};

const vincularFactura = async (id, facturaId) => {
  const redisClient = connectToRedis();
  const updated = await Pago.findByIdAndUpdate(
    id,
    { facturaId },
    { new: true }
  );
  
  await redisClient.del(_getPagoRedisKey(id));
  
  return updated;
};

const getPagosPorRangoMontos = async (montoMin, montoMax) => {
  const redisClient = connectToRedis();
  const key = _getPagosPorRangoMontosRedisKey(montoMin, montoMax);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPagosPorRangoMontos desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPagosPorRangoMontos, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPagosPorRangoMontos desde MongoDB]");
  const result = await Pago.find({
    monto: { $gte: montoMin, $lte: montoMax }
  })
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ monto: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

module.exports = {
  getPagos,
  findPagoById,
  getPagosByUsuario,
  getPagosPorConcepto,
  getPagosPorEstado,
  getPagosPorEntidad,
  createPago,
  updatePago,
  deletePago,
  cambiarEstadoPago,
  completarPago,
  reembolsarPago,
  vincularFactura,
  getPagosPorRangoMontos
};