const Oficina = require("../models/oficina.model");
const connectToRedis = require("../services/redis.service");

const _getOficinaRedisKey = (id) => `id:${id}-oficina`;
const _getOficinasFilterRedisKey = (filtros, skip, limit) =>
  `oficinas:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getOficinaByCodigoRedisKey = (codigo) => `oficina:codigo:${codigo}`;
const _getOficinasByEdificioRedisKey = (edificioId) => `edificio:${edificioId}-oficinas`;
const _getOficinasByTipoRedisKey = (tipo) => `oficinas:tipo:${tipo}`;
const _getOficinasByUsuarioRedisKey = (usuarioId) => `usuario:${usuarioId}-oficinas`;
const _getOficinasByEmpresaRedisKey = (empresaId) => `empresa:${empresaId}-oficinas`;
const _getOficinasByCapacidadRedisKey = (capacidadMinima) => `oficinas:capacidad-min:${capacidadMinima}`;
const _getOficinasByRangoPrecioRedisKey = (precioMin, precioMax, tipoPrecio) => `oficinas:precio:${tipoPrecio}:${precioMin}-${precioMax}`;
const _getOficinasDisponiblesRedisKey = (fecha, horaInicio, horaFin) => `oficinas:disponibles:${fecha}:${horaInicio}-${horaFin}`;

const getOficinas = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getOficinasFilterRedisKey(filtros, skip, limit);

  try {
    if (await redisClient.exists(key)) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try { return JSON.parse(cached); }
        catch {}
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getOficinas con skip/limit");
    const result = await Oficina.find(filtros)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email")
      .populate("empresaInmobiliariaId", "nombre")
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (err) {
    console.log("[Error Redis] fallback a Mongo sin cache", err);
    return await Oficina.find(filtros)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email")
      .populate("empresaInmobiliariaId", "nombre")
      .skip(skip)
      .limit(limit)
      .lean();
  }
};

const findOficinaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getOficinaRedisKey(id);
  
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
    
    const result = await Oficina.findById(id)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    if (result) {
      await redisClient.set(key, result, { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    return await Oficina.findById(id)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const findOficinaByCodigo = async (codigo) => {
  const redisClient = connectToRedis();
  const key = _getOficinaByCodigoRedisKey(codigo);
  
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
    
    const result = await Oficina.findOne({ codigo })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    if (result) {
      await redisClient.set(key, result, { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    return await Oficina.findOne({ codigo })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getOficinasByEdificio = async (edificioId) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByEdificioRedisKey(edificioId);
  
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
    
    const result = await Oficina.find({ 'ubicacion.edificioId': edificioId })
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Oficina.find({ 'ubicacion.edificioId': edificioId })
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getOficinasByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByTipoRedisKey(tipo);
  
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
    
    const result = await Oficina.find({ tipo })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Oficina.find({ tipo })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getOficinasByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByUsuarioRedisKey(usuarioId);
  
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
    
    const result = await Oficina.find({ usuarioId })
      .populate('ubicacion.edificioId')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Oficina.find({ usuarioId })
      .populate('ubicacion.edificioId')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getOficinasByEmpresa = async (empresaInmobiliariaId) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByEmpresaRedisKey(empresaInmobiliariaId);
  
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
    
    const result = await Oficina.find({ empresaInmobiliariaId })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Oficina.find({ empresaInmobiliariaId })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .lean();
  }
};

const getOficinasByCapacidad = async (capacidadMinima) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByCapacidadRedisKey(capacidadMinima);
  
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
    
    const result = await Oficina.find({ capacidad: { $gte: capacidadMinima } })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Oficina.find({ capacidad: { $gte: capacidadMinima } })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getOficinasByRangoPrecio = async (precioMin, precioMax, tipoPrecio = 'porDia') => {
  const redisClient = connectToRedis();
  const key = _getOficinasByRangoPrecioRedisKey(precioMin, precioMax, tipoPrecio);
  
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
    
    const query = {};
    query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };
    
    const result = await Oficina.find(query)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    const query = {};
    query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };
    
    return await Oficina.find(query)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getOficinasDisponibles = async (fecha, horaInicio, horaFin) => {
  const redisClient = connectToRedis();
  const key = _getOficinasDisponiblesRedisKey(fecha || "todas", horaInicio || "todas", horaFin || "todas");
  
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
    
    const diasMap = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado"
    ];

    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      throw new Error(`Fecha inválida: ${fecha}`);
    }
    const diaNombre = diasMap[fechaObj.getUTCDay()];

    const result = await Oficina.find({
      activo: true,
      "disponibilidad.dias": diaNombre,
      "disponibilidad.horario.apertura": { $lte: horaInicio },
      "disponibilidad.horario.cierre":    { $gte: horaFin }
    })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    const diasMap = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado"
    ];

    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      throw new Error(`Fecha inválida: ${fecha}`);
    }
    const diaNombre = diasMap[fechaObj.getUTCDay()];

    return await Oficina.find({
      activo: true,
      "disponibilidad.dias": diaNombre,
      "disponibilidad.horario.apertura": { $lte: horaInicio },
      "disponibilidad.horario.cierre":    { $gte: horaFin }
    })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const createOficina = async (oficinaData) => {
  const redisClient = connectToRedis();
  const newOficina = new Oficina(oficinaData);
  const saved = await newOficina.save();
  
  try {
    const allOficinaKeys = await redisClient.keys("oficinas:*");
    if (allOficinaKeys.length > 0) {
      await redisClient.del(...allOficinaKeys);
    }

    if (saved.codigo) {
      await redisClient.del(_getOficinaByCodigoRedisKey(saved.codigo));
    }
    if (saved.ubicacion && saved.ubicacion.edificioId) {
      await redisClient.del(_getOficinasByEdificioRedisKey(saved.ubicacion.edificioId.toString()));
    }
    if (saved.tipo) {
      await redisClient.del(_getOficinasByTipoRedisKey(saved.tipo));
    }
    if (saved.usuarioId) {
      await redisClient.del(_getOficinasByUsuarioRedisKey(saved.usuarioId.toString()));
    }
    if (saved.empresaInmobiliariaId) {
      await redisClient.del(_getOficinasByEmpresaRedisKey(saved.empresaInmobiliariaId.toString()));
    }
    if (saved.capacidad) {
      for (let i = 1; i <= saved.capacidad; i++) {
        await redisClient.del(_getOficinasByCapacidadRedisKey(i));
      }
    }

    console.log("✅ Cache invalidated successfully after creating oficina");
  } catch (cacheError) {
    console.error("❌ Error invalidating cache:", cacheError);
  }
  
  return saved;
};

const updateOficina = async (id, payload) => {
  const redisClient = connectToRedis();
  const oficina = await Oficina.findById(id);
  const updated = await Oficina.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getOficinaRedisKey(id));
  await redisClient.del(_getOficinasFilterRedisKey({}));
  
  if (oficina.codigo) {
    await redisClient.del(_getOficinaByCodigoRedisKey(oficina.codigo));
  }
  if (updated.codigo && oficina.codigo !== updated.codigo) {
    await redisClient.del(_getOficinaByCodigoRedisKey(updated.codigo));
  }
  
  if (oficina.ubicacion && oficina.ubicacion.edificioId) {
    await redisClient.del(_getOficinasByEdificioRedisKey(oficina.ubicacion.edificioId.toString()));
  }
  if (updated.ubicacion && updated.ubicacion.edificioId && 
      (!oficina.ubicacion || !oficina.ubicacion.edificioId || 
       oficina.ubicacion.edificioId.toString() !== updated.ubicacion.edificioId.toString())) {
    await redisClient.del(_getOficinasByEdificioRedisKey(updated.ubicacion.edificioId.toString()));
  }
  
  if (oficina.tipo) {
    await redisClient.del(_getOficinasByTipoRedisKey(oficina.tipo));
  }
  if (updated.tipo && oficina.tipo !== updated.tipo) {
    await redisClient.del(_getOficinasByTipoRedisKey(updated.tipo));
  }
  
  if (oficina.usuarioId) {
    await redisClient.del(_getOficinasByUsuarioRedisKey(oficina.usuarioId.toString()));
  }
  if (updated.usuarioId && (!oficina.usuarioId || 
      oficina.usuarioId.toString() !== updated.usuarioId.toString())) {
    await redisClient.del(_getOficinasByUsuarioRedisKey(updated.usuarioId.toString()));
  }
  
  if (oficina.empresaInmobiliariaId) {
    await redisClient.del(_getOficinasByEmpresaRedisKey(oficina.empresaInmobiliariaId.toString()));
  }
  if (updated.empresaInmobiliariaId && (!oficina.empresaInmobiliariaId || 
      oficina.empresaInmobiliariaId.toString() !== updated.empresaInmobiliariaId.toString())) {
    await redisClient.del(_getOficinasByEmpresaRedisKey(updated.empresaInmobiliariaId.toString()));
  }
  
  if (oficina.capacidad !== updated.capacidad) {
    const maxCapacidad = Math.max(oficina.capacidad || 0, updated.capacidad || 0);
    for (let i = 1; i <= maxCapacidad; i++) {
      await redisClient.del(_getOficinasByCapacidadRedisKey(i));
    }
  }
  
  if (payload.precios) {
    await redisClient.keys('oficinas:precio:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  if (payload.disponibilidad || payload.estado) {
    await redisClient.keys('oficinas:disponibles:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

const deleteOficina = async (id) => {
  const redisClient = connectToRedis();
  const oficina = await Oficina.findById(id);
  const removed = await Oficina.findByIdAndDelete(id);
  
  await redisClient.del(_getOficinaRedisKey(id));
  await redisClient.del(_getOficinasFilterRedisKey({}));
  
  if (oficina.codigo) {
    await redisClient.del(_getOficinaByCodigoRedisKey(oficina.codigo));
  }
  if (oficina.ubicacion && oficina.ubicacion.edificioId) {
    await redisClient.del(_getOficinasByEdificioRedisKey(oficina.ubicacion.edificioId.toString()));
  }
  if (oficina.tipo) {
    await redisClient.del(_getOficinasByTipoRedisKey(oficina.tipo));
  }
  if (oficina.usuarioId) {
    await redisClient.del(_getOficinasByUsuarioRedisKey(oficina.usuarioId.toString()));
  }
  if (oficina.empresaInmobiliariaId) {
    await redisClient.del(_getOficinasByEmpresaRedisKey(oficina.empresaInmobiliariaId.toString()));
  }
  
  if (oficina.capacidad) {
    for (let i = 1; i <= oficina.capacidad; i++) {
      await redisClient.del(_getOficinasByCapacidadRedisKey(i));
    }
  }
  
  await redisClient.keys('oficinas:disponibles:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return removed;
};

const cambiarEstadoOficina = async (id, nuevoEstado) => {
  const redisClient = connectToRedis();
  const updated = await Oficina.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
  
  await redisClient.del(_getOficinaRedisKey(id));
  
  await redisClient.keys('oficinas:disponibles:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  const redisClient = connectToRedis();
  const updated = await Oficina.findByIdAndUpdate(
    id,
    { calificacionPromedio: nuevaCalificacion },
    { new: true }
  );
  
  await redisClient.del(_getOficinaRedisKey(id));
  
  return updated;
};

module.exports = {
  getOficinas,
  findOficinaById,
  findOficinaByCodigo,
  getOficinasByEdificio,
  getOficinasByTipo,
  getOficinasByUsuario,
  getOficinasByEmpresa,
  createOficina,
  updateOficina,
  deleteOficina,
  cambiarEstadoOficina,
  getOficinasByCapacidad,
  getOficinasByRangoPrecio,
  getOficinasDisponibles,
  actualizarCalificacion
};