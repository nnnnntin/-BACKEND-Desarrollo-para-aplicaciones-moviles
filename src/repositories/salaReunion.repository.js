const SalaReunion = require("../models/salaReunion.model");
const connectToRedis = require("../services/redis.service");

const _getSalasReunionRedisKey = (id) => `id:${id}-salasReunion`;
const _getSalasReunionFilterRedisKey = (filtros) => `salasReunion:${JSON.stringify(filtros)}`;
const _getSalaReunionByCodigoRedisKey = (codigo) => `salaReunion:codigo:${codigo}`;
const _getSalasByEdificioRedisKey = (edificioId) => `edificio:${edificioId}-salasReunion`;
const _getSalasByCapacidadRedisKey = (capacidadMinima) => `salasReunion:capacidad-min:${capacidadMinima}`;
const _getSalasByConfiguracionRedisKey = (configuracion) => `salasReunion:configuracion:${configuracion}`;
const _getSalasByEquipamientoRedisKey = (tipoEquipamiento) => `salasReunion:equipamiento:${tipoEquipamiento}`;
const _getSalasByPropietarioRedisKey = (propietarioId) => `propietario:${propietarioId}-salasReunion`;
const _getSalasByRangoPrecioRedisKey = (precioMin, precioMax, tipoPrecio) => `salasReunion:precio:${tipoPrecio}:${precioMin}-${precioMax}`;
const _getSalasDisponiblesRedisKey = (fecha, horaInicio, horaFin) => `salasReunion:disponibles:${fecha}:${horaInicio}-${horaFin}`;

