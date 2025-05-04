const EmpresaInmobiliaria = require("../models/empresaInmobiliaria.model");
const connectToRedis = require("../services/redis.service");

const _getEmpresaRedisKey = (id) => `id:${id}-empresa`;
const _getEmpresasFilterRedisKey = (filtros) => `empresas:${JSON.stringify(filtros)}`;
const _getEmpresasByTipoRedisKey = (tipo) => `empresas:tipo:${tipo}`;
const _getEmpresasVerificadasRedisKey = () => `empresas:verificadas`;
const _getEmpresasByCiudadRedisKey = (ciudad) => `empresas:ciudad:${ciudad}`;
const _getEmpresasConMasEspaciosRedisKey = (limite) => `empresas:mas-espacios:${limite}`;

const getEmpresasInmobiliarias = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getEmpresasFilterRedisKey(filtros);
  
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
    
    console.log("[Leyendo getEmpresasInmobiliarias desde MongoDB]");
    const result = await EmpresaInmobiliaria.find(filtros)
      .populate('espacios')
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EmpresaInmobiliaria.find(filtros)
      .populate('espacios')
      .lean();
  }
};

const findEmpresaInmobiliariaById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getEmpresaRedisKey(id);
  
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
    
    console.log("[Leyendo findEmpresaInmobiliariaById desde MongoDB]");
    const result = await EmpresaInmobiliaria.findById(id)
      .populate('espacios')
      .lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EmpresaInmobiliaria.findById(id)
      .populate('espacios')
      .lean();
  }
};

const getEmpresasByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getEmpresasByTipoRedisKey(tipo);
  
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
    
    console.log("[Leyendo getEmpresasByTipo desde MongoDB]");
    const result = await EmpresaInmobiliaria.find({ tipo, activo: true }).lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EmpresaInmobiliaria.find({ tipo, activo: true }).lean();
  }
};

const getEmpresasVerificadas = async () => {
  const redisClient = connectToRedis();
  const key = _getEmpresasVerificadasRedisKey();
  
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
    
    console.log("[Leyendo getEmpresasVerificadas desde MongoDB]");
    const result = await EmpresaInmobiliaria.find({ verificado: true, activo: true }).lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EmpresaInmobiliaria.find({ verificado: true, activo: true }).lean();
  }
};

const getEmpresasByCiudad = async (ciudad) => {
  const redisClient = connectToRedis();
  const key = _getEmpresasByCiudadRedisKey(ciudad);
  
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
    
    console.log("[Leyendo getEmpresasByCiudad desde MongoDB]");
    const result = await EmpresaInmobiliaria.find({
      'direccion.ciudad': ciudad,
      activo: true
    }).lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EmpresaInmobiliaria.find({
      'direccion.ciudad': ciudad,
      activo: true
    }).lean();
  }
};

const createEmpresaInmobiliaria = async (empresaData) => {
  const redisClient = connectToRedis();
  const newEmpresa = new EmpresaInmobiliaria(empresaData);
  const saved = await newEmpresa.save();
  
  await redisClient.del(_getEmpresasFilterRedisKey({}));
  if (saved.tipo) {
    await redisClient.del(_getEmpresasByTipoRedisKey(saved.tipo));
  }
  if (saved.verificado) {
    await redisClient.del(_getEmpresasVerificadasRedisKey());
  }
  if (saved.direccion && saved.direccion.ciudad) {
    await redisClient.del(_getEmpresasByCiudadRedisKey(saved.direccion.ciudad));
  }
  await redisClient.keys(`empresas:mas-espacios:*`).then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return saved;
};

