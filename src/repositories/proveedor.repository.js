const Proveedor = require("../models/proveedor.model");
const connectToRedis = require("../services/redis.service");

const _getProveedorRedisKey = (id) => `id:${id}-proveedor`;
const _getProveedoresFilterRedisKey = (filtros) => `proveedores:${JSON.stringify(filtros)}`;
const _getProveedoresByTipoRedisKey = (tipo) => `proveedores:tipo:${tipo}`;
const _getProveedoresVerificadosRedisKey = () => `proveedores:verificados`;
const _getProveedoresPorCalificacionRedisKey = (calificacionMinima) => `proveedores:calificacion-min:${calificacionMinima}`;
const _getProveedoresConMasServiciosRedisKey = (limite) => `proveedores:mas-servicios:${limite}`;

const getProveedores = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getProveedoresFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getProveedores desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getProveedores, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getProveedores desde MongoDB]");
  const result = await Proveedor.find(filtros)
    .populate('serviciosOfrecidos');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findProveedorById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getProveedorRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findProveedorById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findProveedorById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findProveedorById desde MongoDB]");
  const result = await Proveedor.findById(id)
    .populate('serviciosOfrecidos');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getProveedoresByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getProveedoresByTipoRedisKey(tipo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getProveedoresByTipo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getProveedoresByTipo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getProveedoresByTipo desde MongoDB]");
  const result = await Proveedor.find({ tipo, activo: true });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getProveedoresVerificados = async () => {
  const redisClient = connectToRedis();
  const key = _getProveedoresVerificadosRedisKey();
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getProveedoresVerificados desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getProveedoresVerificados, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getProveedoresVerificados desde MongoDB]");
  const result = await Proveedor.find({ verificado: true, activo: true });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createProveedor = async (proveedorData) => {
  const redisClient = connectToRedis();
  const newProveedor = new Proveedor(proveedorData);
  const saved = await newProveedor.save();
  
  // Invalidar caches
  await redisClient.del(_getProveedoresFilterRedisKey({}));
  if (saved.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(saved.tipo));
  }
  if (saved.verificado) {
    await redisClient.del(_getProveedoresVerificadosRedisKey());
  }
  
  // Invalidar caches de calificación si aplica
  if (saved.calificacionPromedio) {
    for (let i = 1; i <= Math.min(saved.calificacionPromedio, 5); i++) {
      await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
    }
  }
  
  // Invalidar caches de proveedores con más servicios
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return saved;
};

