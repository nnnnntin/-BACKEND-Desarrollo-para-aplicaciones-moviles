const EscritorioFlexible = require("../models/escritorioFlexible.model");
const connectToRedis = require("../services/redis.service");

const _getEscritorioRedisKey = (id) => `id:${id}-escritorio`;
const _getEscritoriosFilterRedisKey = (filtros) => `escritorios:${JSON.stringify(filtros)}`;
const _getEscritorioByCodigoRedisKey = (codigo) => `escritorio:codigo:${codigo}`;
const _getEscritoriosByEdificioRedisKey = (edificioId) => `edificio:${edificioId}-escritorios`;
const _getEscritoriosByTipoRedisKey = (tipo) => `escritorios:tipo:${tipo}`;
const _getEscritoriosByAmenidadesRedisKey = (tipoAmenidad) => `escritorios:amenidad:${tipoAmenidad}`;
const _getEscritoriosByPropietarioRedisKey = (propietarioId) => `propietario:${propietarioId}-escritorios`;
const _getEscritoriosByRangoPrecioRedisKey = (precioMin, precioMax, tipoPrecio) => `escritorios:precio:${tipoPrecio}:${precioMin}-${precioMax}`;
const _getEscritoriosDisponiblesRedisKey = (fecha) => `escritorios:disponibles:${fecha}`;