const getSalasReunion = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getSalasReunionFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getSalasReunion desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getSalasReunion, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getSalasReunion desde MongoDB]");
  const result = await SalaReunion.find(filtros)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findSalaReunionById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getSalasReunionRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findSalaReunionById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findSalaReunionById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findSalaReunionById desde MongoDB]");
  const result = await SalaReunion.findById(id)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const findSalaReunionByCodigo = async (codigo) => {
  const redisClient = connectToRedis();
  const key = _getSalaReunionByCodigoRedisKey(codigo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findSalaReunionByCodigo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findSalaReunionByCodigo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findSalaReunionByCodigo desde MongoDB]");
  const result = await SalaReunion.findOne({ codigo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getSalasByEdificio = async (edificioId) => {
  const redisClient = connectToRedis();
  const key = _getSalasByEdificioRedisKey(edificioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getSalasByEdificio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getSalasByEdificio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getSalasByEdificio desde MongoDB]");
  const result = await SalaReunion.find({ 'ubicacion.edificioId': edificioId })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getSalasByCapacidad = async (capacidadMinima) => {
  const redisClient = connectToRedis();
  const key = _getSalasByCapacidadRedisKey(capacidadMinima);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getSalasByCapacidad desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getSalasByCapacidad, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getSalasByCapacidad desde MongoDB]");
  const result = await SalaReunion.find({ capacidad: { $gte: capacidadMinima } })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getSalasByConfiguracion = async (configuracion) => {
  const redisClient = connectToRedis();
  const key = _getSalasByConfiguracionRedisKey(configuracion);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getSalasByConfiguracion desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getSalasByConfiguracion, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getSalasByConfiguracion desde MongoDB]");
  const result = await SalaReunion.find({ configuracion })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getSalasByEquipamiento = async (tipoEquipamiento) => {
  const redisClient = connectToRedis();
  const key = _getSalasByEquipamientoRedisKey(tipoEquipamiento);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getSalasByEquipamiento desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getSalasByEquipamiento, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getSalasByEquipamiento desde MongoDB]");
  const result = await SalaReunion.find({ 'equipamiento.tipo': tipoEquipamiento })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getSalasByPropietario = async (propietarioId) => {
  const redisClient = connectToRedis();
  const key = _getSalasByPropietarioRedisKey(propietarioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getSalasByPropietario desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getSalasByPropietario, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getSalasByPropietario desde MongoDB]");
  const result = await SalaReunion.find({ propietarioId })
    .populate('ubicacion.edificioId')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getSalasByRangoPrecio = async (precioMin, precioMax, tipoPrecio = 'porHora') => {
  const redisClient = connectToRedis();
  const key = _getSalasByRangoPrecioRedisKey(precioMin, precioMax, tipoPrecio);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getSalasByRangoPrecio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getSalasByRangoPrecio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getSalasByRangoPrecio desde MongoDB]");
  const query = {};
  query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };
  
  const result = await SalaReunion.find(query)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createSalaReunion = async (salaData) => {
  const redisClient = connectToRedis();
  const newSala = new SalaReunion(salaData);
  const saved = await newSala.save();
  
  await redisClient.del(_getSalasReunionFilterRedisKey({}));
  if (saved.codigo) {
    await redisClient.del(_getSalaReunionByCodigoRedisKey(saved.codigo));
  }
  if (saved.ubicacion && saved.ubicacion.edificioId) {
    await redisClient.del(_getSalasByEdificioRedisKey(saved.ubicacion.edificioId.toString()));
  }
  if (saved.propietarioId) {
    await redisClient.del(_getSalasByPropietarioRedisKey(saved.propietarioId.toString()));
  }
  
  return saved;
};

const updateSalaReunion = async (id, payload) => {
  const redisClient = connectToRedis();
  const sala = await SalaReunion.findById(id);
  const updated = await SalaReunion.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getSalasReunionRedisKey(id));
  await redisClient.del(_getSalasReunionFilterRedisKey({}));
  
  if (sala.codigo) {
    await redisClient.del(_getSalaReunionByCodigoRedisKey(sala.codigo));
  }
  if (updated.codigo && sala.codigo !== updated.codigo) {
    await redisClient.del(_getSalaReunionByCodigoRedisKey(updated.codigo));
  }
  
  if (sala.ubicacion && sala.ubicacion.edificioId) {
    await redisClient.del(_getSalasByEdificioRedisKey(sala.ubicacion.edificioId.toString()));
  }
  if (updated.ubicacion && updated.ubicacion.edificioId) {
    await redisClient.del(_getSalasByEdificioRedisKey(updated.ubicacion.edificioId.toString()));
  }
  
  if (sala.propietarioId) {
    await redisClient.del(_getSalasByPropietarioRedisKey(sala.propietarioId.toString()));
  }
  if (updated.propietarioId && (!sala.propietarioId || sala.propietarioId.toString() !== updated.propietarioId.toString())) {
    await redisClient.del(_getSalasByPropietarioRedisKey(updated.propietarioId.toString()));
  }
  
  if (sala.capacidad) {
    for (let i = 1; i <= sala.capacidad; i++) {
      await redisClient.del(_getSalasByCapacidadRedisKey(i));
    }
  }
  
  if (sala.configuracion) {
    await redisClient.del(_getSalasByConfiguracionRedisKey(sala.configuracion));
  }
  if (updated.configuracion && sala.configuracion !== updated.configuracion) {
    await redisClient.del(_getSalasByConfiguracionRedisKey(updated.configuracion));
  }
  
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
  
  if (sala.propietarioId) {
    await redisClient.del(_getSalasByPropietarioRedisKey(sala.propietarioId.toString()));
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

const getSalasDisponibles = async (fecha, horaInicio, horaFin) => {
  const redisClient = connectToRedis();
  const key = _getSalasDisponiblesRedisKey(fecha || "todas", horaInicio || "todas", horaFin || "todas");
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getSalasDisponibles desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getSalasDisponibles, volviendo a MongoDB", err);
    }
  }
  
  console.log("[Leyendo getSalasDisponibles desde MongoDB]");
  const filtrosBase = { 
    estado: 'disponible',
    activo: true
  };
  
  const result = await SalaReunion.find(filtrosBase)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

module.exports = {
  getSalasReunion,
  findSalaReunionById,
  findSalaReunionByCodigo,
  getSalasByEdificio,
  getSalasByCapacidad,
  getSalasByConfiguracion,
  getSalasByEquipamiento,
  getSalasByPropietario,
  getSalasByRangoPrecio,
  createSalaReunion,
  updateSalaReunion,
  deleteSalaReunion,
  cambiarEstadoSala,
  agregarEquipamiento,
  eliminarEquipamiento,
  actualizarPrecios,
  getSalasDisponibles
};