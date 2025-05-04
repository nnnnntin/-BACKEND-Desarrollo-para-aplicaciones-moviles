const Espacio = require("../models/espacio.model");
const connectToRedis = require("../services/redis.service");

const _getEspacioRedisKey = (id) => `id:${id}-espacio`;
const _getEspaciosFilterRedisKey = (filtros) => `espacios:${JSON.stringify(filtros)}`;
const _getEspaciosByEdificioRedisKey = (edificioId) => `edificio:${edificioId}-espacios`;
const _getEspaciosByTipoRedisKey = (tipo) => `espacios:tipo:${tipo}`;
const _getEspaciosByPropietarioRedisKey = (propietarioId) => `propietario:${propietarioId}-espacios`;
const _getEspaciosByEmpresaRedisKey = (empresaId) => `empresa:${empresaId}-espacios`;
const _getEspaciosDisponiblesRedisKey = (tipo, fecha, horaInicio, horaFin) => `espacios:disponibles:${tipo}:${fecha}:${horaInicio}-${horaFin}`;
const _getEspaciosByAmenidadesRedisKey = (amenidades) => `espacios:amenidades:${JSON.stringify(amenidades)}`;

const getEspacios = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosFilterRedisKey(filtros);
  
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
    
    console.log("[Leyendo getEspacios desde MongoDB]");
    const result = await Espacio.find(filtros)
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find(filtros)
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const findEspacioById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getEspacioRedisKey(id);
  
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
    
    console.log("[Leyendo findEspacioById desde MongoDB]");
    const result = await Espacio.findById(id)
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.findById(id)
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getEspaciosByEdificio = async (edificioId) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByEdificioRedisKey(edificioId);
  
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
    
    console.log("[Leyendo getEspaciosByEdificio desde MongoDB]");
    const result = await Espacio.find({ 'ubicacion.edificioId': edificioId })
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ 'ubicacion.edificioId': edificioId })
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getEspaciosByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByTipoRedisKey(tipo);
  
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
    
    console.log("[Leyendo getEspaciosByTipo desde MongoDB]");
    const result = await Espacio.find({ tipo })
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ tipo })
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getEspaciosByPropietario = async (propietarioId) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByPropietarioRedisKey(propietarioId);
  
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
    
    console.log("[Leyendo getEspaciosByPropietario desde MongoDB]");
    const result = await Espacio.find({ propietarioId })
      .populate('ubicacion.edificioId')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ propietarioId })
      .populate('ubicacion.edificioId')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getEspaciosByEmpresa = async (empresaInmobiliariaId) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByEmpresaRedisKey(empresaInmobiliariaId);
  
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
    
    console.log("[Leyendo getEspaciosByEmpresa desde MongoDB]");
    const result = await Espacio.find({ empresaInmobiliariaId })
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ empresaInmobiliariaId })
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .lean();
  }
};

const createEspacio = async (espacioData) => {
  const redisClient = connectToRedis();
  const newEspacio = new Espacio(espacioData);
  const saved = await newEspacio.save();
  
  await redisClient.del(_getEspaciosFilterRedisKey({}));
  if (saved.ubicacion && saved.ubicacion.edificioId) {
    await redisClient.del(_getEspaciosByEdificioRedisKey(saved.ubicacion.edificioId.toString()));
  }
  if (saved.tipo) {
    await redisClient.del(_getEspaciosByTipoRedisKey(saved.tipo));
  }
  if (saved.propietarioId) {
    await redisClient.del(_getEspaciosByPropietarioRedisKey(saved.propietarioId.toString()));
  }
  if (saved.empresaInmobiliariaId) {
    await redisClient.del(_getEspaciosByEmpresaRedisKey(saved.empresaInmobiliariaId.toString()));
  }
  
  return saved;
};

