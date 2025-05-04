const Membresia = require("../models/membresia.model");
const connectToRedis = require("../services/redis.service");

const _getMembresiaRedisKey = (id) => `id:${id}-membresia`;
const _getMembresiasFilterRedisKey = (filtros) => `membresias:${JSON.stringify(filtros)}`;
const _getMembresiaByTipoRedisKey = (tipo) => `membresia:tipo:${tipo}`;
const _getMembresiasActivasRedisKey = () => `membresias:activas`;
const _getMembresiasOrdenadasRedisKey = (campo, orden) => `membresias:ordenadas:${campo}:${orden}`;
const _getMembresiasWithBeneficioRedisKey = (tipoBeneficio) => `membresias:beneficio:${tipoBeneficio}`;
const _getMembresiasParaEmpresaRedisKey = () => `membresias:para-empresa`;
const _getMembresiasPorRangoPrecioRedisKey = (precioMin, precioMax) => `membresias:precio:${precioMin}-${precioMax}`;

const getMembresias = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getMembresiasFilterRedisKey(filtros);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getMembresias desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getMembresias, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getMembresias desde MongoDB]");
  const result = await Membresia.find({ ...filtros, activo: true });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findMembresiaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getMembresiaRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findMembresiaById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findMembresiaById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findMembresiaById desde MongoDB]");
  const result = await Membresia.findById(id);
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const findMembresiaByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getMembresiaByTipoRedisKey(tipo);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findMembresiaByTipo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findMembresiaByTipo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findMembresiaByTipo desde MongoDB]");
  const result = await Membresia.findOne({ tipo, activo: true });
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const getMembresiasActivas = async () => {
  const redisClient = connectToRedis();
  const key = _getMembresiasActivasRedisKey();
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getMembresiasActivas desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getMembresiasActivas, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getMembresiasActivas desde MongoDB]");
  const result = await Membresia.find({ activo: true });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const createMembresia = async (membresiaData) => {
  const redisClient = connectToRedis();
  const newMembresia = new Membresia(membresiaData);
  const saved = await newMembresia.save();
  
  await redisClient.del(_getMembresiasFilterRedisKey({}));
  await redisClient.del(_getMembresiasActivasRedisKey());
  if (saved.tipo) {
    await redisClient.del(_getMembresiaByTipoRedisKey(saved.tipo));
  }
  
  await redisClient.keys('membresias:ordenadas:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  if (saved.tipo === 'empresarial' || saved.tipo === 'premium') {
    await redisClient.del(_getMembresiasParaEmpresaRedisKey());
  }
  
  await redisClient.keys('membresias:precio:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  if (saved.beneficios && saved.beneficios.length > 0) {
    for (const beneficio of saved.beneficios) {
      if (beneficio.tipo) {
        await redisClient.del(_getMembresiasWithBeneficioRedisKey(beneficio.tipo));
      }
    }
  }
  
  return saved;
};

