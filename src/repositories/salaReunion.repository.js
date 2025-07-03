const SalaReunion = require("../models/salaReunion.model");
const Usuario = require("../models/usuario.model");
const Edificio = require("../models/edificio.model");
const connectToRedis = require("../services/redis.service");

const _getSalasReunionRedisKey = (id) => `id:${id}-salasReunion`;
const _getSalasReunionFilterRedisKey = (filtros, skip, limit) =>
  `salasReunion:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getSalaReunionByCodigoRedisKey = (codigo) => `salaReunion:codigo:${codigo}`;
const _getSalasByEdificioRedisKey = (edificioId) => `edificio:${edificioId}-salasReunion`;
const _getSalasByCapacidadRedisKey = (capacidadMinima) => `salasReunion:capacidad-min:${capacidadMinima}`;
const _getSalasByConfiguracionRedisKey = (configuracion) => `salasReunion:configuracion:${configuracion}`;
const _getSalasByEquipamientoRedisKey = (tipoEquipamiento) => `salasReunion:equipamiento:${tipoEquipamiento}`;
const _getSalasByUsuarioRedisKey = (usuarioId) => `usuario:${usuarioId}-salasReunion`;
const _getSalasByRangoPrecioRedisKey = (precioMin, precioMax, tipoPrecio) => `salasReunion:precio:${tipoPrecio}:${precioMin}-${precioMax}`;
const _getSalasDisponiblesRedisKey = (fecha, horaInicio, horaFin) => `salasReunion:disponibles:${fecha}:${horaInicio}-${horaFin}`;
const _getSalasByProximidadRedisKey = (lat, lng, radioKm) => `salasReunion:proximidad:${lat}:${lng}:${radioKm}`;
const _getSalasByCiudadRedisKey = (ciudad) => `salasReunion:ciudad:${ciudad}`;
const _getSalasByDepartamentoRedisKey = (departamento) => `salasReunion:departamento:${departamento}`;
const _getSalasByPaisRedisKey = (pais) => `salasReunion:pais:${pais}`;

const getSalasReunion = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getSalasReunionFilterRedisKey(filtros, skip, limit);

  try {
    if (await redisClient.exists(key)) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try { return JSON.parse(cached); } catch {}
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getSalasReunion con skip/limit");
    const result = await SalaReunion.find(filtros)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (err) {
    console.log("[Error Redis] fallback a Mongo sin cache", err);
    return await SalaReunion.find(filtros)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .skip(skip)
      .limit(limit)
      .lean();
  }
};

const findSalaReunionById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getSalasReunionRedisKey(id);
  
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
    
    const result = await SalaReunion.findById(id)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    if (result) {
      await redisClient.set(key, result, { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    return await SalaReunion.findById(id)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const findSalaReunionByCodigo = async (codigo) => {
  const redisClient = connectToRedis();
  const key = _getSalaReunionByCodigoRedisKey(codigo);
  
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
    
    const result = await SalaReunion.findOne({ codigo })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    if (result) {
      await redisClient.set(key, result, { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    return await SalaReunion.findOne({ codigo })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getSalasByEdificio = async (edificioId) => {
  const redisClient = connectToRedis();
  const key = _getSalasByEdificioRedisKey(edificioId);
  
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
    
    const result = await SalaReunion.find({ 'ubicacion.edificioId': edificioId })
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await SalaReunion.find({ 'ubicacion.edificioId': edificioId })
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getSalasByCapacidad = async (capacidadMinima) => {
  const redisClient = connectToRedis();
  const key = _getSalasByCapacidadRedisKey(capacidadMinima);
  
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
    
    const result = await SalaReunion.find({ capacidad: { $gte: capacidadMinima } })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await SalaReunion.find({ capacidad: { $gte: capacidadMinima } })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getSalasByConfiguracion = async (configuracion) => {
  const redisClient = connectToRedis();
  const key = _getSalasByConfiguracionRedisKey(configuracion);
  
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
    
    const result = await SalaReunion.find({ configuracion })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await SalaReunion.find({ configuracion })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getSalasByEquipamiento = async (tipoEquipamiento) => {
  const redisClient = connectToRedis();
  const key = _getSalasByEquipamientoRedisKey(tipoEquipamiento);
  
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
    
    const result = await SalaReunion.find({ 'equipamiento.tipo': tipoEquipamiento })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await SalaReunion.find({ 'equipamiento.tipo': tipoEquipamiento })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getSalasByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getSalasByUsuarioRedisKey(usuarioId);
  
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
    
    const result = await SalaReunion.find({ usuarioId })
      .populate('ubicacion.edificioId')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await SalaReunion.find({ usuarioId })
      .populate('ubicacion.edificioId')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getSalasByRangoPrecio = async (precioMin, precioMax, tipoPrecio = 'porHora') => {
  const redisClient = connectToRedis();
  const key = _getSalasByRangoPrecioRedisKey(precioMin, precioMax, tipoPrecio);
  
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
    
    const result = await SalaReunion.find(query)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    const query = {};
    query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };
    
    return await SalaReunion.find(query)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getSalasDisponibles = async (fecha, horaInicio, horaFin) => {
  const redisClient = connectToRedis();
  const key = _getSalasDisponiblesRedisKey(fecha || "todas", horaInicio || "todas", horaFin || "todas");
  
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
    
    const filtrosBase = {
      estado: 'disponible',
      activo: true
    };
    
    const result = await SalaReunion.find(filtrosBase)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    const filtrosBase = {
      estado: 'disponible',
      activo: true
    };
    
    return await SalaReunion.find(filtrosBase)
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getSalasByProximidad = async (lat, lng, radioKm = 10) => {
  const redisClient = connectToRedis();
  const key = _getSalasByProximidadRedisKey(lat, lng, radioKm);
  
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
    
    const result = await SalaReunion.find({
      "ubicacion.coordenadas": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: radioKm * 1000
        }
      },
      activo: true
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
    
    await redisClient.set(key, result, { ex: 1800 });
    
    return result;
  } catch (error) {
    console.log("[Error en búsqueda geoespacial]", error);
    return await SalaReunion.find({ activo: true })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getSalasByCiudad = async (ciudad) => {
  const redisClient = connectToRedis();
  const key = _getSalasByCiudadRedisKey(ciudad);
  
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
    
    const result = await SalaReunion.find({ 
      'ubicacion.direccionCompleta.ciudad': ciudad,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await SalaReunion.find({ 
      'ubicacion.direccionCompleta.ciudad': ciudad,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
  }
};

const getSalasByDepartamento = async (departamento) => {
  const redisClient = connectToRedis();
  const key = _getSalasByDepartamentoRedisKey(departamento);
  
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
    
    const result = await SalaReunion.find({ 
      'ubicacion.direccionCompleta.departamento': departamento,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await SalaReunion.find({ 
      'ubicacion.direccionCompleta.departamento': departamento,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
  }
};

const createSalaReunion = async (salaData) => {
  const redisClient = connectToRedis();
  
  if (!salaData.usuarioId) {
    throw new Error("usuarioId es obligatorio");
  }
  
  const usuarioExiste = await Usuario.exists({ _id: salaData.usuarioId });
  if (!usuarioExiste) {
    throw new Error("Usuario no encontrado");
  }
  
  if (!salaData.ubicacion?.coordenadas?.lat || !salaData.ubicacion?.coordenadas?.lng) {
    throw new Error("Coordenadas (lat, lng) son obligatorias");
  }
  
  if (!salaData.ubicacion?.direccionCompleta) {
    throw new Error("Dirección completa es obligatoria");
  }
  
  if (salaData.ubicacion?.edificioId) {
    const edificioExiste = await Edificio.exists({ _id: salaData.ubicacion.edificioId });
    if (!edificioExiste) {
      throw new Error("Edificio no encontrado");
    }
  }
  
  const newSala = new SalaReunion(salaData);
  const saved = await newSala.save();
  
  try {
    const allSalaKeys = await redisClient.keys("salasReunion:*");
    if (allSalaKeys.length > 0) {
      await redisClient.del(...allSalaKeys);
    }

    if (saved.codigo) {
      await redisClient.del(_getSalaReunionByCodigoRedisKey(saved.codigo));
    }
    if (saved.ubicacion?.edificioId) {
      await redisClient.del(_getSalasByEdificioRedisKey(saved.ubicacion.edificioId.toString()));
    }
    if (saved.usuarioId) {
      await redisClient.del(_getSalasByUsuarioRedisKey(saved.usuarioId.toString()));
    }
    if (saved.ubicacion?.direccionCompleta?.ciudad) {
      await redisClient.del(_getSalasByCiudadRedisKey(saved.ubicacion.direccionCompleta.ciudad));
    }
    if (saved.ubicacion?.direccionCompleta?.departamento) {
      await redisClient.del(_getSalasByDepartamentoRedisKey(saved.ubicacion.direccionCompleta.departamento));
    }

    console.log("✅ Cache invalidated successfully after creating sala de reunión");
  } catch (cacheError) {
    console.error("❌ Error invalidating cache:", cacheError);
  }
  
  return saved;
};

const updateSalaReunion = async (id, payload) => {
  const redisClient = connectToRedis();
  const sala = await SalaReunion.findById(id);
  
  if (!sala) {
    throw new Error("Sala de reunión no encontrada");
  }
  
  if (payload.usuarioId && payload.usuarioId !== sala.usuarioId?.toString()) {
    const usuarioExiste = await Usuario.exists({ _id: payload.usuarioId });
    if (!usuarioExiste) {
      throw new Error("Nuevo usuario no encontrado");
    }
  }
  
  const updated = await SalaReunion.findByIdAndUpdate(id, payload, { new: true })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre');
  
  await redisClient.del(_getSalasReunionRedisKey(id));
  await redisClient.del(_getSalasReunionFilterRedisKey({}));
  
  if (sala.usuarioId) {
    await redisClient.del(_getSalasByUsuarioRedisKey(sala.usuarioId.toString()));
  }
  if (updated.usuarioId && sala.usuarioId?.toString() !== updated.usuarioId.toString()) {
    await redisClient.del(_getSalasByUsuarioRedisKey(updated.usuarioId.toString()));
  }
  
  if (payload.ubicacion?.direccionCompleta) {
    if (sala.ubicacion?.direccionCompleta?.ciudad !== payload.ubicacion.direccionCompleta.ciudad) {
      await redisClient.del(_getSalasByCiudadRedisKey(sala.ubicacion?.direccionCompleta?.ciudad));
      await redisClient.del(_getSalasByCiudadRedisKey(payload.ubicacion.direccionCompleta.ciudad));
    }
    if (sala.ubicacion?.direccionCompleta?.departamento !== payload.ubicacion.direccionCompleta.departamento) {
      await redisClient.del(_getSalasByDepartamentoRedisKey(sala.ubicacion?.direccionCompleta?.departamento));
      await redisClient.del(_getSalasByDepartamentoRedisKey(payload.ubicacion.direccionCompleta.departamento));
    }
  }
  
  await redisClient.keys('salasReunion:proximidad:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const deleteSalaReunion = async (id) => {
  const redisClient = connectToRedis();
  const sala = await SalaReunion.findById(id);
  const removed = await SalaReunion.findByIdAndDelete(id);
  
  await redisClient.del(_getSalasReunionRedisKey(id));
  await redisClient.del(_getSalasReunionFilterRedisKey({}));
  
  if (sala.codigo) {
    await redisClient.del(_getSalaReunionByCodigoRedisKey(sala.codigo));
  }
  
  if (sala.ubicacion && sala.ubicacion.edificioId) {
    await redisClient.del(_getSalasByEdificioRedisKey(sala.ubicacion.edificioId.toString()));
  }
  
  if (sala.usuarioId) {
    await redisClient.del(_getSalasByUsuarioRedisKey(sala.usuarioId.toString()));
  }
  
  return removed;
};

const cambiarEstadoSala = async (id, nuevoEstado) => {
  const redisClient = connectToRedis();
  const updated = await SalaReunion.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
  
  await redisClient.del(_getSalasReunionRedisKey(id));
  await redisClient.del(_getSalasReunionFilterRedisKey({}));
  await redisClient.del(_getSalasDisponiblesRedisKey("todas", "todas", "todas"));
  
  return updated;
};

const agregarEquipamiento = async (id, equipamiento) => {
  const redisClient = connectToRedis();
  const updated = await SalaReunion.findByIdAndUpdate(
    id,
    { $push: { equipamiento } },
    { new: true }
  );
  
  await redisClient.del(_getSalasReunionRedisKey(id));
  await redisClient.del(_getSalasReunionFilterRedisKey({}));
  await redisClient.del(_getSalasByEquipamientoRedisKey(equipamiento.tipo));
  
  return updated;
};

const eliminarEquipamiento = async (id, equipamientoId) => {
  const redisClient = connectToRedis();
  const sala = await SalaReunion.findById(id);
  const equipamientoAEliminar = sala.equipamiento.find(eq => eq._id.toString() === equipamientoId);
  
  const updated = await SalaReunion.findByIdAndUpdate(
    id,
    { $pull: { equipamiento: { _id: equipamientoId } } },
    { new: true }
  );
  
  await redisClient.del(_getSalasReunionRedisKey(id));
  await redisClient.del(_getSalasReunionFilterRedisKey({}));
  if (equipamientoAEliminar) {
    await redisClient.del(_getSalasByEquipamientoRedisKey(equipamientoAEliminar.tipo));
  }
  
  return updated;
};

const actualizarPrecios = async (id, precios) => {
  const redisClient = connectToRedis();
  const updated = await SalaReunion.findByIdAndUpdate(
    id,
    { precios },
    { new: true }
  );
  
  await redisClient.del(_getSalasReunionRedisKey(id));
  await redisClient.del(_getSalasReunionFilterRedisKey({}));
  
  for (const tipoPrecio in precios) {
    await redisClient.keys(`salasReunion:precio:${tipoPrecio}:*`).then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

module.exports = {
  getSalasReunion,
  findSalaReunionById,
  findSalaReunionByCodigo,
  getSalasByEdificio,
  getSalasByCapacidad,
  getSalasByConfiguracion,
  getSalasByEquipamiento,
  getSalasByUsuario,
  getSalasByRangoPrecio,
  getSalasDisponibles,
  getSalasByProximidad,
  getSalasByCiudad,
  getSalasByDepartamento,
  createSalaReunion,
  updateSalaReunion,
  deleteSalaReunion,
  cambiarEstadoSala,
  agregarEquipamiento,
  eliminarEquipamiento,
  actualizarPrecios
};