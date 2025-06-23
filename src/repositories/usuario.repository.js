const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuario.model");
const connectToRedis = require("../services/redis.service");

const _getUsuarioRedisKey = (id) => `id:${id}-usuario`;
const _getUsuarioByEmailRedisKey = (email) => `usuario:email:${email}`;
const _getUsuarioByUsernameRedisKey = (username) => `usuario:username:${username}`;
const _getUsuariosFilterRedisKey = (filtros, skip, limit) =>
  `usuarios:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getUsuariosByTipoRedisKey = (tipoUsuario) => `usuarios:tipo:${tipoUsuario}`;

const getUsuarios = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getUsuariosFilterRedisKey(filtros, skip, limit);

  try {
    if (await redisClient.exists(key)) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try { return JSON.parse(cached); } catch {}
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getUsuarios con skip/limit");
    const result = await Usuario.find(filtros)
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (err) {
    console.log("[Error Redis] fallback a Mongo sin cache", err);
    return await Usuario.find(filtros)
      .skip(skip)
      .limit(limit)
      .lean();
  }
};

const findUsuarioById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getUsuarioRedisKey(id);
  
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
    
    console.log("[Leyendo findUsuarioById desde MongoDB]");
    const result = await Usuario.findById(id).lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Usuario.findById(id).lean();
  }
};

const findUsuarioByEmail = async (email) => {
  const redisClient = connectToRedis();
  const key = _getUsuarioByEmailRedisKey(email);
  
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
    
    console.log("[Leyendo findUsuarioByEmail desde MongoDB]");
    const result = await Usuario.findOne({ email }).lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Usuario.findOne({ email }).lean();
  }
};

const findUsuarioByUsername = async (username) => {
  const redisClient = connectToRedis();
  const key = _getUsuarioByUsernameRedisKey(username);
  
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
    
    console.log("[Leyendo findUsuarioByUsername desde MongoDB]");
    const result = await Usuario.findOne({ username }).lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Usuario.findOne({ username }).lean();
  }
};

const registerUsuario = async (userData) => {
  const redisClient = connectToRedis();
  
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // CAMBIO: Preparar datos incluyendo el campo imagen
  const newUsuarioData = {
    ...userData,
    password: hashedPassword
  };

  // CAMBIO: Log para debug del campo imagen
  console.log('🔵 [Repository] Datos recibidos para registro:', {
    username: userData.username,
    email: userData.email,
    tipoUsuario: userData.tipoUsuario,
    imagen: userData.imagen, // ← Log específico para imagen
    hasImagen: !!userData.imagen,
    imagenType: typeof userData.imagen
  });

  // CAMBIO: Solo incluir imagen si existe y es válida
  if (userData.imagen && typeof userData.imagen === 'string' && userData.imagen.trim()) {
    newUsuarioData.imagen = userData.imagen.trim();
    console.log('🟢 [Repository] Campo imagen incluido:', newUsuarioData.imagen);
  } else {
    console.log('🟡 [Repository] Campo imagen no incluido - valor:', userData.imagen);
  }
  
  console.log('🔵 [Repository] Datos finales para MongoDB:', {
    ...newUsuarioData,
    password: '[HASH]' // No loggear la contraseña hasheada
  });

  const newUsuario = new Usuario(newUsuarioData);
  
  try {
    const saved = await newUsuario.save();
    console.log('🟢 [Repository] Usuario guardado exitosamente:', {
      id: saved._id,
      username: saved.username,
      email: saved.email,
      imagen: saved.imagen, // ← Verificar que se guardó
      hasImagen: !!saved.imagen
    });

    // Limpiar cache de Redis
    await redisClient.del(_getUsuariosFilterRedisKey({}));
    if (saved.email) {
      await redisClient.del(_getUsuarioByEmailRedisKey(saved.email));
    }
    if (saved.username) {
      await redisClient.del(_getUsuarioByUsernameRedisKey(saved.username));
    }
    if (saved.tipoUsuario) {
      await redisClient.del(_getUsuariosByTipoRedisKey(saved.tipoUsuario));
    }
    
    return saved;
  } catch (error) {
    console.error('🔴 [Repository] Error guardando usuario:', error);
    throw error;
  }
};

const loginUsuario = async (email, password) => {
  const usuario = await findUsuarioByEmail(email);
  if (!usuario) return null;
  
  const isPasswordValid = await bcrypt.compare(password, usuario.password);
  if (!isPasswordValid) return null;
  
  return usuario;
};

const isValidPassword = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};

const updateUsuario = async (id, payload) => {
  const redisClient = connectToRedis();
  const usuario = await Usuario.findById(id);
  
  if (!usuario) {
    return null;
  }

  // CAMBIO: Log para debug de actualización con imagen
  console.log('🔵 [Repository] Actualizando usuario con payload:', {
    id,
    hasImagen: !!payload.imagen,
    imagen: payload.imagen,
    otherFields: Object.keys(payload).filter(key => key !== 'imagen' && key !== 'password')
  });

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }
  
  const updated = await Usuario.findByIdAndUpdate(id, payload, { new: true });
  
  console.log('🟢 [Repository] Usuario actualizado:', {
    id: updated._id,
    imagen: updated.imagen,
    hasImagen: !!updated.imagen
  });

  // Limpiar cache de Redis
  await redisClient.del(_getUsuarioRedisKey(id));
  await redisClient.del(_getUsuariosFilterRedisKey({}));
  
  if (usuario.email) {
    await redisClient.del(_getUsuarioByEmailRedisKey(usuario.email));
  }
  if (updated.email && usuario.email !== updated.email) {
    await redisClient.del(_getUsuarioByEmailRedisKey(updated.email));
  }
  
  if (usuario.username) {
    await redisClient.del(_getUsuarioByUsernameRedisKey(usuario.username));
  }
  if (updated.username && usuario.username !== updated.username) {
    await redisClient.del(_getUsuarioByUsernameRedisKey(updated.username));
  }
  
  if (usuario.tipoUsuario) {
    await redisClient.del(_getUsuariosByTipoRedisKey(usuario.tipoUsuario));
  }
  if (updated.tipoUsuario && usuario.tipoUsuario !== updated.tipoUsuario) {
    await redisClient.del(_getUsuariosByTipoRedisKey(updated.tipoUsuario));
  }
  
  return updated;
};

const deleteUsuario = async (id) => {
  const redisClient = connectToRedis();
  const usuario = await Usuario.findById(id);
  const removed = await Usuario.findByIdAndDelete(id);
  
  await redisClient.del(_getUsuarioRedisKey(id));
  await redisClient.del(_getUsuariosFilterRedisKey({}));
  
  if (usuario.email) {
    await redisClient.del(_getUsuarioByEmailRedisKey(usuario.email));
  }
  if (usuario.username) {
    await redisClient.del(_getUsuarioByUsernameRedisKey(usuario.username));
  }
  if (usuario.tipoUsuario) {
    await redisClient.del(_getUsuariosByTipoRedisKey(usuario.tipoUsuario));
  }
  
  return removed;
};

const updateMembresiaUsuario = async (id, membresiaData) => {
  return await updateUsuario(id, { membresia: membresiaData });
};

const getUsuariosByTipo = async (tipoUsuario) => {
  const redisClient = connectToRedis();
  const key = _getUsuariosByTipoRedisKey(tipoUsuario);
  
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
    
    console.log("[Leyendo getUsuariosByTipo desde MongoDB]");
    const result = await Usuario.find({ tipoUsuario }).lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Usuario.find({ tipoUsuario }).lean();
  }
};

const cambiarRolUsuario = async (id, nuevoRol) => {
  return await updateUsuario(id, { rol: nuevoRol });
};

module.exports = {
  getUsuarios,
  findUsuarioById,
  findUsuarioByEmail,
  findUsuarioByUsername,
  registerUsuario,
  loginUsuario,
  isValidPassword,
  updateUsuario,
  deleteUsuario,
  updateMembresiaUsuario,
  getUsuariosByTipo,
  cambiarRolUsuario
};