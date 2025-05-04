const Factura = require("../models/factura.model");
const connectToRedis = require("../services/redis.service");

const _getFacturaRedisKey = (id) => `id:${id}-factura`;
const _getFacturasFilterRedisKey = (filtros) => `facturas:${JSON.stringify(filtros)}`;
const _getFacturaByNumeroRedisKey = (numeroFactura) => `factura:numero:${numeroFactura}`;
const _getFacturasByUsuarioRedisKey = (usuarioId) => `usuario:${usuarioId}-facturas`;
const _getFacturasPorEstadoRedisKey = (estado) => `facturas:estado:${estado}`;
const _getFacturasVencidasRedisKey = () => `facturas:vencidas`;
const _getFacturasPorRangoFechasRedisKey = (fechaInicio, fechaFin) => `facturas:fechas:${fechaInicio}-${fechaFin}`;
const _getFacturasPorRangoMontoRedisKey = (montoMin, montoMax) => `facturas:monto:${montoMin}-${montoMax}`;

const getFacturas = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getFacturasFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getFacturas desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getFacturas, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getFacturas desde MongoDB]");
  const result = await Factura.find(filtros)
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ fechaEmision: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findFacturaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getFacturaRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findFacturaById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findFacturaById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findFacturaById desde MongoDB]");
  const result = await Factura.findById(id)
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const findFacturaByNumero = async (numeroFactura) => {
  const redisClient = connectToRedis();
  const key = _getFacturaByNumeroRedisKey(numeroFactura);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findFacturaByNumero desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findFacturaByNumero, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findFacturaByNumero desde MongoDB]");
  const result = await Factura.findOne({ numeroFactura })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getFacturasByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getFacturasByUsuarioRedisKey(usuarioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getFacturasByUsuario desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getFacturasByUsuario, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getFacturasByUsuario desde MongoDB]");
  const result = await Factura.find({ usuarioId })
    .populate('pagosIds')
    .sort({ fechaEmision: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getFacturasPorEstado = async (estado) => {
  const redisClient = connectToRedis();
  const key = _getFacturasPorEstadoRedisKey(estado);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getFacturasPorEstado desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getFacturasPorEstado, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getFacturasPorEstado desde MongoDB]");
  const result = await Factura.find({ estado })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ fechaEmision: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getFacturasVencidas = async () => {
  const redisClient = connectToRedis();
  const key = _getFacturasVencidasRedisKey();
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getFacturasVencidas desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getFacturasVencidas, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getFacturasVencidas desde MongoDB]");
  const fechaActual = new Date();
  
  const result = await Factura.find({
    fechaVencimiento: { $lt: fechaActual },
    estado: 'pendiente'
  })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ fechaVencimiento: 1 });
  
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getFacturasPorRangoFechas = async (fechaInicio, fechaFin) => {
  const redisClient = connectToRedis();
  const key = _getFacturasPorRangoFechasRedisKey(fechaInicio, fechaFin);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getFacturasPorRangoFechas desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getFacturasPorRangoFechas, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getFacturasPorRangoFechas desde MongoDB]");
  const result = await Factura.find({
    fechaEmision: { $gte: fechaInicio, $lte: fechaFin }
  })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ fechaEmision: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createFactura = async (facturaData) => {
  const redisClient = connectToRedis();
  const newFactura = new Factura(facturaData);
  const saved = await newFactura.save();
  
  await redisClient.del(_getFacturasFilterRedisKey({}));
  if (saved.numeroFactura) {
    await redisClient.del(_getFacturaByNumeroRedisKey(saved.numeroFactura));
  }
  if (saved.usuarioId) {
    await redisClient.del(_getFacturasByUsuarioRedisKey(saved.usuarioId.toString()));
  }
  if (saved.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(saved.estado));
  }
  
  if (saved.estado === 'pendiente' && saved.fechaVencimiento && saved.fechaVencimiento < new Date()) {
    await redisClient.del(_getFacturasVencidasRedisKey());
  }
  
  return saved;
};

