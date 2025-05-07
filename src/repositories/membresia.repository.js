const Membresia = require("../models/membresia.model");
const connectToRedis = require("../services/redis.service");

const _getMembresiaRedisKey = (id) => `id:${id}-membresia`;
const _getMembresiasFilterRedisKey = (filtros, skip, limit) =>
  `membresias:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getMembresiaByTipoRedisKey = (tipo) => `membresia:tipo:${tipo}`;
const _getMembresiasActivasRedisKey = () => `membresias:activas`;
const _getMembresiasOrdenadasRedisKey = (campo, orden) => `membresias:ordenadas:${campo}:${orden}`;
const _getMembresiasWithBeneficioRedisKey = (tipoBeneficio) => `membresias:beneficio:${tipoBeneficio}`;
const _getMembresiasParaEmpresaRedisKey = () => `membresias:para-empresa`;
const _getMembresiasPorRangoPrecioRedisKey = (precioMin, precioMax) => `membresias:precio:${precioMin}-${precioMax}`;

const getMembresias = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getMembresiasFilterRedisKey(filtros, skip, limit);

  try {
    const exists = await redisClient.exists(key);
    if (exists) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch {
          // si falla el parseo, seguimos al fetch de Mongo
        }
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getMembresias con paginación");
    const result = await Membresia.find({ ...filtros, activo: true })
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (error) {
    console.log("[Error Redis] leyendo membresías desde MongoDB sin cache", error);
    try {
      return await Membresia.find({ ...filtros, activo: true })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (mongoError) {
      console.error("[Error Mongo] al obtener membresías", mongoError);
      throw mongoError;
    }
  }
};

const findMembresiaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getMembresiaRedisKey(id);
  
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
    
    const result = await Membresia.findById(id).lean();
    if (result) {
      await redisClient.set(key, result, { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    return await Membresia.findById(id).lean();
  }
};

const findMembresiaByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getMembresiaByTipoRedisKey(tipo);
  
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
    
    const result = await Membresia.findOne({ tipo, activo: true }).lean();
    if (result) {
      await redisClient.set(key, result, { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    return await Membresia.findOne({ tipo, activo: true }).lean();
  }
};

const getMembresiasActivas = async () => {
  const redisClient = connectToRedis();
  const key = _getMembresiasActivasRedisKey();
  
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
    
    const result = await Membresia.find({ activo: true }).lean();
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Membresia.find({ activo: true }).lean();
  }
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
    
    const sortOptions = {};
    sortOptions[campo] = orden;
    
    const result = await Membresia.find({ activo: true }).sort(sortOptions).lean();
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    const sortOptions = {};
    sortOptions[campo] = orden;
    return await Membresia.find({ activo: true }).sort(sortOptions).lean();
  }
};

const findMembresiasWithBeneficio = async (tipoBeneficio) => {
  const redisClient = connectToRedis();
  const key = _getMembresiasWithBeneficioRedisKey(tipoBeneficio);
  
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
    
    const result = await Membresia.find({ 
      activo: true,
      'beneficios.tipo': tipoBeneficio
    }).lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Membresia.find({ 
      activo: true,
      'beneficios.tipo': tipoBeneficio
    }).lean();
  }
};

const getMembresiasParaEmpresa = async () => {
  const redisClient = connectToRedis();
  const key = _getMembresiasParaEmpresaRedisKey();
  
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
    
    const result = await Membresia.find({ 
      activo: true,
      tipo: { $in: ['empresarial', 'premium'] }
    }).lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Membresia.find({ 
      activo: true,
      tipo: { $in: ['empresarial', 'premium'] }
    }).lean();
  }
};

const getMembresiasPorRangoPrecio = async (precioMin, precioMax) => {
  const redisClient = connectToRedis();
  const key = _getMembresiasPorRangoPrecioRedisKey(precioMin, precioMax);
  
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
    
    const result = await Membresia.find({
      activo: true,
      'precio.valor': { $gte: precioMin, $lte: precioMax }
    }).lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Membresia.find({
      activo: true,
      'precio.valor': { $gte: precioMin, $lte: precioMax }
    }).lean();
  }
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