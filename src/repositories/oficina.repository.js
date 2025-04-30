const Oficina = require("../models/oficina.model");
const connectToRedis = require("../services/redis.service");

const _getOficinaRedisKey = (id) => `id:${id}-oficina`;
const _getOficinasFilterRedisKey = (filtros) => `oficinas:${JSON.stringify(filtros)}`;
const _getOficinaByCodigoRedisKey = (codigo) => `oficina:codigo:${codigo}`;
const _getOficinasByEdificioRedisKey = (edificioId) => `edificio:${edificioId}-oficinas`;
const _getOficinasByTipoRedisKey = (tipo) => `oficinas:tipo:${tipo}`;
const _getOficinasByPropietarioRedisKey = (propietarioId) => `propietario:${propietarioId}-oficinas`;
const _getOficinasByEmpresaRedisKey = (empresaId) => `empresa:${empresaId}-oficinas`;
const _getOficinasByCapacidadRedisKey = (capacidadMinima) => `oficinas:capacidad-min:${capacidadMinima}`;
const _getOficinasByRangoPrecioRedisKey = (precioMin, precioMax, tipoPrecio) => `oficinas:precio:${tipoPrecio}:${precioMin}-${precioMax}`;
const _getOficinasDisponiblesRedisKey = (fecha, horaInicio, horaFin) => `oficinas:disponibles:${fecha}:${horaInicio}-${horaFin}`;

