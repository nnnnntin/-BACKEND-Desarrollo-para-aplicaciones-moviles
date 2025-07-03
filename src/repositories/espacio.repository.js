const Espacio = require("../models/espacio.model");
const Edificio = require("../models/edificio.model");
const EmpresaInmobiliaria = require("../models/empresaInmobiliaria.model");
const Usuario = require("../models/usuario.model");
const connectToRedis = require("../services/redis.service");

const _getEspacioRedisKey = (id) => `id:${id}-espacio`;
const _getEspaciosFilterRedisKey = (filtros, skip, limit) =>
  `espacios:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getEspaciosByEdificioRedisKey = (edificioId) =>
  `edificio:${edificioId}-espacios`;
const _getEspaciosByTipoRedisKey = (tipo) => `espacios:tipo:${tipo}`;
const _getEspaciosByUsuarioRedisKey = (usuarioId) =>
  `usuario:${usuarioId}-espacios`;
const _getEspaciosByEmpresaRedisKey = (empresaId) =>
  `empresa:${empresaId}-espacios`;
const _getEspaciosDisponiblesRedisKey = (tipo, fecha, horaInicio, horaFin) =>
  `espacios:disponibles:${tipo}:${fecha}:${horaInicio}-${horaFin}`;
const _getEspaciosByAmenidadesRedisKey = (amenidades) =>
  `espacios:amenidades:${JSON.stringify(amenidades)}`;
const _getEspaciosByProximidadRedisKey = (lat, lng, radioKm) => `espacios:proximidad:${lat}:${lng}:${radioKm}`;
const _getEspaciosByCiudadRedisKey = (ciudad) => `espacios:ciudad:${ciudad}`;
const _getEspaciosByDepartamentoRedisKey = (departamento) => `espacios:departamento:${departamento}`;
const _getEspaciosByPaisRedisKey = (pais) => `espacios:pais:${pais}`;
const _getEspaciosByCapacidadRedisKey = (capacidadMinima) => `espacios:capacidad-min:${capacidadMinima}`;

const getEspacios = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosFilterRedisKey(filtros, skip, limit);

  try {
    const exists = await redisClient.exists(key);
    if (exists) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {
        }
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getEspacios con paginación");
    const result = await Espacio.find(filtros)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (error) {
    console.log("[Error Redis] leyendo desde MongoDB sin cache", error);
    try {
      return await Espacio.find(filtros)
        .populate("ubicacion.edificioId")
        .populate("usuarioId", "nombre email imagen")
        .populate("empresaInmobiliariaId", "nombre")
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (mongoError) {
      console.error("[Error Mongo] al obtener espacios", mongoError);
      throw mongoError;
    }
  }
};

const findEspacioById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getEspacioRedisKey(id);

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

    console.log("[Leyendo findEspacioById desde MongoDB]");
    const result = await Espacio.findById(id)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.findById(id)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
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

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEspaciosByEdificio desde MongoDB]");
    const result = await Espacio.find({ "ubicacion.edificioId": edificioId })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ "ubicacion.edificioId": edificioId })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
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

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEspaciosByTipo desde MongoDB]");
    const result = await Espacio.find({ tipo })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ tipo })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEspaciosByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByUsuarioRedisKey(usuarioId);

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

    console.log("[Leyendo getEspaciosByUsuario desde MongoDB]");
    const result = await Espacio.find({ usuarioId })
      .populate("ubicacion.edificioId")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ usuarioId })
      .populate("ubicacion.edificioId")
      .populate("empresaInmobiliariaId", "nombre")
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

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEspaciosByEmpresa desde MongoDB]");
    const result = await Espacio.find({ empresaInmobiliariaId })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ empresaInmobiliariaId })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .lean();
  }
};

const getEspaciosByCapacidad = async (capacidadMinima) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByCapacidadRedisKey(capacidadMinima);

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

    console.log("[Leyendo getEspaciosByCapacidad desde MongoDB]");
    const result = await Espacio.find({ capacidad: { $gte: capacidadMinima } })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ capacidad: { $gte: capacidadMinima } })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEspaciosByProximidad = async (lat, lng, radioKm = 10) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByProximidadRedisKey(lat, lng, radioKm);
  
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
    
    const result = await Espacio.find({
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
    return await Espacio.find({ activo: true })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getEspaciosByCiudad = async (ciudad) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByCiudadRedisKey(ciudad);
  
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
    
    const result = await Espacio.find({ 
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
    return await Espacio.find({ 
      'ubicacion.direccionCompleta.ciudad': ciudad,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
  }
};

const getEspaciosByDepartamento = async (departamento) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByDepartamentoRedisKey(departamento);
  
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
    
    const result = await Espacio.find({ 
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
    return await Espacio.find({ 
      'ubicacion.direccionCompleta.departamento': departamento,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
  }
};

const getEspaciosByPais = async (pais) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosByPaisRedisKey(pais);
  
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
    
    const result = await Espacio.find({ 
      'ubicacion.direccionCompleta.pais': pais,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Espacio.find({ 
      'ubicacion.direccionCompleta.pais': pais,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
  }
};

const createEspacio = async (espacioData) => {
  const redisClient = connectToRedis();

  if (!espacioData.usuarioId) {
    throw new Error("usuarioId es obligatorio");
  }

  const usuarioExiste = await Usuario.exists({ _id: espacioData.usuarioId });
  if (!usuarioExiste) {
    throw new Error("Usuario no encontrado");
  }

  if (!espacioData.ubicacion?.coordenadas?.lat || !espacioData.ubicacion?.coordenadas?.lng) {
    throw new Error("Coordenadas (lat, lng) son obligatorias");
  }
  
  if (!espacioData.ubicacion?.direccionCompleta) {
    throw new Error("Dirección completa es obligatoria");
  }

  if (espacioData.ubicacion?.edificioId) {
    const edificioExiste = await Edificio.exists({ _id: espacioData.ubicacion.edificioId });
    if (!edificioExiste) {
      throw new Error("Edificio no encontrado");
    }
  }

  if (espacioData.empresaInmobiliariaId) {
    const empresaExiste = await EmpresaInmobiliaria.exists({
      _id: espacioData.empresaInmobiliariaId,
    });
    if (!empresaExiste) {
      throw new Error("empresa no encontrada");
    }
  }

  const newEspacio = new Espacio(espacioData);
  const saved = await newEspacio.save();

  try {
    const filterKeys = await redisClient.keys("espacios:*");
    if (filterKeys.length > 0) {
      await redisClient.del(...filterKeys);
    }

    if (saved.ubicacion && saved.ubicacion.edificioId) {
      await redisClient.del(
        _getEspaciosByEdificioRedisKey(saved.ubicacion.edificioId.toString())
      );
    }
    if (saved.tipo) {
      await redisClient.del(_getEspaciosByTipoRedisKey(saved.tipo));
    }
    if (saved.usuarioId) {
      await redisClient.del(
        _getEspaciosByUsuarioRedisKey(saved.usuarioId.toString())
      );
    }
    if (saved.empresaInmobiliariaId) {
      await redisClient.del(
        _getEspaciosByEmpresaRedisKey(saved.empresaInmobiliariaId.toString())
      );
    }
    if (saved.capacidad) {
      for (let i = 1; i <= saved.capacidad; i++) {
        await redisClient.del(_getEspaciosByCapacidadRedisKey(i));
      }
    }
    if (saved.ubicacion?.direccionCompleta?.ciudad) {
      await redisClient.del(_getEspaciosByCiudadRedisKey(saved.ubicacion.direccionCompleta.ciudad));
    }
    if (saved.ubicacion?.direccionCompleta?.departamento) {
      await redisClient.del(_getEspaciosByDepartamentoRedisKey(saved.ubicacion.direccionCompleta.departamento));
    }

    const proximityKeys = await redisClient.keys("espacios:proximidad:*");
    if (proximityKeys.length > 0) {
      await redisClient.del(...proximityKeys);
    }

    const availabilityKeys = await redisClient.keys("espacios:disponibles:*");
    if (availabilityKeys.length > 0) {
      await redisClient.del(...availabilityKeys);
    }

    const amenityKeys = await redisClient.keys("espacios:amenidades:*");
    if (amenityKeys.length > 0) {
      await redisClient.del(...amenityKeys);
    }

    console.log("✅ Cache invalidated successfully after creating espacio");
  } catch (cacheError) {
    console.error("❌ Error invalidating cache:", cacheError);
  }

  return saved;
};

const updateEspacio = async (id, payload) => {
  const redisClient = connectToRedis();
  const espacio = await Espacio.findById(id);
  
  if (!espacio) {
    throw new Error("Espacio no encontrado");
  }

  if (payload.usuarioId && payload.usuarioId !== espacio.usuarioId?.toString()) {
    const usuarioExiste = await Usuario.exists({ _id: payload.usuarioId });
    if (!usuarioExiste) {
      throw new Error("Nuevo usuario no encontrado");
    }
  }
  
  const updated = await Espacio.findByIdAndUpdate(id, payload, { new: true })
    .populate("ubicacion.edificioId")
    .populate("usuarioId", "nombre email imagen")
    .populate("empresaInmobiliariaId", "nombre");

  await redisClient.del(_getEspacioRedisKey(id));
  await redisClient.del(_getEspaciosFilterRedisKey({}));

  if (espacio.ubicacion && espacio.ubicacion.edificioId) {
    await redisClient.del(
      _getEspaciosByEdificioRedisKey(espacio.ubicacion.edificioId.toString())
    );
  }
  if (
    updated.ubicacion &&
    updated.ubicacion.edificioId &&
    (!espacio.ubicacion ||
      !espacio.ubicacion.edificioId ||
      espacio.ubicacion.edificioId.toString() !==
        updated.ubicacion.edificioId.toString())
  ) {
    await redisClient.del(
      _getEspaciosByEdificioRedisKey(updated.ubicacion.edificioId.toString())
    );
  }

  if (espacio.tipo) {
    await redisClient.del(_getEspaciosByTipoRedisKey(espacio.tipo));
  }
  if (updated.tipo && espacio.tipo !== updated.tipo) {
    await redisClient.del(_getEspaciosByTipoRedisKey(updated.tipo));
  }

  if (espacio.usuarioId) {
    await redisClient.del(
      _getEspaciosByUsuarioRedisKey(espacio.usuarioId.toString())
    );
  }
  if (
    updated.usuarioId &&
    (!espacio.usuarioId ||
      espacio.usuarioId.toString() !== updated.usuarioId.toString())
  ) {
    await redisClient.del(
      _getEspaciosByUsuarioRedisKey(updated.usuarioId.toString())
    );
  }

  if (espacio.empresaInmobiliariaId) {
    await redisClient.del(
      _getEspaciosByEmpresaRedisKey(espacio.empresaInmobiliariaId.toString())
    );
  }
  if (
    updated.empresaInmobiliariaId &&
    (!espacio.empresaInmobiliariaId ||
      espacio.empresaInmobiliariaId.toString() !==
        updated.empresaInmobiliariaId.toString())
  ) {
    await redisClient.del(
      _getEspaciosByEmpresaRedisKey(updated.empresaInmobiliariaId.toString())
    );
  }

  if (espacio.capacidad !== updated.capacidad) {
    const maxCapacidad = Math.max(espacio.capacidad || 0, updated.capacidad || 0);
    for (let i = 1; i <= maxCapacidad; i++) {
      await redisClient.del(_getEspaciosByCapacidadRedisKey(i));
    }
  }

  await redisClient.keys("espacios:disponibles:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
  });

  if (payload.amenidades) {
    await redisClient.keys("espacios:amenidades:*").then((keys) => {
      keys.forEach((key) => redisClient.del(key));
    });
  }

  await redisClient.keys('espacios:proximidad:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });

  if (payload.ubicacion?.direccionCompleta) {
    if (espacio.ubicacion?.direccionCompleta?.ciudad !== payload.ubicacion.direccionCompleta.ciudad) {
      await redisClient.del(_getEspaciosByCiudadRedisKey(espacio.ubicacion?.direccionCompleta?.ciudad));
      await redisClient.del(_getEspaciosByCiudadRedisKey(payload.ubicacion.direccionCompleta.ciudad));
    }
    if (espacio.ubicacion?.direccionCompleta?.departamento !== payload.ubicacion.direccionCompleta.departamento) {
      await redisClient.del(_getEspaciosByDepartamentoRedisKey(espacio.ubicacion?.direccionCompleta?.departamento));
      await redisClient.del(_getEspaciosByDepartamentoRedisKey(payload.ubicacion.direccionCompleta.departamento));
    }
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
    await redisClient.del(
      _getEspaciosByEdificioRedisKey(espacio.ubicacion.edificioId.toString())
    );
  }
  if (espacio.tipo) {
    await redisClient.del(_getEspaciosByTipoRedisKey(espacio.tipo));
  }
  if (espacio.usuarioId) {
    await redisClient.del(
      _getEspaciosByUsuarioRedisKey(espacio.usuarioId.toString())
    );
  }
  if (espacio.empresaInmobiliariaId) {
    await redisClient.del(
      _getEspaciosByEmpresaRedisKey(espacio.empresaInmobiliariaId.toString())
    );
  }

  await redisClient.keys("espacios:disponibles:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
  });

  await redisClient.keys("espacios:amenidades:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
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

  await redisClient.keys("espacios:disponibles:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
  });

  return updated;
};

const getEspaciosDisponibles = async (tipo, fecha, horaInicio, horaFin) => {
  const redisClient = connectToRedis();
  const key = _getEspaciosDisponiblesRedisKey(
    tipo,
    fecha || "todas",
    horaInicio || "todas",
    horaFin || "todas"
  );

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

    console.log("[Leyendo getEspaciosDisponibles desde MongoDB]");
    const filtrosBase = {
      tipo,
      estado: "disponible",
      activo: true,
    };

    const result = await Espacio.find(filtrosBase)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    const filtrosBase = {
      tipo,
      estado: "disponible",
      activo: true,
    };

    return await Espacio.find(filtrosBase)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
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

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEspaciosByAmenidades desde MongoDB]");
    const result = await Espacio.find({ amenidades: { $all: amenidades } })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Espacio.find({ amenidades: { $all: amenidades } })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const activarEspacio = async (id) => {
  return await updateEspacio(id, { activo: true });
};

const desactivarEspacio = async (id) => {
  return await updateEspacio(id, { activo: false });
};

const agregarAmenidad = async (id, amenidad) => {
  const redisClient = connectToRedis();
  const updated = await Espacio.findByIdAndUpdate(
    id,
    { $push: { amenidades: amenidad } },
    { new: true }
  );

  await redisClient.del(_getEspacioRedisKey(id));
  await redisClient.keys("espacios:amenidades:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
  });

  return updated;
};

const eliminarAmenidad = async (id, amenidad) => {
  const redisClient = connectToRedis();
  const updated = await Espacio.findByIdAndUpdate(
    id,
    { $pull: { amenidades: amenidad } },
    { new: true }
  );

  await redisClient.del(_getEspacioRedisKey(id));
  await redisClient.keys("espacios:amenidades:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
  });

  return updated;
};

const actualizarPrecios = async (id, precios) => {
  const redisClient = connectToRedis();
  const updated = await Espacio.findByIdAndUpdate(
    id,
    { precios },
    { new: true }
  );

  await redisClient.del(_getEspacioRedisKey(id));
  await redisClient.del(_getEspaciosFilterRedisKey({}));

  return updated;
};

const actualizarDisponibilidad = async (id, disponibilidad) => {
  const redisClient = connectToRedis();
  const updated = await Espacio.findByIdAndUpdate(
    id,
    { disponibilidad },
    { new: true }
  );

  await redisClient.del(_getEspacioRedisKey(id));
  await redisClient.keys("espacios:disponibles:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
  });

  return updated;
};

module.exports = {
  getEspacios,
  findEspacioById,
  getEspaciosByEdificio,
  getEspaciosByTipo,
  getEspaciosByUsuario,
  getEspaciosByEmpresa,
  getEspaciosByCapacidad,
  getEspaciosByProximidad,
  getEspaciosByCiudad,
  getEspaciosByDepartamento,
  getEspaciosByPais,
  createEspacio,
  updateEspacio,
  deleteEspacio,
  cambiarEstadoEspacio,
  getEspaciosDisponibles,
  getEspaciosByAmenidades,
  activarEspacio,
  desactivarEspacio,
  agregarAmenidad,
  eliminarAmenidad,
  actualizarPrecios,
  actualizarDisponibilidad,
};