const updateProveedor = async (id, payload) => {
  const redisClient = connectToRedis();
  const proveedor = await Proveedor.findById(id);
  const updated = await Proveedor.findByIdAndUpdate(id, payload, { new: true });
  
  // Invalidar caches
  await redisClient.del(_getProveedorRedisKey(id));
  await redisClient.del(_getProveedoresFilterRedisKey({}));
  
  if (proveedor.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(proveedor.tipo));
  }
  if (updated.tipo && proveedor.tipo !== updated.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(updated.tipo));
  }
  
  // Verificar cambios en verificado
  if (proveedor.verificado !== updated.verificado) {
    await redisClient.del(_getProveedoresVerificadosRedisKey());
  }
  
  // Calificación
  if (proveedor.calificacionPromedio !== updated.calificacionPromedio) {
    // Invalidar todas las caches de calificación que podrían verse afectadas
    const maxCalificacion = 5;
    for (let i = 1; i <= maxCalificacion; i++) {
      await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
    }
  }
  
  // Servicios
  if (payload.serviciosOfrecidos) {
    await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

const deleteProveedor = async (id) => {
  const redisClient = connectToRedis();
  const proveedor = await Proveedor.findById(id);
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getProveedorRedisKey(id));
  await redisClient.del(_getProveedoresFilterRedisKey({}));
  
  if (proveedor.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(proveedor.tipo));
  }
  if (proveedor.verificado) {
    await redisClient.del(_getProveedoresVerificadosRedisKey());
  }
  
  // Invalidar caches de calificación
  if (proveedor.calificacionPromedio) {
    for (let i = 1; i <= Math.min(proveedor.calificacionPromedio, 5); i++) {
      await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
    }
  }
  
  // Invalidar caches de proveedores con más servicios
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const activarProveedor = async (id) => {
  const redisClient = connectToRedis();
  const proveedor = await Proveedor.findById(id);
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { activo: true },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getProveedorRedisKey(id));
  await redisClient.del(_getProveedoresFilterRedisKey({}));
  
  if (proveedor.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(proveedor.tipo));
  }
  if (proveedor.verificado) {
    await redisClient.del(_getProveedoresVerificadosRedisKey());
  }
  
  // Invalidar caches de calificación
  if (proveedor.calificacionPromedio) {
    for (let i = 1; i <= Math.min(proveedor.calificacionPromedio, 5); i++) {
      await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
    }
  }
  
  // Invalidar caches de proveedores con más servicios
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const verificarProveedor = async (id) => {
  const redisClient = connectToRedis();
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { verificado: true },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getProveedorRedisKey(id));
  await redisClient.del(_getProveedoresVerificadosRedisKey());
  
  return updated;
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  const redisClient = connectToRedis();
  const proveedor = await Proveedor.findById(id);
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { calificacionPromedio: nuevaCalificacion },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getProveedorRedisKey(id));
  
  // Invalidar caches de calificación
  const maxCalificacion = 5;
  for (let i = 1; i <= maxCalificacion; i++) {
    await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
  }
  
  return updated;
};

const agregarServicio = async (id, servicioId) => {
  const redisClient = connectToRedis();
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { $addToSet: { serviciosOfrecidos: servicioId } },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getProveedorRedisKey(id));
  
  // Invalidar caches de proveedores con más servicios
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const eliminarServicio = async (id, servicioId) => {
  const redisClient = connectToRedis();
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { $pull: { serviciosOfrecidos: servicioId } },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getProveedorRedisKey(id));
  
  // Invalidar caches de proveedores con más servicios
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const actualizarContacto = async (id, contacto) => {
  return await updateProveedor(id, { contacto });
};

const actualizarMetodoPago = async (id, metodoPago) => {
  return await updateProveedor(id, { metodoPago });
};

const getProveedoresPorCalificacion = async (calificacionMinima = 4) => {
  const redisClient = connectToRedis();
  const key = _getProveedoresPorCalificacionRedisKey(calificacionMinima);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getProveedoresPorCalificacion desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getProveedoresPorCalificacion, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getProveedoresPorCalificacion desde MongoDB]");
  const result = await Proveedor.find({
    calificacionPromedio: { $gte: calificacionMinima },
    activo: true
  })
    .populate('serviciosOfrecidos')
    .sort({ calificacionPromedio: -1 });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getProveedoresConMasServicios = async (limite = 5) => {
  const redisClient = connectToRedis();
  const key = _getProveedoresConMasServiciosRedisKey(limite);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getProveedoresConMasServicios desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getProveedoresConMasServicios, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getProveedoresConMasServicios desde MongoDB]");
  const result = await Proveedor.aggregate([
    { $match: { activo: true } },
    { $project: { nombre: 1, tipo: 1, numeroServicios: { $size: '$serviciosOfrecidos' } } },
    { $sort: { numeroServicios: -1 } },
    { $limit: limite }
  ]);
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

module.exports = {
  getProveedores,
  findProveedorById,
  getProveedoresByTipo,
  getProveedoresVerificados,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  activarProveedor,
  verificarProveedor,
  actualizarCalificacion,
  agregarServicio,
  eliminarServicio,
  actualizarContacto,
  actualizarMetodoPago,
  getProveedoresPorCalificacion,
  getProveedoresConMasServicios
};