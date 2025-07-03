const ServicioAdicional = require("../models/servicioAdicional.model");
const connectToRedis = require("../services/redis.service");

const _getServiciosAdicionalesRedisKey = (id) => `id:${id}-serviciosAdicionales`;
const _getServiciosAdicionalesFilterRedisKey = (filtros, skip, limit) =>
  `serviciosAdicionales:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getServiciosByTipoRedisKey = (tipo) => `serviciosAdicionales:tipo:${tipo}`;
const _getServiciosByProveedorRedisKey = (proveedorId) => `proveedor:${proveedorId}-serviciosAdicionales`;
const _getServiciosByEspacioRedisKey = (espacioId) => `espacio:${espacioId}-serviciosAdicionales`;
const _getServiciosByRangoPrecioRedisKey = (precioMin, precioMax) => `serviciosAdicionales:precio:${precioMin}-${precioMax}`;
const _getServiciosByUnidadPrecioRedisKey = (unidadPrecio) => `serviciosAdicionales:unidadPrecio:${unidadPrecio}`;
const _getServiciosDisponiblesEnFechaRedisKey = (fecha, diaSemana) => `serviciosAdicionales:disponibles:${fecha}:${diaSemana}`;
const _getServiciosConAprobacionRedisKey = () => `serviciosAdicionales:requiereAprobacion`;

const getServiciosAdicionales = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getServiciosAdicionalesFilterRedisKey(filtros, skip, limit);

  try {
    if (await redisClient.exists(key)) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try { return JSON.parse(cached); } catch {}
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getServiciosAdicionales con skip/limit");
    const result = await ServicioAdicional.find(filtros)
      .populate("proveedorId", "nombre contacto")
      .populate("espaciosDisponibles")
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;
  } catch (err) {
    console.log("[Error Redis] fallback a Mongo sin cache", err);
    return await ServicioAdicional.find(filtros)
      .populate("proveedorId", "nombre contacto")
      .populate("espaciosDisponibles")
      .skip(skip)
      .limit(limit)
      .lean();
  }
};
const findServicioAdicionalById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getServiciosAdicionalesRedisKey(id);
  
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
    
    const result = await ServicioAdicional.findById(id)
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
    
    if (result) {
      await redisClient.set(key, result, { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    return await ServicioAdicional.findById(id)
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
  }
};

const findServiciosAdicionales = async (filtros = {}) => {
  try {
    const ServicioAdicional = require("../models/servicioAdicional.model");
    
    const servicios = await ServicioAdicional.find(filtros)
      .populate('proveedorId', 'nombre email')
      .lean();
    
    return servicios;
  } catch (error) {
    console.error('Error en findServiciosAdicionales:', error);
    throw error;
  }
};

const getServiciosByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByTipoRedisKey(tipo);
  
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
    
    const result = await ServicioAdicional.find({ tipo, activo: true })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ServicioAdicional.find({ tipo, activo: true })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
  }
};

const getServiciosByProveedor = async (proveedorId) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByProveedorRedisKey(proveedorId);
  
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
    
    const result = await ServicioAdicional.find({ proveedorId, activo: true })
      .populate('espaciosDisponibles')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ServicioAdicional.find({ proveedorId, activo: true })
      .populate('espaciosDisponibles')
      .lean();
  }
};

const getServiciosByEspacio = async (espacioId) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByEspacioRedisKey(espacioId);
  
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
    
    const result = await ServicioAdicional.find({ 
      espaciosDisponibles: espacioId,
      activo: true
    })
      .populate('proveedorId', 'nombre contacto')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ServicioAdicional.find({ 
      espaciosDisponibles: espacioId,
      activo: true
    })
      .populate('proveedorId', 'nombre contacto')
      .lean();
  }
};

const getServiciosByRangoPrecio = async (precioMin, precioMax) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByRangoPrecioRedisKey(precioMin, precioMax);
  
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
    
    const result = await ServicioAdicional.find({
      precio: { $gte: precioMin, $lte: precioMax },
      activo: true
    })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ServicioAdicional.find({
      precio: { $gte: precioMin, $lte: precioMax },
      activo: true
    })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
  }
};

const getServiciosByUnidadPrecio = async (unidadPrecio) => {
  const redisClient = connectToRedis();
  const key = _getServiciosByUnidadPrecioRedisKey(unidadPrecio);
  
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
    
    const result = await ServicioAdicional.find({ unidadPrecio, activo: true })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ServicioAdicional.find({ unidadPrecio, activo: true })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
  }
};

const getServiciosDisponiblesEnFecha = async (fecha, diaDeSemanaNombre) => {
  const redisClient = connectToRedis();
  const key = _getServiciosDisponiblesEnFechaRedisKey(fecha, diaDeSemanaNombre);
  
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
    
    const result = await ServicioAdicional.find({
      'disponibilidad.diasDisponibles': diaDeSemanaNombre,
      activo: true
    })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ServicioAdicional.find({
      'disponibilidad.diasDisponibles': diaDeSemanaNombre,
      activo: true
    })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
  }
};

const getServiciosConAprobacion = async () => {
  const redisClient = connectToRedis();
  const key = _getServiciosConAprobacionRedisKey();
  
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
    
    const result = await ServicioAdicional.find({ 
      requiereAprobacion: true,
      activo: true
    })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await ServicioAdicional.find({ 
      requiereAprobacion: true,
      activo: true
    })
      .populate('proveedorId', 'nombre contacto')
      .populate('espaciosDisponibles')
      .lean();
  }
};

const createServicioAdicional = async (servicioData) => {
  const redisClient = connectToRedis();
  const newServicio = new ServicioAdicional(servicioData);
  const saved = await newServicio.save();
  
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
  
  if (servicio.requiereAprobacion !== updated.requiereAprobacion) {
    await redisClient.del(_getServiciosConAprobacionRedisKey());
  }
  
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
  
  await redisClient.del(_getServiciosAdicionalesRedisKey(id));
  await redisClient.del(_getServiciosByEspacioRedisKey(espacioId.toString()));
  
  return updated;
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
  getServiciosConAprobacion,
  findServiciosAdicionales
};