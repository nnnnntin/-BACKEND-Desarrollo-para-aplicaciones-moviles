const ServicioAdicional = require("../models/servicioAdicional.model");
const connectToRedis = require("../services/redis.service");

const _getServiciosAdicionalesRedisKey = (id) => `id:${id}-serviciosAdicionales`;
const _getServiciosAdicionalesFilterRedisKey = (filtros) => `serviciosAdicionales:${JSON.stringify(filtros)}`;
const _getServiciosByTipoRedisKey = (tipo) => `serviciosAdicionales:tipo:${tipo}`;
const _getServiciosByProveedorRedisKey = (proveedorId) => `proveedor:${proveedorId}-serviciosAdicionales`;
const _getServiciosByEspacioRedisKey = (espacioId) => `espacio:${espacioId}-serviciosAdicionales`;
const _getServiciosByRangoPrecioRedisKey = (precioMin, precioMax) => `serviciosAdicionales:precio:${precioMin}-${precioMax}`;
const _getServiciosByUnidadPrecioRedisKey = (unidadPrecio) => `serviciosAdicionales:unidadPrecio:${unidadPrecio}`;
const _getServiciosDisponiblesEnFechaRedisKey = (fecha, diaSemana) => `serviciosAdicionales:disponibles:${fecha}:${diaSemana}`;
const _getServiciosConAprobacionRedisKey = () => `serviciosAdicionales:requiereAprobacion`;

const getServiciosAdicionales = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getServiciosAdicionalesFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getServiciosAdicionales desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getServiciosAdicionales, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getServiciosAdicionales desde MongoDB]");
  const result = await ServicioAdicional.find(filtros)
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findServicioAdicionalById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getServiciosAdicionalesRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findServicioAdicionalById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findServicioAdicionalById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findServicioAdicionalById desde MongoDB]");
  const result = await ServicioAdicional.findById(id)
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getServiciosByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByTipoRedisKey(tipo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getServiciosByTipo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getServiciosByTipo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getServiciosByTipo desde MongoDB]");
  const result = await ServicioAdicional.find({ tipo, activo: true })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getServiciosByProveedor = async (proveedorId) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByProveedorRedisKey(proveedorId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getServiciosByProveedor desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getServiciosByProveedor, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getServiciosByProveedor desde MongoDB]");
  const result = await ServicioAdicional.find({ proveedorId, activo: true })
    .populate('espaciosDisponibles');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getServiciosByEspacio = async (espacioId) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByEspacioRedisKey(espacioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getServiciosByEspacio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getServiciosByEspacio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getServiciosByEspacio desde MongoDB]");
  const result = await ServicioAdicional.find({ 
    espaciosDisponibles: espacioId,
    activo: true
  })
    .populate('proveedorId', 'nombre contacto');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getServiciosByRangoPrecio = async (precioMin, precioMax) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByRangoPrecioRedisKey(precioMin, precioMax);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getServiciosByRangoPrecio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getServiciosByRangoPrecio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getServiciosByRangoPrecio desde MongoDB]");
  const result = await ServicioAdicional.find({
    precio: { $gte: precioMin, $lte: precioMax },
    activo: true
  })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getServiciosByUnidadPrecio = async (unidadPrecio) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByUnidadPrecioRedisKey(unidadPrecio);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getServiciosByUnidadPrecio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getServiciosByUnidadPrecio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getServiciosByUnidadPrecio desde MongoDB]");
  const result = await ServicioAdicional.find({ unidadPrecio, activo: true })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getServiciosDisponiblesEnFecha = async (fecha, diaDeSemanaNombre) => {
  const redisClient = connectToRedis();
  const key = _getServiciosDisponiblesEnFechaRedisKey(fecha, diaDeSemanaNombre);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getServiciosDisponiblesEnFecha desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getServiciosDisponiblesEnFecha, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getServiciosDisponiblesEnFecha desde MongoDB]");
  const result = await ServicioAdicional.find({
    'disponibilidad.diasDisponibles': diaDeSemanaNombre,
    activo: true
  })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createServicioAdicional = async (servicioData) => {
  const redisClient = connectToRedis();
  const newServicio = new ServicioAdicional(servicioData);
  const saved = await newServicio.save();
  
  // Invalidar caches
  await redisClient.del(_getServiciosAdicionalesFilterRedisKey({}));
  if (saved.tipo) {
    await redisClient.del(_getServiciosByTipoRedisKey(saved.tipo));
  }
  if (saved.proveedorId) {
    await redisClient.del(_getServiciosByProveedorRedisKey(saved.proveedorId.toString()));
  }
  if (saved.espaciosDisponibles && saved.espaciosDisponibles.length > 0) {
    for (const espacioId of saved.espaciosDisponibles) {
      await redisClient.del(_getServiciosByEspacioRedisKey(espacioId.toString()));
    }
  }
  if (saved.unidadPrecio) {
    await redisClient.del(_getServiciosByUnidadPrecioRedisKey(saved.unidadPrecio));
  }
  if (saved.requiereAprobacion) {
    await redisClient.del(_getServiciosConAprobacionRedisKey());
  }
  
  return saved;
};