const updateEspacio = async (id, payload) => {
  const redisClient = connectToRedis();
  const espacio = await Espacio.findById(id);
  const updated = await Espacio.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getEspacioRedisKey(id));
  await redisClient.del(_getEspaciosFilterRedisKey({}));
  
  if (espacio.ubicacion && espacio.ubicacion.edificioId) {
    await redisClient.del(_getEspaciosByEdificioRedisKey(espacio.ubicacion.edificioId.toString()));
  }
  if (updated.ubicacion && updated.ubicacion.edificioId && 
      (!espacio.ubicacion || !espacio.ubicacion.edificioId || 
       espacio.ubicacion.edificioId.toString() !== updated.ubicacion.edificioId.toString())) {
    await redisClient.del(_getEspaciosByEdificioRedisKey(updated.ubicacion.edificioId.toString()));
  }
  
  if (espacio.tipo) {
    await redisClient.del(_getEspaciosByTipoRedisKey(espacio.tipo));
  }
  if (updated.tipo && espacio.tipo !== updated.tipo) {
    await redisClient.del(_getEspaciosByTipoRedisKey(updated.tipo));
  }
  
  if (espacio.propietarioId) {
    await redisClient.del(_getEspaciosByPropietarioRedisKey(espacio.propietarioId.toString()));
  }
  if (updated.propietarioId && (!espacio.propietarioId || 
      espacio.propietarioId.toString() !== updated.propietarioId.toString())) {
    await redisClient.del(_getEspaciosByPropietarioRedisKey(updated.propietarioId.toString()));
  }
  
  if (espacio.empresaInmobiliariaId) {
    await redisClient.del(_getEspaciosByEmpresaRedisKey(espacio.empresaInmobiliariaId.toString()));
  }
  if (updated.empresaInmobiliariaId && (!espacio.empresaInmobiliariaId || 
      espacio.empresaInmobiliariaId.toString() !== updated.empresaInmobiliariaId.toString())) {
    await redisClient.del(_getEspaciosByEmpresaRedisKey(updated.empresaInmobiliariaId.toString()));
  }
  
  await redisClient.keys('espacios:disponibles:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  if (payload.amenidades) {
    await redisClient.keys('espacios:amenidades:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

const deleteEspacio = async (id) => {
  const redisClient = connectToRedis();
  const espacio = await Espacio.findById(id);
  const removed = await Espacio.findByIdAndDelete(id);
  
  await redisClient.del(_getEspacioRedisKey(id));
  await redisClient.del(_getEspaciosFilterRedisKey({}));
  
  if (espacio.ubicacion && espacio.ubicacion.edificioId) {
    await redisClient.del(_getEspaciosByEdificioRedisKey(espacio.ubicacion.edificioId.toString()));
  }
  if (espacio.tipo) {
    await redisClient.del(_getEspaciosByTipoRedisKey(espacio.tipo));
  }
  if (espacio.propietarioId) {
    await redisClient.del(_getEspaciosByPropietarioRedisKey(espacio.propietarioId.toString()));
  }
  if (espacio.empresaInmobiliariaId) {
    await redisClient.del(_getEspaciosByEmpresaRedisKey(espacio.empresaInmobiliariaId.toString()));
  }
  
  await redisClient.keys('espacios:disponibles:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  await redisClient.keys('espacios:amenidades:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return removed;
};

const cambiarEstadoEspacio = async (id, nuevoEstado) => {
  const redisClient = connectToRedis();
  const updated = await Espacio.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
  
  await redisClient.del(_getEspacioRedisKey(id));
  
  await redisClient.keys('espacios:disponibles:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const getEspaciosDisponibles = async (tipo, fecha, horaInicio, horaFin) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosDisponiblesRedisKey(tipo, fecha || "todas", horaInicio || "todas", horaFin || "todas");
  
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
    
    console.log("[Leyendo getEspaciosDisponibles desde MongoDB]");
    const filtrosBase = {
      tipo,
      estado: 'disponible',
      activo: true
    };
    
    const result = await Espacio.find(filtrosBase)
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    const filtrosBase = {
      tipo,
      estado: 'disponible',
      activo: true
    };
    
    return await Espacio.find(filtrosBase)
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getEspaciosByAmenidades = async (amenidades) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByAmenidadesRedisKey(amenidades);
  
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
    
    console.log("[Leyendo getEspaciosByAmenidades desde MongoDB]");
    const result = await Espacio.find({ amenidades: { $all: amenidades } })
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ amenidades: { $all: amenidades } })
      .populate('ubicacion.edificioId')
      .populate('propietarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

module.exports = {
  getEspacios,
  findEspacioById,
  getEspaciosByEdificio,
  getEspaciosByTipo,
  getEspaciosByPropietario,
  getEspaciosByEmpresa,
  createEspacio,
  updateEspacio,
  deleteEspacio,
  cambiarEstadoEspacio,
  getEspaciosDisponibles,
  getEspaciosByAmenidades
};