const updateMembresia = async (id, payload) => {
  const redisClient = connectToRedis();
  const membresia = await Membresia.findById(id);
  const updated = await Membresia.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getMembresiaRedisKey(id));
  await redisClient.del(_getMembresiasFilterRedisKey({}));
  await redisClient.del(_getMembresiasActivasRedisKey());
  
  if (membresia.tipo) {
    await redisClient.del(_getMembresiaByTipoRedisKey(membresia.tipo));
  }
  if (updated.tipo && membresia.tipo !== updated.tipo) {
    await redisClient.del(_getMembresiaByTipoRedisKey(updated.tipo));
  }
  
  await redisClient.keys('membresias:ordenadas:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  if (membresia.tipo === 'empresarial' || membresia.tipo === 'premium' ||
      updated.tipo === 'empresarial' || updated.tipo === 'premium') {
    await redisClient.del(_getMembresiasParaEmpresaRedisKey());
  }
  
  if (payload.precio) {
    await redisClient.keys('membresias:precio:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  if (payload.beneficios) {
    await redisClient.keys('membresias:beneficio:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

const deleteMembresia = async (id) => {
  const redisClient = connectToRedis();
  const membresia = await Membresia.findById(id);
  const updated = await Membresia.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
  
  await redisClient.del(_getMembresiaRedisKey(id));
  await redisClient.del(_getMembresiasFilterRedisKey({}));
  await redisClient.del(_getMembresiasActivasRedisKey());
  
  if (membresia.tipo) {
    await redisClient.del(_getMembresiaByTipoRedisKey(membresia.tipo));
  }
  
  await redisClient.keys('membresias:ordenadas:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  if (membresia.tipo === 'empresarial' || membresia.tipo === 'premium') {
    await redisClient.del(_getMembresiasParaEmpresaRedisKey());
  }
  
  if (membresia.beneficios && membresia.beneficios.length > 0) {
    for (const beneficio of membresia.beneficios) {
      if (beneficio.tipo) {
        await redisClient.del(_getMembresiasWithBeneficioRedisKey(beneficio.tipo));
      }
    }
  }
  
  return updated;
};

const activarMembresia = async (id) => {
  return await updateMembresia(id, { activo: true });
};

const getMembresiasOrdenadas = async (campo = 'precio.valor', orden = 1) => {
  const redisClient = connectToRedis();
  const key = _getMembresiasOrdenadasRedisKey(campo, orden);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getMembresiasOrdenadas desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getMembresiasOrdenadas, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getMembresiasOrdenadas desde MongoDB]");
  const sortOptions = {};
  sortOptions[campo] = orden;
  
  const result = await Membresia.find({ activo: true }).sort(sortOptions);
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findMembresiasWithBeneficio = async (tipoBeneficio) => {
  const redisClient = connectToRedis();
  const key = _getMembresiasWithBeneficioRedisKey(tipoBeneficio);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findMembresiasWithBeneficio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findMembresiasWithBeneficio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findMembresiasWithBeneficio desde MongoDB]");
  const result = await Membresia.find({ 
    activo: true,
    'beneficios.tipo': tipoBeneficio
  });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getMembresiasParaEmpresa = async () => {
  const redisClient = connectToRedis();
  const key = _getMembresiasParaEmpresaRedisKey();
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getMembresiasParaEmpresa desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getMembresiasParaEmpresa, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getMembresiasParaEmpresa desde MongoDB]");
  const result = await Membresia.find({ 
    activo: true,
    tipo: { $in: ['empresarial', 'premium'] }
  });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const getMembresiasPorRangoPrecio = async (precioMin, precioMax) => {
  const redisClient = connectToRedis();
  const key = _getMembresiasPorRangoPrecioRedisKey(precioMin, precioMax);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getMembresiasPorRangoPrecio desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getMembresiasPorRangoPrecio, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getMembresiasPorRangoPrecio desde MongoDB]");
  const result = await Membresia.find({
    activo: true,
    'precio.valor': { $gte: precioMin, $lte: precioMax }
  });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const actualizarBeneficios = async (id, beneficios) => {
  const redisClient = connectToRedis();
  const membresia = await Membresia.findById(id);
  const updated = await Membresia.findByIdAndUpdate(
    id,
    { beneficios },
    { new: true }
  );
  
  await redisClient.del(_getMembresiaRedisKey(id));
  
  if (membresia.beneficios && membresia.beneficios.length > 0) {
    for (const beneficio of membresia.beneficios) {
      if (beneficio.tipo) {
        await redisClient.del(_getMembresiasWithBeneficioRedisKey(beneficio.tipo));
      }
    }
  }
  
  if (beneficios && beneficios.length > 0) {
    for (const beneficio of beneficios) {
      if (beneficio.tipo) {
        await redisClient.del(_getMembresiasWithBeneficioRedisKey(beneficio.tipo));
      }
    }
  }
  
  return updated;
};

module.exports = {
  getMembresias,
  findMembresiaById,
  findMembresiaByTipo,
  getMembresiasActivas,
  createMembresia,
  updateMembresia,
  deleteMembresia,
  activarMembresia,
  getMembresiasOrdenadas,
  findMembresiasWithBeneficio,
  getMembresiasParaEmpresa,
  getMembresiasPorRangoPrecio,
  actualizarBeneficios
};