const updateServicioAdicional = async (id, payload) => {
  const redisClient = connectToRedis();
  const servicio = await ServicioAdicional.findById(id);
  const updated = await ServicioAdicional.findByIdAndUpdate(id, payload, { new: true });
  
  // Invalidar caches
  await redisClient.del(_getServiciosAdicionalesRedisKey(id));
  await redisClient.del(_getServiciosAdicionalesFilterRedisKey({}));
  
  if (servicio.tipo) {
    await redisClient.del(_getServiciosByTipoRedisKey(servicio.tipo));
  }
  if (updated.tipo && servicio.tipo !== updated.tipo) {
    await redisClient.del(_getServiciosByTipoRedisKey(updated.tipo));
  }
  
  if (servicio.proveedorId) {
    await redisClient.del(_getServiciosByProveedorRedisKey(servicio.proveedorId.toString()));
  }
  if (updated.proveedorId && (!servicio.proveedorId || servicio.proveedorId.toString() !== updated.proveedorId.toString())) {
    await redisClient.del(_getServiciosByProveedorRedisKey(updated.proveedorId.toString()));
  }
  
  if (servicio.unidadPrecio) {
    await redisClient.del(_getServiciosByUnidadPrecioRedisKey(servicio.unidadPrecio));
  }
  if (updated.unidadPrecio && servicio.unidadPrecio !== updated.unidadPrecio) {
    await redisClient.del(_getServiciosByUnidadPrecioRedisKey(updated.unidadPrecio));
  }
  
  // Si hay cambios en requiereAprobacion
  if (servicio.requiereAprobacion !== updated.requiereAprobacion) {
    await redisClient.del(_getServiciosConAprobacionRedisKey());
  }
  
  // Invalidar caches de rango de precios
  if (servicio.precio !== updated.precio) {
    await redisClient.keys('serviciosAdicionales:precio:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

const deleteServicioAdicional = async (id) => {
  const redisClient = connectToRedis();
  const servicio = await ServicioAdicional.findById(id);
  const updated = await ServicioAdicional.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getServiciosAdicionalesRedisKey(id));
  await redisClient.del(_getServiciosAdicionalesFilterRedisKey({}));
  
  if (servicio.tipo) {
    await redisClient.del(_getServiciosByTipoRedisKey(servicio.tipo));
  }
  if (servicio.proveedorId) {
    await redisClient.del(_getServiciosByProveedorRedisKey(servicio.proveedorId.toString()));
  }
  if (servicio.espaciosDisponibles && servicio.espaciosDisponibles.length > 0) {
    for (const espacioId of servicio.espaciosDisponibles) {
      await redisClient.del(_getServiciosByEspacioRedisKey(espacioId.toString()));
    }
  }
  if (servicio.unidadPrecio) {
    await redisClient.del(_getServiciosByUnidadPrecioRedisKey(servicio.unidadPrecio));
  }
  if (servicio.requiereAprobacion) {
    await redisClient.del(_getServiciosConAprobacionRedisKey());
  }
  
  return updated;
};

const activarServicioAdicional = async (id) => {
  return await updateServicioAdicional(id, { activo: true });
};

const asignarEspacio = async (id, espacioId) => {
  const redisClient = connectToRedis();
  const updated = await ServicioAdicional.findByIdAndUpdate(
    id,
    { $addToSet: { espaciosDisponibles: espacioId } },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getServiciosAdicionalesRedisKey(id));
  await redisClient.del(_getServiciosByEspacioRedisKey(espacioId.toString()));
  
  return updated;
};

const eliminarEspacio = async (id, espacioId) => {
  const redisClient = connectToRedis();
  const updated = await ServicioAdicional.findByIdAndUpdate(
    id,
    { $pull: { espaciosDisponibles: espacioId } },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getServiciosAdicionalesRedisKey(id));
  await redisClient.del(_getServiciosByEspacioRedisKey(espacioId.toString()));
  
  return updated;
};

const getServiciosConAprobacion = async () => {
  const redisClient = connectToRedis();
  const key = _getServiciosConAprobacionRedisKey();
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getServiciosConAprobacion desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getServiciosConAprobacion, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getServiciosConAprobacion desde MongoDB]");
  const result = await ServicioAdicional.find({ 
    requiereAprobacion: true,
    activo: true
  })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

module.exports = {
  getServiciosAdicionales,
  findServicioAdicionalById,
  getServiciosByTipo,
  getServiciosByProveedor,
  getServiciosByEspacio,
  getServiciosByRangoPrecio,
  getServiciosByUnidadPrecio,
  getServiciosDisponiblesEnFecha,
  createServicioAdicional,
  updateServicioAdicional,
  deleteServicioAdicional,
  activarServicioAdicional,
  asignarEspacio,
  eliminarEspacio,
  getServiciosConAprobacion
};