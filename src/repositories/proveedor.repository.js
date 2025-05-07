const Proveedor = require("../models/proveedor.model");
const connectToRedis = require("../services/redis.service");

const _getProveedorRedisKey = (id) => `id:${id}-proveedor`;
const _getProveedoresFilterRedisKey = (filtros, skip, limit) =>
  `proveedores:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getProveedoresByTipoRedisKey = (tipo) => `proveedores:tipo:${tipo}`;
const _getProveedoresVerificadosRedisKey = () => `proveedores:verificados`;
const _getProveedoresPorCalificacionRedisKey = (calificacionMinima) => `proveedores:calificacion-min:${calificacionMinima}`;
const _getProveedoresConMasServiciosRedisKey = (limite) => `proveedores:mas-servicios:${limite}`;

const getProveedores = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getProveedoresFilterRedisKey(filtros, skip, limit);

  try {
    if (await redisClient.exists(key)) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try { return JSON.parse(cached); }
        catch { /* parse fallido, sigue a Mongo */ }
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getProveedores con skip/limit");
    const result = await Proveedor.find(filtros)
      .populate("serviciosOfrecidos")
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (err) {
    console.log("[Error Redis] fallback a Mongo sin cache", err);
    return await Proveedor.find(filtros)
      .populate("serviciosOfrecidos")
      .skip(skip)
      .limit(limit)
      .lean();
  }
};


const findProveedorById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getProveedorRedisKey(id);
  
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
    
    const result = await Proveedor.findById(id)
      .populate('serviciosOfrecidos')
      .lean();
    
    if (result) {
      await redisClient.set(key, result, { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    return await Proveedor.findById(id)
      .populate('serviciosOfrecidos')
      .lean();
  }
};

const getProveedoresByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getProveedoresByTipoRedisKey(tipo);
  
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
    
    const result = await Proveedor.find({ tipo, activo: true }).lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Proveedor.find({ tipo, activo: true }).lean();
  }
};

const getProveedoresVerificados = async () => {
  const redisClient = connectToRedis();
  const key = _getProveedoresVerificadosRedisKey();
  
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
    
    const result = await Proveedor.find({ verificado: true, activo: true }).lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Proveedor.find({ verificado: true, activo: true }).lean();
  }
};

const createProveedor = async (proveedorData) => {
  const redisClient = connectToRedis();
  const newProveedor = new Proveedor(proveedorData);
  const saved = await newProveedor.save();
  
  await redisClient.del(_getProveedoresFilterRedisKey({}));
  if (saved.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(saved.tipo));
  }
  if (saved.verificado) {
    await redisClient.del(_getProveedoresVerificadosRedisKey());
  }
  
  if (saved.calificacionPromedio) {
    for (let i = 1; i <= Math.min(saved.calificacionPromedio, 5); i++) {
      await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
    }
  }
  
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return saved;
};

const updateProveedor = async (id, payload) => {
  const redisClient = connectToRedis();
  const proveedor = await Proveedor.findById(id);
  const updated = await Proveedor.findByIdAndUpdate(id, payload, { new: true });
  
  await redisClient.del(_getProveedorRedisKey(id));
  await redisClient.del(_getProveedoresFilterRedisKey({}));
  
  if (proveedor.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(proveedor.tipo));
  }
  if (updated.tipo && proveedor.tipo !== updated.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(updated.tipo));
  }
  
  if (proveedor.verificado !== updated.verificado) {
    await redisClient.del(_getProveedoresVerificadosRedisKey());
  }
  
  if (proveedor.calificacionPromedio !== updated.calificacionPromedio) {
    const maxCalificacion = 5;
    for (let i = 1; i <= maxCalificacion; i++) {
      await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
    }
  }
  
  if (payload.serviciosOfrecidos) {
    await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
      keys.forEach(key => redisClient.del(key));
    });
  }
  
  return updated;
};

const deleteProveedor = async (id) => {
  const redisClient = connectToRedis();
  const proveedor = await Proveedor.findById(id);
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
  
  await redisClient.del(_getProveedorRedisKey(id));
  await redisClient.del(_getProveedoresFilterRedisKey({}));
  
  if (proveedor.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(proveedor.tipo));
  }
  if (proveedor.verificado) {
    await redisClient.del(_getProveedoresVerificadosRedisKey());
  }
  
  if (proveedor.calificacionPromedio) {
    for (let i = 1; i <= Math.min(proveedor.calificacionPromedio, 5); i++) {
      await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
    }
  }
  
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const activarProveedor = async (id) => {
  const redisClient = connectToRedis();
  const proveedor = await Proveedor.findById(id);
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { activo: true },
    { new: true }
  );
  
  await redisClient.del(_getProveedorRedisKey(id));
  await redisClient.del(_getProveedoresFilterRedisKey({}));
  
  if (proveedor.tipo) {
    await redisClient.del(_getProveedoresByTipoRedisKey(proveedor.tipo));
  }
  if (proveedor.verificado) {
    await redisClient.del(_getProveedoresVerificadosRedisKey());
  }
  
  if (proveedor.calificacionPromedio) {
    for (let i = 1; i <= Math.min(proveedor.calificacionPromedio, 5); i++) {
      await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
    }
  }
  
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const verificarProveedor = async (id) => {
  const redisClient = connectToRedis();
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { verificado: true },
    { new: true }
  );
  
  await redisClient.del(_getProveedorRedisKey(id));
  await redisClient.del(_getProveedoresVerificadosRedisKey());
  
  return updated;
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  const redisClient = connectToRedis();
  const proveedor = await Proveedor.findById(id);
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { calificacionPromedio: nuevaCalificacion },
    { new: true }
  );
  
  await redisClient.del(_getProveedorRedisKey(id));
  
  const maxCalificacion = 5;
  for (let i = 1; i <= maxCalificacion; i++) {
    await redisClient.del(_getProveedoresPorCalificacionRedisKey(i));
  }
  
  return updated;
};

const agregarServicio = async (id, servicioId) => {
  const redisClient = connectToRedis();
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { $addToSet: { serviciosOfrecidos: servicioId } },
    { new: true }
  );
  
  await redisClient.del(_getProveedorRedisKey(id));
  
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const eliminarServicio = async (id, servicioId) => {
  const redisClient = connectToRedis();
  const updated = await Proveedor.findByIdAndUpdate(
    id,
    { $pull: { serviciosOfrecidos: servicioId } },
    { new: true }
  );
  
  await redisClient.del(_getProveedorRedisKey(id));
  
  await redisClient.keys('proveedores:mas-servicios:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });
  
  return updated;
};

const actualizarContacto = async (id, contacto) => {
  return await updateProveedor(id, { contacto });
};

const actualizarMetodoPago = async (id, metodoPago) => {
  return await updateProveedor(id, { metodoPago });
};

const getProveedoresPorCalificacion = async (calificacionMinima = 4) => {
  const redisClient = connectToRedis();
  const key = _getProveedoresPorCalificacionRedisKey(calificacionMinima);
  
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
    
    const result = await Proveedor.find({
      calificacionPromedio: { $gte: calificacionMinima },
      activo: true
    })
      .populate('serviciosOfrecidos')
      .sort({ calificacionPromedio: -1 })
      .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Proveedor.find({
      calificacionPromedio: { $gte: calificacionMinima },
      activo: true
    })
      .populate('serviciosOfrecidos')
      .sort({ calificacionPromedio: -1 })
      .lean();
  }
};

const getProveedoresConMasServicios = async (limite = 5) => {
  const redisClient = connectToRedis();
  const key = _getProveedoresConMasServiciosRedisKey(limite);
  
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
    
    const result = await Proveedor.aggregate([
      { $match: { activo: true } },
      { $project: { nombre: 1, tipo: 1, numeroServicios: { $size: '$serviciosOfrecidos' } } },
      { $sort: { numeroServicios: -1 } },
      { $limit: limite }
    ]);
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await Proveedor.aggregate([
      { $match: { activo: true } },
      { $project: { nombre: 1, tipo: 1, numeroServicios: { $size: '$serviciosOfrecidos' } } },
      { $sort: { numeroServicios: -1 } },
      { $limit: limite }
    ]);
  }
};

module.exports = {
  getProveedores,
  findProveedorById,
  getProveedoresByTipo,
  getProveedoresVerificados,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  activarProveedor,
  verificarProveedor,
  actualizarCalificacion,
  agregarServicio,
  eliminarServicio,
  actualizarContacto,
  actualizarMetodoPago,
  getProveedoresPorCalificacion,
  getProveedoresConMasServicios
};