const getOficinas = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getOficinasFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getOficinas desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getOficinas, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getOficinas desde MongoDB]");
  const result = await Oficina.find(filtros)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findOficinaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getOficinaRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findOficinaById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findOficinaById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findOficinaById desde MongoDB]");
  const result = await Oficina.findById(id)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const findOficinaByCodigo = async (codigo) => {
  const redisClient = connectToRedis();
  const key = _getOficinaByCodigoRedisKey(codigo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findOficinaByCodigo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findOficinaByCodigo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findOficinaByCodigo desde MongoDB]");
  const result = await Oficina.findOne({ codigo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getOficinasByEdificio = async (edificioId) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByEdificioRedisKey(edificioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getOficinasByEdificio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getOficinasByEdificio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getOficinasByEdificio desde MongoDB]");
  const result = await Oficina.find({ 'ubicacion.edificioId': edificioId })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getOficinasByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByTipoRedisKey(tipo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getOficinasByTipo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getOficinasByTipo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getOficinasByTipo desde MongoDB]");
  const result = await Oficina.find({ tipo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getOficinasByPropietario = async (propietarioId) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByPropietarioRedisKey(propietarioId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getOficinasByPropietario desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getOficinasByPropietario, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getOficinasByPropietario desde MongoDB]");
  const result = await Oficina.find({ propietarioId })
    .populate('ubicacion.edificioId')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getOficinasByEmpresa = async (empresaInmobiliariaId) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByEmpresaRedisKey(empresaInmobiliariaId);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getOficinasByEmpresa desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getOficinasByEmpresa, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getOficinasByEmpresa desde MongoDB]");
  const result = await Oficina.find({ empresaInmobiliariaId })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createOficina = async (oficinaData) => {
  const redisClient = connectToRedis();
  const newOficina = new Oficina(oficinaData);
  const saved = await newOficina.save();
  
  // Invalidar caches
  await redisClient.del(_getOficinasFilterRedisKey({}));
  if (saved.codigo) {
    await redisClient.del(_getOficinaByCodigoRedisKey(saved.codigo));
  }
  if (saved.ubicacion && saved.ubicacion.edificioId) {
    await redisClient.del(_getOficinasByEdificioRedisKey(saved.ubicacion.edificioId.toString()));
  }
  if (saved.tipo) {
    await redisClient.del(_getOficinasByTipoRedisKey(saved.tipo));
  }
  if (saved.propietarioId) {
    await redisClient.del(_getOficinasByPropietarioRedisKey(saved.propietarioId.toString()));
  }
  if (saved.empresaInmobiliariaId) {
    await redisClient.del(_getOficinasByEmpresaRedisKey(saved.empresaInmobiliariaId.toString()));
  }
  if (saved.capacidad) {
    for (let i = 1; i <= saved.capacidad; i++) {
      await redisClient.del(_getOficinasByCapacidadRedisKey(i));
    }
  }
  
  return saved;
};

const updateOficina = async (id, payload) => {
  const redisClient = connectToRedis();
  const oficina = await Oficina.findById(id);
  const updated = await Oficina.findByIdAndUpdate(id, payload, { new: true });
  
  // Invalidar caches
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
  
  if (oficina.propietarioId) {
    await redisClient.del(_getOficinasByPropietarioRedisKey(oficina.propietarioId.toString()));
  }
  if (updated.propietarioId && (!oficina.propietarioId || 
      oficina.propietarioId.toString() !== updated.propietarioId.toString())) {
    await redisClient.del(_getOficinasByPropietarioRedisKey(updated.propietarioId.toString()));
  }
  
  if (oficina.empresaInmobiliariaId) {
    await redisClient.del(_getOficinasByEmpresaRedisKey(oficina.empresaInmobiliariaId.toString()));
  }
  if (updated.empresaInmobiliariaId && (!oficina.empresaInmobiliariaId || 
      oficina.empresaInmobiliariaId.toString() !== updated.empresaInmobiliariaId.toString())) {
    await redisClient.del(_getOficinasByEmpresaRedisKey(updated.empresaInmobiliariaId.toString()));
  }
  
  // Capacidad
  if (oficina.capacidad !== updated.capacidad) {
    // Invalidar todas las caches de capacidad que podrían verse afectadas
    const maxCapacidad = Math.max(oficina.capacidad || 0, updated.capacidad || 0);
    for (let i = 1; i <= maxCapacidad; i++) {
      await redisClient.del(_getOficinasByCapacidadRedisKey(i));
    }
  }
  
  // Precio
  if (payload.precios) {
    await redisClient.keys('oficinas:precio:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  // Disponibilidad
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
  
  // Invalidar caches
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
  if (oficina.propietarioId) {
    await redisClient.del(_getOficinasByPropietarioRedisKey(oficina.propietarioId.toString()));
  }
  if (oficina.empresaInmobiliariaId) {
    await redisClient.del(_getOficinasByEmpresaRedisKey(oficina.empresaInmobiliariaId.toString()));
  }
  
  // Invalidar cache de capacidad
  if (oficina.capacidad) {
    for (let i = 1; i <= oficina.capacidad; i++) {
      await redisClient.del(_getOficinasByCapacidadRedisKey(i));
    }
  }
  
  // Invalidar cache de disponibles
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
  
  // Invalidar caches
  await redisClient.del(_getOficinaRedisKey(id));
  
  // Invalidar cache de disponibles
  await redisClient.keys('oficinas:disponibles:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const getOficinasByCapacidad = async (capacidadMinima) => {
  const redisClient = connectToRedis();
  const key = _getOficinasByCapacidadRedisKey(capacidadMinima);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getOficinasByCapacidad desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getOficinasByCapacidad, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getOficinasByCapacidad desde MongoDB]");
  const result = await Oficina.find({ capacidad: { $gte: capacidadMinima } })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getOficinasByRangoPrecio = async (precioMin, precioMax, tipoPrecio = 'porDia') => {
  const redisClient = connectToRedis();
  const key = _getOficinasByRangoPrecioRedisKey(precioMin, precioMax, tipoPrecio);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getOficinasByRangoPrecio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getOficinasByRangoPrecio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getOficinasByRangoPrecio desde MongoDB]");
  const query = {};
  query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };
  
  const result = await Oficina.find(query)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getOficinasDisponibles = async (fecha, horaInicio, horaFin) => {
  const redisClient = connectToRedis();
  const key = _getOficinasDisponiblesRedisKey(fecha || "todas", horaInicio || "todas", horaFin || "todas");
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getOficinasDisponibles desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getOficinasDisponibles, volviendo a MongoDB", err);
    }
  }
  
  console.log("[Leyendo getOficinasDisponibles desde MongoDB]");
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
    .populate("propietarioId", "nombre email")
    .populate("empresaInmobiliariaId", "nombre");
  
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  const redisClient = connectToRedis();
  const updated = await Oficina.findByIdAndUpdate(
    id,
    { calificacionPromedio: nuevaCalificacion },
    { new: true }
  );
  
  // Invalidar cache
  await redisClient.del(_getOficinaRedisKey(id));
  
  return updated;
};

module.exports = {
  getOficinas,
  findOficinaById,
  findOficinaByCodigo,
  getOficinasByEdificio,
  getOficinasByTipo,
  getOficinasByPropietario,
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