const updateFactura = async (id, payload) => {
  const redisClient = connectToRedis();
  const factura = await Factura.findById(id);
  const updated = await Factura.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getFacturaRedisKey(id));
  await redisClient.del(_getFacturasFilterRedisKey({}));
  
  if (factura.numeroFactura) {
    await redisClient.del(_getFacturaByNumeroRedisKey(factura.numeroFactura));
  }
  if (updated.numeroFactura && factura.numeroFactura !== updated.numeroFactura) {
    await redisClient.del(_getFacturaByNumeroRedisKey(updated.numeroFactura));
  }
  
  if (factura.usuarioId) {
    await redisClient.del(_getFacturasByUsuarioRedisKey(factura.usuarioId.toString()));
  }
  if (updated.usuarioId && (!factura.usuarioId || factura.usuarioId.toString() !== updated.usuarioId.toString())) {
    await redisClient.del(_getFacturasByUsuarioRedisKey(updated.usuarioId.toString()));
  }
  
  if (factura.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(factura.estado));
  }
  if (updated.estado && factura.estado !== updated.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(updated.estado));
  }
  
  await redisClient.del(_getFacturasVencidasRedisKey());
  
  if (payload.fechaEmision) {
    await redisClient.keys('facturas:fechas:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  if (payload.total) {
    await redisClient.keys('facturas:monto:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

const deleteFactura = async (id) => {
  const redisClient = connectToRedis();
  const factura = await Factura.findById(id);
  const removed = await Factura.findByIdAndDelete(id);
  
  await redisClient.del(_getFacturaRedisKey(id));
  await redisClient.del(_getFacturasFilterRedisKey({}));
  
  if (factura.numeroFactura) {
    await redisClient.del(_getFacturaByNumeroRedisKey(factura.numeroFactura));
  }
  if (factura.usuarioId) {
    await redisClient.del(_getFacturasByUsuarioRedisKey(factura.usuarioId.toString()));
  }
  if (factura.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(factura.estado));
  }
  
  if (factura.estado === 'pendiente' && factura.fechaVencimiento && factura.fechaVencimiento < new Date()) {
    await redisClient.del(_getFacturasVencidasRedisKey());
  }
  
  return removed;
};

const marcarFacturaComoCancelada = async (id, motivo = '') => {
  const redisClient = connectToRedis();
  const factura = await Factura.findById(id);
  const updated = await Factura.findByIdAndUpdate(
    id,
    {
      estado: 'cancelada',
      motivoCancelacion: motivo
    },
    { new: true }
  );
  
  await redisClient.del(_getFacturaRedisKey(id));
  if (factura.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(factura.estado));
  }
  await redisClient.del(_getFacturasPorEstadoRedisKey('cancelada'));
  
  if (factura.estado === 'pendiente' && factura.fechaVencimiento && factura.fechaVencimiento < new Date()) {
    await redisClient.del(_getFacturasVencidasRedisKey());
  }
  
  return updated;
};

const agregarPagoFactura = async (id, pagoId) => {
  const redisClient = connectToRedis();
  const updated = await Factura.findByIdAndUpdate(
    id,
    { $addToSet: { pagosIds: pagoId } },
    { new: true }
  );
  
  await redisClient.del(_getFacturaRedisKey(id));
  if (updated.usuarioId) {
    await redisClient.del(_getFacturasByUsuarioRedisKey(updated.usuarioId.toString()));
  }
  
  return updated;
};

const actualizarPdfUrl = async (id, pdfUrl) => {
  const redisClient = connectToRedis();
  const updated = await Factura.findByIdAndUpdate(
    id,
    { pdfUrl },
    { new: true }
  );
  
  await redisClient.del(_getFacturaRedisKey(id));
  
  return updated;
};

const getFacturasPorRangoMonto = async (montoMin, montoMax) => {
  const redisClient = connectToRedis();
  const key = _getFacturasPorRangoMontoRedisKey(montoMin, montoMax);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getFacturasPorRangoMonto desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getFacturasPorRangoMonto, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getFacturasPorRangoMonto desde MongoDB]");
  const result = await Factura.find({
    total: { $gte: montoMin, $lte: montoMax }
  })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ total: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

module.exports = {
  getFacturas,
  findFacturaById,
  findFacturaByNumero,
  getFacturasByUsuario,
  getFacturasPorEstado,
  getFacturasVencidas,
  getFacturasPorRangoFechas,
  createFactura,
  updateFactura,
  deleteFactura,
  marcarFacturaComoCancelada,
  agregarPagoFactura,
  actualizarPdfUrl,
  getFacturasPorRangoMonto
};