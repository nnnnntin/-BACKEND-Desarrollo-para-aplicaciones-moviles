const Promocion = require("../models/promocion.model");
const connectToRedis = require("../services/redis.service");

const _getPromocionRedisKey = (id) => `id:${id}-promocion`;
const _getPromocionesFilterRedisKey = (filtros) => `promociones:${JSON.stringify(filtros)}`;
const _getPromocionByCodigoRedisKey = (codigo) => `promocion:codigo:${codigo}`;
const _getPromocionesActivasRedisKey = () => `promociones:activas`;
const _getPromocionesPorTipoRedisKey = (tipo) => `promociones:tipo:${tipo}`;
const _getPromocionesPorEntidadRedisKey = (entidad, entidadId) => `promociones:entidad:${entidad}:${entidadId || 'todas'}`;
const _getPromocionesPorRangoDeFechasRedisKey = (fechaInicio, fechaFin) => `promociones:fechas:${fechaInicio}-${fechaFin}`;
const _getPromocionesProximasAExpirarRedisKey = (diasRestantes) => `promociones:proximas-expiracion:${diasRestantes}`;

const getPromociones = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getPromocionesFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPromociones desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPromociones, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPromociones desde MongoDB]");
  const result = await Promocion.find(filtros)
    .sort({ fechaInicio: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findPromocionById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getPromocionRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findPromocionById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findPromocionById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findPromocionById desde MongoDB]");
  const result = await Promocion.findById(id);
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const findPromocionByCodigo = async (codigo) => {
  const redisClient = connectToRedis();
  const key = _getPromocionByCodigoRedisKey(codigo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findPromocionByCodigo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findPromocionByCodigo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findPromocionByCodigo desde MongoDB]");
  const result = await Promocion.findOne({ codigo });
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getPromocionesActivas = async () => {
  const redisClient = connectToRedis();
  const key = _getPromocionesActivasRedisKey();
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPromocionesActivas desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPromocionesActivas, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPromocionesActivas desde MongoDB]");
  const fechaActual = new Date();
  
  const result = await Promocion.find({
    fechaInicio: { $lte: fechaActual },
    fechaFin: { $gte: fechaActual },
    activo: true
  })
    .sort({ fechaFin: 1 });
  
  // Tiempo de caché más corto para promociones activas (1 hora)
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getPromocionesPorTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getPromocionesPorTipoRedisKey(tipo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPromocionesPorTipo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPromocionesPorTipo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPromocionesPorTipo desde MongoDB]");
  const result = await Promocion.find({ tipo, activo: true })
    .sort({ fechaInicio: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getPromocionesPorEntidad = async (entidad, entidadId = null) => {
  const redisClient = connectToRedis();
  const key = _getPromocionesPorEntidadRedisKey(entidad, entidadId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPromocionesPorEntidad desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPromocionesPorEntidad, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPromocionesPorEntidad desde MongoDB]");
  const query = {
    'aplicableA.entidad': entidad,
    activo: true
  };
  
  if (entidadId) {
    query['aplicableA.ids'] = entidadId;
  }
  
  const result = await Promocion.find(query)
    .sort({ fechaInicio: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getPromocionesPorRangoDeFechas = async (fechaInicio, fechaFin) => {
  const redisClient = connectToRedis();
  const key = _getPromocionesPorRangoDeFechasRedisKey(fechaInicio, fechaFin);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPromocionesPorRangoDeFechas desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPromocionesPorRangoDeFechas, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPromocionesPorRangoDeFechas desde MongoDB]");
  const result = await Promocion.find({
    $or: [
      { fechaInicio: { $gte: fechaInicio, $lte: fechaFin } },
      { fechaFin: { $gte: fechaInicio, $lte: fechaFin } },
      {
        $and: [
          { fechaInicio: { $lte: fechaInicio } },
          { fechaFin: { $gte: fechaFin } }
        ]
      }
    ],
    activo: true
  })
    .sort({ fechaInicio: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createPromocion = async (promocionData) => {
  const redisClient = connectToRedis();
  const newPromocion = new Promocion(promocionData);
  const saved = await newPromocion.save();
  
  // Invalidar caches
  await redisClient.del(_getPromocionesFilterRedisKey({}));
  if (saved.codigo) {
    await redisClient.del(_getPromocionByCodigoRedisKey(saved.codigo));
  }
  
  // Verificar si la promoción está activa actualmente
  const fechaActual = new Date();
  if (saved.activo && saved.fechaInicio <= fechaActual && saved.fechaFin >= fechaActual) {
    await redisClient.del(_getPromocionesActivasRedisKey());
  }
  
  if (saved.tipo) {
    await redisClient.del(_getPromocionesPorTipoRedisKey(saved.tipo));
  }
  
  if (saved.aplicableA && saved.aplicableA.entidad) {
    await redisClient.del(_getPromocionesPorEntidadRedisKey(saved.aplicableA.entidad));
    if (saved.aplicableA.ids && saved.aplicableA.ids.length > 0) {
      for (const entidadId of saved.aplicableA.ids) {
        await redisClient.del(_getPromocionesPorEntidadRedisKey(saved.aplicableA.entidad, entidadId.toString()));
      }
    }
  }
  
  // Invalidar promociones por rango de fechas
  await redisClient.keys('promociones:fechas:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  // Invalidar promociones próximas a expirar
  await redisClient.keys('promociones:proximas-expiracion:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return saved;
};

const updatePromocion = async (id, payload) => {
  const redisClient = connectToRedis();
  const promocion = await Promocion.findById(id);
  const updated = await Promocion.findByIdAndUpdate(id, payload, { new: true });
  
  // Invalidar caches
  await redisClient.del(_getPromocionRedisKey(id));
  await redisClient.del(_getPromocionesFilterRedisKey({}));
  
  if (promocion.codigo) {
    await redisClient.del(_getPromocionByCodigoRedisKey(promocion.codigo));
  }
  if (updated.codigo && promocion.codigo !== updated.codigo) {
    await redisClient.del(_getPromocionByCodigoRedisKey(updated.codigo));
  }
  
  // Verificar cambios en estado activo, fechas o activo
  if (payload.fechaInicio || payload.fechaFin || 'activo' in payload) {
    await redisClient.del(_getPromocionesActivasRedisKey());
  }
  
  if (promocion.tipo) {
    await redisClient.del(_getPromocionesPorTipoRedisKey(promocion.tipo));
  }
  if (updated.tipo && promocion.tipo !== updated.tipo) {
    await redisClient.del(_getPromocionesPorTipoRedisKey(updated.tipo));
  }
  
  // Entidades aplicables
  if (promocion.aplicableA && promocion.aplicableA.entidad) {
    await redisClient.del(_getPromocionesPorEntidadRedisKey(promocion.aplicableA.entidad));
    if (promocion.aplicableA.ids && promocion.aplicableA.ids.length > 0) {
      for (const entidadId of promocion.aplicableA.ids) {
        await redisClient.del(_getPromocionesPorEntidadRedisKey(promocion.aplicableA.entidad, entidadId.toString()));
      }
    }
  }
  if (updated.aplicableA && updated.aplicableA.entidad) {
    await redisClient.del(_getPromocionesPorEntidadRedisKey(updated.aplicableA.entidad));
    if (updated.aplicableA.ids && updated.aplicableA.ids.length > 0) {
      for (const entidadId of updated.aplicableA.ids) {
        await redisClient.del(_getPromocionesPorEntidadRedisKey(updated.aplicableA.entidad, entidadId.toString()));
      }
    }
  }
  
  // Invalidar promociones por rango de fechas si cambiaron las fechas
  if (payload.fechaInicio || payload.fechaFin) {
    await redisClient.keys('promociones:fechas:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  // Invalidar promociones próximas a expirar
  await redisClient.keys('promociones:proximas-expiracion:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const deletePromocion = async (id) => {
  const redisClient = connectToRedis();
  const promocion = await Promocion.findById(id);
  const updated = await Promocion.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getPromocionRedisKey(id));
  await redisClient.del(_getPromocionesFilterRedisKey({}));
  
  if (promocion.codigo) {
    await redisClient.del(_getPromocionByCodigoRedisKey(promocion.codigo));
  }
  
  // Verificar si la promoción estaba activa
  const fechaActual = new Date();
  if (promocion.activo && promocion.fechaInicio <= fechaActual && promocion.fechaFin >= fechaActual) {
    await redisClient.del(_getPromocionesActivasRedisKey());
  }
  
  if (promocion.tipo) {
    await redisClient.del(_getPromocionesPorTipoRedisKey(promocion.tipo));
  }
  
  if (promocion.aplicableA && promocion.aplicableA.entidad) {
    await redisClient.del(_getPromocionesPorEntidadRedisKey(promocion.aplicableA.entidad));
    if (promocion.aplicableA.ids && promocion.aplicableA.ids.length > 0) {
      for (const entidadId of promocion.aplicableA.ids) {
        await redisClient.del(_getPromocionesPorEntidadRedisKey(promocion.aplicableA.entidad, entidadId.toString()));
      }
    }
  }
  
  // Invalidar promociones próximas a expirar
  await redisClient.keys('promociones:proximas-expiracion:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const activarPromocion = async (id) => {
  const redisClient = connectToRedis();
  const promocion = await Promocion.findById(id);
  const updated = await Promocion.findByIdAndUpdate(
    id,
    { activo: true },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getPromocionRedisKey(id));
  await redisClient.del(_getPromocionesFilterRedisKey({}));
  
  // Verificar si la promoción ahora está activa
  const fechaActual = new Date();
  if (updated.fechaInicio <= fechaActual && updated.fechaFin >= fechaActual) {
    await redisClient.del(_getPromocionesActivasRedisKey());
  }
  
  if (promocion.tipo) {
    await redisClient.del(_getPromocionesPorTipoRedisKey(promocion.tipo));
  }
  
  return updated;
};

const incrementarUsos = async (id) => {
  const redisClient = connectToRedis();
  const updated = await Promocion.findByIdAndUpdate(
    id,
    { $inc: { usosActuales: 1 } },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getPromocionRedisKey(id));
  
  // Si alcanzó el límite de usos, invalidar promociones activas
  if (updated.limiteCupos && updated.usosActuales >= updated.limiteCupos) {
    await redisClient.del(_getPromocionesActivasRedisKey());
  }
  
  return updated;
};

const validarPromocion = async (codigo, usuarioId, entidadTipo, entidadId) => {
  const redisClient = connectToRedis();
  const fechaActual = new Date();
  
  const promocion = await Promocion.findOne({
    codigo,
    fechaInicio: { $lte: fechaActual },
    fechaFin: { $gte: fechaActual },
    activo: true
  });
  
  if (!promocion) {
    return { valido: false, mensaje: 'Código de promoción inválido o expirado' };
  }
  
  if (promocion.aplicableA && promocion.aplicableA.entidad) {
    if (promocion.aplicableA.entidad !== entidadTipo) {
      return { valido: false, mensaje: 'Esta promoción no aplica para este tipo de reserva' };
    }
    
    if (
      promocion.aplicableA.ids && 
      promocion.aplicableA.ids.length > 0 && 
      !promocion.aplicableA.ids.includes(entidadId)
    ) {
      return { valido: false, mensaje: 'Esta promoción no aplica para esta entidad específica' };
    }
  }
  
  if (promocion.limiteCupos && promocion.usosActuales >= promocion.limiteCupos) {
    return { valido: false, mensaje: 'Esta promoción ha alcanzado su límite de usos' };
  }
  
  return { 
    valido: true, 
    promocion,
    mensaje: 'Promoción válida' 
  };
};

const getPromocionesProximasAExpirar = async (diasRestantes = 7) => {
  const redisClient = connectToRedis();
  const key = _getPromocionesProximasAExpirarRedisKey(diasRestantes);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getPromocionesProximasAExpirar desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getPromocionesProximasAExpirar, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getPromocionesProximasAExpirar desde MongoDB]");
  const fechaActual = new Date();
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasRestantes);
  
  const result = await Promocion.find({
    fechaFin: { $gte: fechaActual, $lte: fechaLimite },
    activo: true
  })
    .sort({ fechaFin: 1 });
  
  // Caché de corta duración para promociones próximas a expirar
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const actualizarAplicabilidad = async (id, entidad, ids) => {
  const redisClient = connectToRedis();
  const promocion = await Promocion.findById(id);
  const updated = await Promocion.findByIdAndUpdate(
    id,
    { 
      'aplicableA.entidad': entidad,
      'aplicableA.ids': ids
    },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getPromocionRedisKey(id));
  
  // Invalidar caches de entidad anterior
  if (promocion.aplicableA && promocion.aplicableA.entidad) {
    await redisClient.del(_getPromocionesPorEntidadRedisKey(promocion.aplicableA.entidad));
    if (promocion.aplicableA.ids && promocion.aplicableA.ids.length > 0) {
      for (const entidadId of promocion.aplicableA.ids) {
        await redisClient.del(_getPromocionesPorEntidadRedisKey(promocion.aplicableA.entidad, entidadId.toString()));
      }
    }
  }
  
  // Invalidar caches de nueva entidad
  await redisClient.del(_getPromocionesPorEntidadRedisKey(entidad));
  if (ids && ids.length > 0) {
    for (const entidadId of ids) {
      await redisClient.del(_getPromocionesPorEntidadRedisKey(entidad, entidadId.toString()));
    }
  }
  
  return updated;
};

module.exports = {
  getPromociones,
  findPromocionById,
  findPromocionByCodigo,
  getPromocionesActivas,
  getPromocionesPorTipo,
  getPromocionesPorEntidad,
  getPromocionesPorRangoDeFechas,
  createPromocion,
  updatePromocion,
  deletePromocion,
  activarPromocion,
  incrementarUsos,
  validarPromocion,
  getPromocionesProximasAExpirar,
  actualizarAplicabilidad
};