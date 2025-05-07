const Factura = require("../models/factura.model");
const Usuario = require("../models/usuario.model");
const connectToRedis = require("../services/redis.service");

const _getFacturaRedisKey = (id) => `id:${id}-factura`;
const _getFacturasFilterRedisKey = (filtros, skip, limit) =>
  `facturas:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getFacturaByNumeroRedisKey = (numeroFactura) =>
  `factura:numero:${numeroFactura}`;
const _getFacturasByUsuarioRedisKey = (usuarioId) =>
  `usuario:${usuarioId}-facturas`;
const _getFacturasPorEstadoRedisKey = (estado) => `facturas:estado:${estado}`;
const _getFacturasVencidasRedisKey = () => `facturas:vencidas`;
const _getFacturasPorRangoFechasRedisKey = (fechaInicio, fechaFin) =>
  `facturas:fechas:${fechaInicio}-${fechaFin}`;
const _getFacturasPorRangoMontoRedisKey = (montoMin, montoMax) =>
  `facturas:monto:${montoMin}-${montoMax}`;

const getFacturas = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getFacturasFilterRedisKey(filtros, skip, limit);

  try {
    const exists = await redisClient.exists(key);
    if (exists) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {
          // si falla el parseo, seguimos al fetch de Mongo
        }
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getFacturas con paginación");
    const result = await Factura.find(filtros)
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .sort({ fechaEmision: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (error) {
    console.log("[Error Redis] leyendo facturas desde MongoDB sin cache", error);
    try {
      return await Factura.find(filtros)
        .populate("usuarioId", "nombre email")
        .populate("pagosIds")
        .sort({ fechaEmision: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (mongoError) {
      console.error("[Error Mongo] al obtener facturas", mongoError);
      throw mongoError;
    }
  }
};

const findFacturaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getFacturaRedisKey(id);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo findFacturaById desde MongoDB]");
    const result = await Factura.findById(id)
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Factura.findById(id)
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .lean();
  }
};

const findFacturaByNumero = async (numeroFactura) => {
  const redisClient = connectToRedis();
  const key = _getFacturaByNumeroRedisKey(numeroFactura);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo findFacturaByNumero desde MongoDB]");
    const result = await Factura.findOne({ numeroFactura })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Factura.findOne({ numeroFactura })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .lean();
  }
};

const getFacturasByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getFacturasByUsuarioRedisKey(usuarioId);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getFacturasByUsuario desde MongoDB]");
    const result = await Factura.find({ usuarioId })
      .populate("pagosIds")
      .sort({ fechaEmision: -1 })
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Factura.find({ usuarioId })
      .populate("pagosIds")
      .sort({ fechaEmision: -1 })
      .lean();
  }
};

const getFacturasPorEstado = async (estado) => {
  const redisClient = connectToRedis();
  const key = _getFacturasPorEstadoRedisKey(estado);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getFacturasPorEstado desde MongoDB]");
    const result = await Factura.find({ estado })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .sort({ fechaEmision: -1 })
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Factura.find({ estado })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .sort({ fechaEmision: -1 })
      .lean();
  }
};

const getFacturasVencidas = async () => {
  const redisClient = connectToRedis();
  const key = _getFacturasVencidasRedisKey();

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getFacturasVencidas desde MongoDB]");
    const fechaActual = new Date();

    const result = await Factura.find({
      fechaVencimiento: { $lt: fechaActual },
      estado: "pendiente",
    })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .sort({ fechaVencimiento: 1 })
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    const fechaActual = new Date();

    return await Factura.find({
      fechaVencimiento: { $lt: fechaActual },
      estado: "pendiente",
    })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .sort({ fechaVencimiento: 1 })
      .lean();
  }
};

const getFacturasPorRangoFechas = async (fechaInicio, fechaFin) => {
  const redisClient = connectToRedis();
  const key = _getFacturasPorRangoFechasRedisKey(fechaInicio, fechaFin);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getFacturasPorRangoFechas desde MongoDB]");
    const result = await Factura.find({
      fechaEmision: { $gte: fechaInicio, $lte: fechaFin },
    })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .sort({ fechaEmision: -1 })
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Factura.find({
      fechaEmision: { $gte: fechaInicio, $lte: fechaFin },
    })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .sort({ fechaEmision: -1 })
      .lean();
  }
};

const createFactura = async (facturaData) => {
  const redisClient = connectToRedis();

  if (facturaData.usuarioId) {
    const usuarioExiste = await Usuario.exists({
      _id: facturaData.usuarioId,
    });
    if (!usuarioExiste) {
      throw new Error("usuario no encontrado");
    }
  }

  const newFactura = new Factura(facturaData);
  const saved = await newFactura.save();

  await redisClient.del(_getFacturasFilterRedisKey({}));
  if (saved.numeroFactura) {
    await redisClient.del(_getFacturaByNumeroRedisKey(saved.numeroFactura));
  }
  if (saved.usuarioId) {
    await redisClient.del(
      _getFacturasByUsuarioRedisKey(saved.usuarioId.toString())
    );
  }
  if (saved.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(saved.estado));
  }

  if (
    saved.estado === "pendiente" &&
    saved.fechaVencimiento &&
    saved.fechaVencimiento < new Date()
  ) {
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
  if (
    updated.numeroFactura &&
    factura.numeroFactura !== updated.numeroFactura
  ) {
    await redisClient.del(_getFacturaByNumeroRedisKey(updated.numeroFactura));
  }

  if (factura.usuarioId) {
    await redisClient.del(
      _getFacturasByUsuarioRedisKey(factura.usuarioId.toString())
    );
  }
  if (
    updated.usuarioId &&
    (!factura.usuarioId ||
      factura.usuarioId.toString() !== updated.usuarioId.toString())
  ) {
    await redisClient.del(
      _getFacturasByUsuarioRedisKey(updated.usuarioId.toString())
    );
  }

  if (factura.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(factura.estado));
  }
  if (updated.estado && factura.estado !== updated.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(updated.estado));
  }

  await redisClient.del(_getFacturasVencidasRedisKey());

  if (payload.fechaEmision) {
    await redisClient.keys("facturas:fechas:*").then((keys) => {
      keys.forEach((key) => redisClient.del(key));
    });
  }

  if (payload.total) {
    await redisClient.keys("facturas:monto:*").then((keys) => {
      keys.forEach((key) => redisClient.del(key));
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
    await redisClient.del(
      _getFacturasByUsuarioRedisKey(factura.usuarioId.toString())
    );
  }
  if (factura.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(factura.estado));
  }

  if (
    factura.estado === "pendiente" &&
    factura.fechaVencimiento &&
    factura.fechaVencimiento < new Date()
  ) {
    await redisClient.del(_getFacturasVencidasRedisKey());
  }

  return removed;
};

const marcarFacturaComoCancelada = async (id, motivo = "") => {
  const redisClient = connectToRedis();
  const factura = await Factura.findById(id);
  const updated = await Factura.findByIdAndUpdate(
    id,
    {
      estado: "cancelada",
      motivoCancelacion: motivo,
    },
    { new: true }
  );

  await redisClient.del(_getFacturaRedisKey(id));
  if (factura.estado) {
    await redisClient.del(_getFacturasPorEstadoRedisKey(factura.estado));
  }
  await redisClient.del(_getFacturasPorEstadoRedisKey("cancelada"));

  if (
    factura.estado === "pendiente" &&
    factura.fechaVencimiento &&
    factura.fechaVencimiento < new Date()
  ) {
    await redisClient.del(_getFacturasVencidasRedisKey());
  }

  return updated;
};

const agregarPagoFactura = async (id, pagoId) => {
  if (!mongoose.Types.ObjectId.isValid(pagoId)) {
    const err = new Error("El ID de pago no tiene un formato válido");
    err.code = "INVALID_PAYMENT_ID";
    throw err;
  }

  const pagoExistente = await Pago.findById(pagoId);
  if (!pagoExistente) {
    const err = new Error(`No existe ningún pago con id: ${pagoId}`);
    err.code = "PAYMENT_NOT_FOUND";
    throw err;
  }

  const redisClient = connectToRedis();
  let updated;
  try {
    updated = await Factura.findByIdAndUpdate(
      id,
      { $addToSet: { pagosIds: pagoId } },
      { new: true }
    );
  } catch (error) {
    if (error.name === "CastError") {
      const err = new Error("El ID de factura no tiene un formato válido");
      err.code = "INVALID_FACTURA_ID";
      throw err;
    }
    throw error;
  }

  if (!updated) {
    const err = new Error(`No se ha encontrado la factura con id: ${id}`);
    err.code = "FACTURA_NOT_FOUND";
    throw err;
  }

  await redisClient.del(_getFacturaRedisKey(id));
  if (updated.usuarioId) {
    await redisClient.del(
      _getFacturasByUsuarioRedisKey(updated.usuarioId.toString())
    );
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

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getFacturasPorRangoMonto desde MongoDB]");
    const result = await Factura.find({
      total: { $gte: montoMin, $lte: montoMax },
    })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .sort({ total: -1 })
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Factura.find({
      total: { $gte: montoMin, $lte: montoMax },
    })
      .populate("usuarioId", "nombre email")
      .populate("pagosIds")
      .sort({ total: -1 })
      .lean();
  }
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
  getFacturasPorRangoMonto,
};
