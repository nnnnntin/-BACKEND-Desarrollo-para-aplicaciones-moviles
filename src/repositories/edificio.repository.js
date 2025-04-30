const Edificio = require("../models/edificio.model");
const connectToRedis = require("../services/redis.service");

const _getEdificioRedisKey = (id) => `id:${id}-edificio`;
const _getEdificiosFilterRedisKey = (filtros) => `edificios:${JSON.stringify(filtros)}`;
const _getEdificiosByPropietarioRedisKey = (propietarioId) => `propietario:${propietarioId}-edificios`;
const _getEdificiosByEmpresaRedisKey = (empresaId) => `empresa:${empresaId}-edificios`;
const _getEdificiosByCiudadRedisKey = (ciudad) => `edificios:ciudad:${ciudad}`;
const _getEdificiosByPaisRedisKey = (pais) => `edificios:pais:${pais}`;
const _getEdificiosConAmenidadRedisKey = (tipoAmenidad) => `edificios:amenidad:${tipoAmenidad}`;

const getEdificios = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEdificios desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEdificios, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEdificios desde MongoDB]");
  const result = await Edificio.find(filtros)
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findEdificioById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getEdificioRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findEdificioById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findEdificioById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findEdificioById desde MongoDB]");
  const result = await Edificio.findById(id)
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getEdificiosByPropietario = async (propietarioId) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByPropietarioRedisKey(propietarioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEdificiosByPropietario desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEdificiosByPropietario, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEdificiosByPropietario desde MongoDB]");
  const result = await Edificio.find({ propietarioId })
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getEdificiosByEmpresa = async (empresaInmobiliariaId) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByEmpresaRedisKey(empresaInmobiliariaId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEdificiosByEmpresa desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEdificiosByEmpresa, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEdificiosByEmpresa desde MongoDB]");
  const result = await Edificio.find({ empresaInmobiliariaId })
    .populate('propietarioId', 'nombre email');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getEdificiosByCiudad = async (ciudad) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByCiudadRedisKey(ciudad);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEdificiosByCiudad desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEdificiosByCiudad, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEdificiosByCiudad desde MongoDB]");
  const result = await Edificio.find({ 'direccion.ciudad': ciudad })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getEdificiosByPais = async (pais) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosByPaisRedisKey(pais);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEdificiosByPais desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEdificiosByPais, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEdificiosByPais desde MongoDB]");
  const result = await Edificio.find({ 'direccion.pais': pais })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getEdificiosConAmenidad = async (tipoAmenidad) => {
  const redisClient = connectToRedis();
  const key = _getEdificiosConAmenidadRedisKey(tipoAmenidad);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getEdificiosConAmenidad desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getEdificiosConAmenidad, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getEdificiosConAmenidad desde MongoDB]");
  const result = await Edificio.find({ 'amenidades.tipo': tipoAmenidad })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createEdificio = async (edificioData) => {
  const redisClient = connectToRedis();
  const newEdificio = new Edificio(edificioData);
  const saved = await newEdificio.save();
  
  // Invalidar caches
  await redisClient.del(_getEdificiosFilterRedisKey({}));
  if (saved.propietarioId) {
    await redisClient.del(_getEdificiosByPropietarioRedisKey(saved.propietarioId.toString()));
  }
  if (saved.empresaInmobiliariaId) {
    await redisClient.del(_getEdificiosByEmpresaRedisKey(saved.empresaInmobiliariaId.toString()));
  }
  if (saved.direccion && saved.direccion.ciudad) {
    await redisClient.del(_getEdificiosByCiudadRedisKey(saved.direccion.ciudad));
  }
  if (saved.direccion && saved.direccion.pais) {
    await redisClient.del(_getEdificiosByPaisRedisKey(saved.direccion.pais));
  }
  
  return saved;
};