const getEscritoriosFlexibles = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEscritoriosFlexibles desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEscritoriosFlexibles, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEscritoriosFlexibles desde MongoDB]");
  const result = await EscritorioFlexible.find(filtros)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findEscritorioFlexibleById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getEscritorioRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findEscritorioFlexibleById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findEscritorioFlexibleById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findEscritorioFlexibleById desde MongoDB]");
  const result = await EscritorioFlexible.findById(id)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const findEscritorioFlexibleByCodigo = async (codigo) => {
  const redisClient = connectToRedis();
  const key = _getEscritorioByCodigoRedisKey(codigo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findEscritorioFlexibleByCodigo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findEscritorioFlexibleByCodigo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findEscritorioFlexibleByCodigo desde MongoDB]");
  const result = await EscritorioFlexible.findOne({ codigo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getEscritoriosByEdificio = async (edificioId) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByEdificioRedisKey(edificioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEscritoriosByEdificio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEscritoriosByEdificio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEscritoriosByEdificio desde MongoDB]");
  const result = await EscritorioFlexible.find({ 'ubicacion.edificioId': edificioId })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getEscritoriosByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByTipoRedisKey(tipo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEscritoriosByTipo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEscritoriosByTipo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEscritoriosByTipo desde MongoDB]");
  const result = await EscritorioFlexible.find({ tipo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getEscritoriosByAmenidades = async (tipoAmenidad) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByAmenidadesRedisKey(tipoAmenidad);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEscritoriosByAmenidades desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEscritoriosByAmenidades, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEscritoriosByAmenidades desde MongoDB]");
  const result = await EscritorioFlexible.find({ 'amenidades.tipo': tipoAmenidad })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getEscritoriosByPropietario = async (propietarioId) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByPropietarioRedisKey(propietarioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEscritoriosByPropietario desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEscritoriosByPropietario, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEscritoriosByPropietario desde MongoDB]");
  const result = await EscritorioFlexible.find({ propietarioId })
    .populate('ubicacion.edificioId')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getEscritoriosByRangoPrecio = async (precioMin, precioMax, tipoPrecio = 'porDia') => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByRangoPrecioRedisKey(precioMin, precioMax, tipoPrecio);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEscritoriosByRangoPrecio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEscritoriosByRangoPrecio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEscritoriosByRangoPrecio desde MongoDB]");
  const query = {};
  query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };

  const result = await EscritorioFlexible.find(query)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createEscritorioFlexible = async (escritorioData) => {
  const redisClient = connectToRedis();
  const newEscritorio = new EscritorioFlexible(escritorioData);
  const saved = await newEscritorio.save();
  
  // Invalidar caches
  await redisClient.del(_getEscritoriosFilterRedisKey({}));
  if (saved.codigo) {
    await redisClient.del(_getEscritorioByCodigoRedisKey(saved.codigo));
  }
  if (saved.ubicacion && saved.ubicacion.edificioId) {
    await redisClient.del(_getEscritoriosByEdificioRedisKey(saved.ubicacion.edificioId.toString()));
  }
  if (saved.tipo) {
    await redisClient.del(_getEscritoriosByTipoRedisKey(saved.tipo));
  }
  if (saved.propietarioId) {
    await redisClient.del(_getEscritoriosByPropietarioRedisKey(saved.propietarioId.toString()));
  }
  
  return saved;
};

const updateEscritorioFlexible = async (id, payload) => {
  const redisClient = connectToRedis();
  const escritorio = await EscritorioFlexible.findById(id);
  const updated = await EscritorioFlexible.findByIdAndUpdate(id, payload, { new: true });
  
  // Invalidar caches
  await redisClient.del(_getEscritorioRedisKey(id));
  await redisClient.del(_getEscritoriosFilterRedisKey({}));
  
  if (escritorio.codigo) {
    await redisClient.del(_getEscritorioByCodigoRedisKey(escritorio.codigo));
  }
  if (updated.codigo && escritorio.codigo !== updated.codigo) {
    await redisClient.del(_getEscritorioByCodigoRedisKey(updated.codigo));
  }
  
  if (escritorio.ubicacion && escritorio.ubicacion.edificioId) {
    await redisClient.del(_getEscritoriosByEdificioRedisKey(escritorio.ubicacion.edificioId.toString()));
  }
  if (updated.ubicacion && updated.ubicacion.edificioId && 
      (!escritorio.ubicacion || !escritorio.ubicacion.edificioId || 
       escritorio.ubicacion.edificioId.toString() !== updated.ubicacion.edificioId.toString())) {
    await redisClient.del(_getEscritoriosByEdificioRedisKey(updated.ubicacion.edificioId.toString()));
  }
  
  if (escritorio.tipo) {
    await redisClient.del(_getEscritoriosByTipoRedisKey(escritorio.tipo));
  }
  if (updated.tipo && escritorio.tipo !== updated.tipo) {
    await redisClient.del(_getEscritoriosByTipoRedisKey(updated.tipo));
  }
  
  if (escritorio.propietarioId) {
    await redisClient.del(_getEscritoriosByPropietarioRedisKey(escritorio.propietarioId.toString()));
  }
  if (updated.propietarioId && (!escritorio.propietarioId || 
      escritorio.propietarioId.toString() !== updated.propietarioId.toString())) {
    await redisClient.del(_getEscritoriosByPropietarioRedisKey(updated.propietarioId.toString()));
  }
  
  // Invalidar cache de disponibles
  await redisClient.keys('escritorios:disponibles:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const deleteEscritorioFlexible = async (id) => {
  const redisClient = connectToRedis();
  const escritorio = await EscritorioFlexible.findById(id);
  const removed = await EscritorioFlexible.findByIdAndDelete(id);
  
  // Invalidar caches
  await redisClient.del(_getEscritorioRedisKey(id));
  await redisClient.del(_getEscritoriosFilterRedisKey({}));
  
  if (escritorio.codigo) {
    await redisClient.del(_getEscritorioByCodigoRedisKey(escritorio.codigo));
  }
  if (escritorio.ubicacion && escritorio.ubicacion.edificioId) {
    await redisClient.del(_getEscritoriosByEdificioRedisKey(escritorio.ubicacion.edificioId.toString()));
  }
  if (escritorio.tipo) {
    await redisClient.del(_getEscritoriosByTipoRedisKey(escritorio.tipo));
  }
  if (escritorio.propietarioId) {
    await redisClient.del(_getEscritoriosByPropietarioRedisKey(escritorio.propietarioId.toString()));
  }
  
  // Invalidar cache de disponibles
  await redisClient.keys('escritorios:disponibles:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return removed;
};

const cambiarEstadoEscritorio = async (id, nuevoEstado) => {
  const redisClient = connectToRedis();
  const updated = await EscritorioFlexible.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getEscritorioRedisKey(id));
  await redisClient.del(_getEscritoriosFilterRedisKey({}));
  
  // Invalidar cache de disponibles
  await redisClient.keys('escritorios:disponibles:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const agregarAmenidad = async (id, amenidad) => {
  const redisClient = connectToRedis();
  const updated = await EscritorioFlexible.findByIdAndUpdate(
    id,
    { $push: { amenidades: amenidad } },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getEscritorioRedisKey(id));
  if (amenidad.tipo) {
    await redisClient.del(_getEscritoriosByAmenidadesRedisKey(amenidad.tipo));
  }
  
  return updated;
};

const eliminarAmenidad = async (id, amenidadId) => {
  const redisClient = connectToRedis();
  const escritorio = await EscritorioFlexible.findById(id);
  const amenidadAEliminar = escritorio.amenidades.find(a => a._id.toString() === amenidadId);
  
  const updated = await EscritorioFlexible.findByIdAndUpdate(
    id,
    { $pull: { amenidades: { _id: amenidadId } } },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getEscritorioRedisKey(id));
  if (amenidadAEliminar && amenidadAEliminar.tipo) {
    await redisClient.del(_getEscritoriosByAmenidadesRedisKey(amenidadAEliminar.tipo));
  }
  
  return updated;
};

const getEscritoriosDisponibles = async (fecha) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosDisponiblesRedisKey(fecha || "todas");
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEscritoriosDisponibles desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEscritoriosDisponibles, volviendo a MongoDB", err);
    }
  }
  
  console.log("[Leyendo getEscritoriosDisponibles desde MongoDB]");
  const filtrosBase = {
    estado: 'disponible',
    activo: true
  };
  
  const result = await EscritorioFlexible.find(filtrosBase)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

module.exports = {
  getEscritoriosFlexibles,
  findEscritorioFlexibleById,
  findEscritorioFlexibleByCodigo,
  getEscritoriosByEdificio,
  getEscritoriosByTipo,
  getEscritoriosByAmenidades,
  getEscritoriosByPropietario,
  getEscritoriosByRangoPrecio,
  createEscritorioFlexible,
  updateEscritorioFlexible,
  deleteEscritorioFlexible,
  cambiarEstadoEscritorio,
  agregarAmenidad,
  eliminarAmenidad,
  getEscritoriosDisponibles
};