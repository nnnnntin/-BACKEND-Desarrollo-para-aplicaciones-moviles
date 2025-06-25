const Edificio = require("../models/edificio.model");
const Usuario = require("../models/usuario.model");
const EmpresaInmobiliaria = require("../models/empresaInmobiliaria.model");
const connectToRedis = require("../services/redis.service");

const _getEdificioRedisKey = (id) => `id:${id}-edificio`;
const _getEdificiosFilterRedisKey = (filtros, skip, limit) =>
  `edificios:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getEdificiosByUsuarioRedisKey = (usuarioId) =>
  `usuario:${usuarioId}-edificios`;
const _getEdificiosByEmpresaRedisKey = (empresaId) =>
  `empresa:${empresaId}-edificios`;
const _getEdificiosByCiudadRedisKey = (ciudad) => `edificios:ciudad:${ciudad}`;
const _getEdificiosByDepartamentoRedisKey = (departamento) => `edificios:departamento:${departamento}`;
const _getEdificiosByPaisRedisKey = (pais) => `edificios:pais:${pais}`;
const _getEdificiosConAmenidadRedisKey = (tipoAmenidad) =>
  `edificios:amenidad:${tipoAmenidad}`;
const _getEdificiosByProximidadRedisKey = (lat, lng, radioKm) => `edificios:proximidad:${lat}:${lng}:${radioKm}`;

const getEdificios = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosFilterRedisKey(filtros, skip, limit);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {
          console.log(parseError);
        }
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getEdificios con paginación");
    const result = await Edificio.find(filtros)
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
      return await Edificio.find(filtros)
        .populate("usuarioId", "nombre email imagen")
        .populate("empresaInmobiliariaId", "nombre")
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (mongoError) {
      console.error("[Error Mongo] al obtener edificios", mongoError);
      throw mongoError;
    }
  }
};

const findEdificioById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getEdificioRedisKey(id);

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

    console.log("[Leyendo findEdificioById desde MongoDB]");
    const result = await Edificio.findById(id)
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Edificio.findById(id)
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEdificiosByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByUsuarioRedisKey(usuarioId);

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

    console.log("[Leyendo getEdificiosByUsuario desde MongoDB]");
    const result = await Edificio.find({ usuarioId })
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Edificio.find({ usuarioId })
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEdificiosByEmpresa = async (empresaInmobiliariaId) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByEmpresaRedisKey(empresaInmobiliariaId);

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

    console.log("[Leyendo getEdificiosByEmpresa desde MongoDB]");
    const result = await Edificio.find({ empresaInmobiliariaId })
      .populate("usuarioId", "nombre email imagen")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Edificio.find({ empresaInmobiliariaId })
      .populate("usuarioId", "nombre email imagen")
      .lean();
  }
};

const getEdificiosByCiudad = async (ciudad) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByCiudadRedisKey(ciudad);

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

    console.log("[Leyendo getEdificiosByCiudad desde MongoDB]");
    const result = await Edificio.find({ "direccion.ciudad": ciudad })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Edificio.find({ "direccion.ciudad": ciudad })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEdificiosByDepartamento = async (departamento) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByDepartamentoRedisKey(departamento);

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

    console.log("[Leyendo getEdificiosByDepartamento desde MongoDB]");
    const result = await Edificio.find({ "direccion.departamento": departamento })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Edificio.find({ "direccion.departamento": departamento })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEdificiosByPais = async (pais) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByPaisRedisKey(pais);

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

    console.log("[Leyendo getEdificiosByPais desde MongoDB]");
    const result = await Edificio.find({ "direccion.pais": pais })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Edificio.find({ "direccion.pais": pais })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEdificiosConAmenidad = async (tipoAmenidad) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosConAmenidadRedisKey(tipoAmenidad);

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

    console.log("[Leyendo getEdificiosConAmenidad desde MongoDB]");
    const result = await Edificio.find({ "amenidades.tipo": tipoAmenidad })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Edificio.find({ "amenidades.tipo": tipoAmenidad })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEdificiosByProximidad = async (lat, lng, radioKm = 10) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByProximidadRedisKey(lat, lng, radioKm);
  
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
    
    const result = await Edificio.find({
      "direccion.coordenadas": {
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
    .populate("usuarioId", "nombre email imagen")
    .populate("empresaInmobiliariaId", "nombre")
    .lean();
    
    await redisClient.set(key, result, { ex: 1800 });
    
    return result;
  } catch (error) {
    console.log("[Error en búsqueda geoespacial de edificios]", error);
    return await Edificio.find({ activo: true })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const createEdificio = async (edificioData) => {
  const redisClient = connectToRedis();

  if (!edificioData.usuarioId) {
    throw new Error("usuarioId es obligatorio");
  }

  const usuarioExiste = await Usuario.exists({ _id: edificioData.usuarioId });
  if (!usuarioExiste) {
    throw new Error("Usuario no encontrado");
  }

  if (!edificioData.direccion?.coordenadas?.lat || !edificioData.direccion?.coordenadas?.lng) {
    throw new Error("Coordenadas (lat, lng) son obligatorias en la dirección");
  }

  if (!edificioData.direccion?.departamento) {
    throw new Error("Departamento es obligatorio en la dirección");
  }

  if (edificioData.empresaInmobiliariaId) {
    const empresaExiste = await EmpresaInmobiliaria.exists({
      _id: edificioData.empresaInmobiliariaId,
    });
    if (!empresaExiste) {
      throw new Error("empresa no encontrada");
    }
  }

  const newEdificio = new Edificio(edificioData);
  const saved = await newEdificio.save();

  await redisClient.del(_getEdificiosFilterRedisKey({}));
  if (saved.usuarioId) {
    await redisClient.del(_getEdificiosByUsuarioRedisKey(saved.usuarioId.toString()));
  }
  if (saved.empresaInmobiliariaId) {
    await redisClient.del(_getEdificiosByEmpresaRedisKey(saved.empresaInmobiliariaId.toString()));
  }
  if (saved.direccion && saved.direccion.ciudad) {
    await redisClient.del(_getEdificiosByCiudadRedisKey(saved.direccion.ciudad));
  }
  if (saved.direccion && saved.direccion.departamento) {
    await redisClient.del(_getEdificiosByDepartamentoRedisKey(saved.direccion.departamento));
  }
  if (saved.direccion && saved.direccion.pais) {
    await redisClient.del(_getEdificiosByPaisRedisKey(saved.direccion.pais));
  }

  return saved;
};

const updateEdificio = async (id, payload) => {
  const redisClient = connectToRedis();
  const edificio = await Edificio.findById(id);
  
  if (!edificio) {
    throw new Error("Edificio no encontrado");
  }

  if (payload.usuarioId && payload.usuarioId !== edificio.usuarioId?.toString()) {
    const usuarioExiste = await Usuario.exists({ _id: payload.usuarioId });
    if (!usuarioExiste) {
      throw new Error("Nuevo usuario no encontrado");
    }
  }

  const updated = await Edificio.findByIdAndUpdate(id, payload, { new: true })
    .populate("usuarioId", "nombre email imagen")
    .populate("empresaInmobiliariaId", "nombre");

  await redisClient.del(_getEdificioRedisKey(id));
  await redisClient.del(_getEdificiosFilterRedisKey({}));

  if (edificio.usuarioId) {
    await redisClient.del(_getEdificiosByUsuarioRedisKey(edificio.usuarioId.toString()));
  }
  if (updated.usuarioId && (!edificio.usuarioId || edificio.usuarioId.toString() !== updated.usuarioId.toString())) {
    await redisClient.del(_getEdificiosByUsuarioRedisKey(updated.usuarioId.toString()));
  }

  if (edificio.empresaInmobiliariaId) {
    await redisClient.del(_getEdificiosByEmpresaRedisKey(edificio.empresaInmobiliariaId.toString()));
  }
  if (updated.empresaInmobiliariaId && (!edificio.empresaInmobiliariaId || edificio.empresaInmobiliariaId.toString() !== updated.empresaInmobiliariaId.toString())) {
    await redisClient.del(_getEdificiosByEmpresaRedisKey(updated.empresaInmobiliariaId.toString()));
  }

  if (edificio.direccion && edificio.direccion.ciudad) {
    await redisClient.del(_getEdificiosByCiudadRedisKey(edificio.direccion.ciudad));
  }
  if (updated.direccion && updated.direccion.ciudad && (!edificio.direccion || !edificio.direccion.ciudad || edificio.direccion.ciudad !== updated.direccion.ciudad)) {
    await redisClient.del(_getEdificiosByCiudadRedisKey(updated.direccion.ciudad));
  }

  if (edificio.direccion && edificio.direccion.departamento) {
    await redisClient.del(_getEdificiosByDepartamentoRedisKey(edificio.direccion.departamento));
  }
  if (updated.direccion && updated.direccion.departamento && (!edificio.direccion || !edificio.direccion.departamento || edificio.direccion.departamento !== updated.direccion.departamento)) {
    await redisClient.del(_getEdificiosByDepartamentoRedisKey(updated.direccion.departamento));
  }

  if (edificio.direccion && edificio.direccion.pais) {
    await redisClient.del(_getEdificiosByPaisRedisKey(edificio.direccion.pais));
  }
  if (updated.direccion && updated.direccion.pais && (!edificio.direccion || !edificio.direccion.pais || edificio.direccion.pais !== updated.direccion.pais)) {
    await redisClient.del(_getEdificiosByPaisRedisKey(updated.direccion.pais));
  }

  if (edificio.amenidades && edificio.amenidades.length > 0) {
    for (const amenidad of edificio.amenidades) {
      if (amenidad.tipo) {
        await redisClient.del(_getEdificiosConAmenidadRedisKey(amenidad.tipo));
      }
    }
  }

  await redisClient.keys('edificios:proximidad:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });

  return updated;
};

const deleteEdificio = async (id) => {
  const redisClient = connectToRedis();
  const edificio = await Edificio.findById(id);
  const updated = await Edificio.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );

  await redisClient.del(_getEdificioRedisKey(id));
  await redisClient.del(_getEdificiosFilterRedisKey({}));

  if (edificio.usuarioId) {
    await redisClient.del(_getEdificiosByUsuarioRedisKey(edificio.usuarioId.toString()));
  }
  if (edificio.empresaInmobiliariaId) {
    await redisClient.del(_getEdificiosByEmpresaRedisKey(edificio.empresaInmobiliariaId.toString()));
  }
  if (edificio.direccion && edificio.direccion.ciudad) {
    await redisClient.del(_getEdificiosByCiudadRedisKey(edificio.direccion.ciudad));
  }
  if (edificio.direccion && edificio.direccion.departamento) {
    await redisClient.del(_getEdificiosByDepartamentoRedisKey(edificio.direccion.departamento));
  }
  if (edificio.direccion && edificio.direccion.pais) {
    await redisClient.del(_getEdificiosByPaisRedisKey(edificio.direccion.pais));
  }

  return updated;
};

const activarEdificio = async (id) => {
  return await updateEdificio(id, { activo: true });
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  return await updateEdificio(id, { calificacionPromedio: nuevaCalificacion });
};

const agregarAmenidad = async (id, amenidad) => {
  const redisClient = connectToRedis();
  const updated = await Edificio.findByIdAndUpdate(
    id,
    { $push: { amenidades: amenidad } },
    { new: true }
  );

  await redisClient.del(_getEdificioRedisKey(id));
  if (amenidad.tipo) {
    await redisClient.del(_getEdificiosConAmenidadRedisKey(amenidad.tipo));
  }

  return updated;
};

const eliminarAmenidad = async (id, amenidadId) => {
  const redisClient = connectToRedis();
  const edificio = await Edificio.findById(id);
  const amenidadAEliminar = edificio.amenidades.find(
    (a) => a._id.toString() === amenidadId
  );

  const updated = await Edificio.findByIdAndUpdate(
    id,
    { $pull: { amenidades: { _id: amenidadId } } },
    { new: true }
  );

  await redisClient.del(_getEdificioRedisKey(id));
  if (amenidadAEliminar && amenidadAEliminar.tipo) {
    await redisClient.del(
      _getEdificiosConAmenidadRedisKey(amenidadAEliminar.tipo)
    );
  }

  return updated;
};

const actualizarHorario = async (id, horario) => {
  return await updateEdificio(id, { horario });
};

module.exports = {
  getEdificios,
  findEdificioById,
  getEdificiosByUsuario,
  getEdificiosByEmpresa,
  getEdificiosByCiudad,
  getEdificiosByDepartamento,
  getEdificiosByPais,
  getEdificiosConAmenidad,
  getEdificiosByProximidad,
  createEdificio,
  updateEdificio,
  deleteEdificio,
  activarEdificio,
  actualizarCalificacion,
  agregarAmenidad,
  eliminarAmenidad,
  actualizarHorario,
};