const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuario.model");
const connectToRedis = require("../services/redis.service");

const _getUsuarioRedisKey = (id) => `id:${id}-usuario`;
const _getUsuarioByEmailRedisKey = (email) => `usuario:email:${email}`;
const _getUsuarioByUsernameRedisKey = (username) => `usuario:username:${username}`;
const _getUsuariosFilterRedisKey = (filtros) => `usuarios:${JSON.stringify(filtros)}`;
const _getUsuariosByTipoRedisKey = (tipoUsuario) => `usuarios:tipo:${tipoUsuario}`;

const getUsuarios = async (filtros = {}) => {
  const redisClient = connectToRedis();
  const key = _getUsuariosFilterRedisKey(filtros);
  
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
    
    console.log("[Leyendo getUsuarios desde MongoDB]");
    const result = await Usuario.find(filtros).lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Usuario.find(filtros).lean();
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
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUsuario = new Usuario({
    ...userData,
    password: hashedPassword
  });
  
  const saved = await newUsuario.save();
  
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
  
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }
  
  const updated = await Usuario.findByIdAndUpdate(id, payload, { new: true });
  
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