const updateEdificio = async (id, payload) => {
  const redisClient = connectToRedis();
  const edificio = await Edificio.findById(id);
  const updated = await Edificio.findByIdAndUpdate(id, payload, { new: true });
  
  // Invalidar caches
  await redisClient.del(_getEdificioRedisKey(id));
  await redisClient.del(_getEdificiosFilterRedisKey({}));
  
  if (edificio.propietarioId) {
    await redisClient.del(_getEdificiosByPropietarioRedisKey(edificio.propietarioId.toString()));
  }
  if (updated.propietarioId && (!edificio.propietarioId || edificio.propietarioId.toString() !== updated.propietarioId.toString())) {
    await redisClient.del(_getEdificiosByPropietarioRedisKey(updated.propietarioId.toString()));
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
  if (updated.direccion && updated.direccion.ciudad && 
      (!edificio.direccion || !edificio.direccion.ciudad || edificio.direccion.ciudad !== updated.direccion.ciudad)) {
    await redisClient.del(_getEdificiosByCiudadRedisKey(updated.direccion.ciudad));
  }
  
  if (edificio.direccion && edificio.direccion.pais) {
    await redisClient.del(_getEdificiosByPaisRedisKey(edificio.direccion.pais));
  }
  if (updated.direccion && updated.direccion.pais && 
      (!edificio.direccion || !edificio.direccion.pais || edificio.direccion.pais !== updated.direccion.pais)) {
    await redisClient.del(_getEdificiosByPaisRedisKey(updated.direccion.pais));
  }
  
  // Invalidar amenidades
  if (edificio.amenidades && edificio.amenidades.length > 0) {
    for (const amenidad of edificio.amenidades) {
      if (amenidad.tipo) {
        await redisClient.del(_getEdificiosConAmenidadRedisKey(amenidad.tipo));
      }
    }
  }
  
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
  
  // Invalidar caches
  await redisClient.del(_getEdificioRedisKey(id));
  await redisClient.del(_getEdificiosFilterRedisKey({}));
  
  if (edificio.propietarioId) {
    await redisClient.del(_getEdificiosByPropietarioRedisKey(edificio.propietarioId.toString()));
  }
  if (edificio.empresaInmobiliariaId) {
    await redisClient.del(_getEdificiosByEmpresaRedisKey(edificio.empresaInmobiliariaId.toString()));
  }
  if (edificio.direccion && edificio.direccion.ciudad) {
    await redisClient.del(_getEdificiosByCiudadRedisKey(edificio.direccion.ciudad));
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
  
  // Invalidar caches
  await redisClient.del(_getEdificioRedisKey(id));
  if (amenidad.tipo) {
    await redisClient.del(_getEdificiosConAmenidadRedisKey(amenidad.tipo));
  }
  
  return updated;
};

const eliminarAmenidad = async (id, amenidadId) => {
  const redisClient = connectToRedis();
  const edificio = await Edificio.findById(id);
  const amenidadAEliminar = edificio.amenidades.find(a => a._id.toString() === amenidadId);
  
  const updated = await Edificio.findByIdAndUpdate(
    id,
    { $pull: { amenidades: { _id: amenidadId } } },
    { new: true }
  );
  
  // Invalidar caches
  await redisClient.del(_getEdificioRedisKey(id));
  if (amenidadAEliminar && amenidadAEliminar.tipo) {
    await redisClient.del(_getEdificiosConAmenidadRedisKey(amenidadAEliminar.tipo));
  }
  
  return updated;
};

const actualizarHorario = async (id, horario) => {
  return await updateEdificio(id, { horario });
};

module.exports = {
  getEdificios,
  findEdificioById,
  getEdificiosByPropietario,
  getEdificiosByEmpresa,
  getEdificiosByCiudad,
  getEdificiosByPais,
  getEdificiosConAmenidad,
  createEdificio,
  updateEdificio,
  deleteEdificio,
  activarEdificio,
  actualizarCalificacion,
  agregarAmenidad,
  eliminarAmenidad,
  actualizarHorario
};