const updateEmpresaInmobiliaria = async (id, payload) => {
  const redisClient = connectToRedis();
  const empresa = await EmpresaInmobiliaria.findById(id);
  const updated = await EmpresaInmobiliaria.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getEmpresaRedisKey(id));
  await redisClient.del(_getEmpresasFilterRedisKey({}));
  
  if (empresa.tipo) {
    await redisClient.del(_getEmpresasByTipoRedisKey(empresa.tipo));
  }
  if (updated.tipo && empresa.tipo !== updated.tipo) {
    await redisClient.del(_getEmpresasByTipoRedisKey(updated.tipo));
  }
  
  if ((!empresa.verificado && updated.verificado) || (empresa.verificado && !updated.verificado)) {
    await redisClient.del(_getEmpresasVerificadasRedisKey());
  }
  
  if (empresa.direccion && empresa.direccion.ciudad) {
    await redisClient.del(_getEmpresasByCiudadRedisKey(empresa.direccion.ciudad));
  }
  if (updated.direccion && updated.direccion.ciudad && 
      (!empresa.direccion || !empresa.direccion.ciudad || empresa.direccion.ciudad !== updated.direccion.ciudad)) {
    await redisClient.del(_getEmpresasByCiudadRedisKey(updated.direccion.ciudad));
  }
  
  await redisClient.keys(`empresas:mas-espacios:*`).then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const deleteEmpresaInmobiliaria = async (id) => {
  const redisClient = connectToRedis();
  const empresa = await EmpresaInmobiliaria.findById(id);
  const updated = await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
  
  await redisClient.del(_getEmpresaRedisKey(id));
  await redisClient.del(_getEmpresasFilterRedisKey({}));
  
  if (empresa.tipo) {
    await redisClient.del(_getEmpresasByTipoRedisKey(empresa.tipo));
  }
  if (empresa.verificado) {
    await redisClient.del(_getEmpresasVerificadasRedisKey());
  }
  if (empresa.direccion && empresa.direccion.ciudad) {
    await redisClient.del(_getEmpresasByCiudadRedisKey(empresa.direccion.ciudad));
  }
  
  await redisClient.keys(`empresas:mas-espacios:*`).then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const activarEmpresaInmobiliaria = async (id) => {
  return await updateEmpresaInmobiliaria(id, { activo: true });
};

const verificarEmpresa = async (id) => {
  const redisClient = connectToRedis();
  const updated = await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { verificado: true },
    { new: true }
  );
  
  await redisClient.del(_getEmpresaRedisKey(id));
  await redisClient.del(_getEmpresasVerificadasRedisKey());
  
  return updated;
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  return await updateEmpresaInmobiliaria(id, { calificacionPromedio: nuevaCalificacion });
};

const agregarEspacio = async (id, espacioId) => {
  const redisClient = connectToRedis();
  const updated = await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { $addToSet: { espacios: espacioId } },
    { new: true }
  );
  
  await redisClient.del(_getEmpresaRedisKey(id));
  
  await redisClient.keys(`empresas:mas-espacios:*`).then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const eliminarEspacio = async (id, espacioId) => {
  const redisClient = connectToRedis();
  const updated = await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { $pull: { espacios: espacioId } },
    { new: true }
  );
  
  await redisClient.del(_getEmpresaRedisKey(id));
  
  await redisClient.keys(`empresas:mas-espacios:*`).then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const actualizarMetodoPago = async (id, metodoPago) => {
  return await updateEmpresaInmobiliaria(id, { metodoPago });
};

const actualizarContacto = async (id, contacto) => {
  return await updateEmpresaInmobiliaria(id, { contacto });
};

const getEmpresasConMasEspacios = async (limite = 5) => {
  const redisClient = connectToRedis();
  const key = _getEmpresasConMasEspaciosRedisKey(limite);
  
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
    
    console.log("[Leyendo getEmpresasConMasEspacios desde MongoDB]");
    const result = await EmpresaInmobiliaria.aggregate([
      { $match: { activo: true } },
      { $project: { nombre: 1, tipo: 1, numeroEspacios: { $size: '$espacios' } } },
      { $sort: { numeroEspacios: -1 } },
      { $limit: limite }
    ]);
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EmpresaInmobiliaria.aggregate([
      { $match: { activo: true } },
      { $project: { nombre: 1, tipo: 1, numeroEspacios: { $size: '$espacios' } } },
      { $sort: { numeroEspacios: -1 } },
      { $limit: limite }
    ]);
  }
};

module.exports = {
  getEmpresasInmobiliarias,
  findEmpresaInmobiliariaById,
  getEmpresasByTipo,
  getEmpresasVerificadas,
  getEmpresasByCiudad,
  createEmpresaInmobiliaria,
  updateEmpresaInmobiliaria,
  deleteEmpresaInmobiliaria,
  activarEmpresaInmobiliaria,
  verificarEmpresa,
  actualizarCalificacion,
  agregarEspacio,
  eliminarEspacio,
  actualizarMetodoPago,
  actualizarContacto,
  getEmpresasConMasEspacios
};