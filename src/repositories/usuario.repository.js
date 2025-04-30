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
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getUsuarios desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getUsuarios, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getUsuarios desde MongoDB]");
  const result = await Usuario.find(filtros);
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
};

const findUsuarioById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getUsuarioRedisKey(id);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findUsuarioById desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findUsuarioById, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findUsuarioById desde MongoDB]");
  const result = await Usuario.findById(id);
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const findUsuarioByEmail = async (email) => {
  const redisClient = connectToRedis();
  const key = _getUsuarioByEmailRedisKey(email);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findUsuarioByEmail desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findUsuarioByEmail, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findUsuarioByEmail desde MongoDB]");
  const result = await Usuario.findOne({ email });
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const findUsuarioByUsername = async (username) => {
  const redisClient = connectToRedis();
  const key = _getUsuarioByUsernameRedisKey(username);
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo findUsuarioByUsername desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de findUsuarioByUsername, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo findUsuarioByUsername desde MongoDB]");
  const result = await Usuario.findOne({ username });
  if (result) {
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  }
  return result;
};

const registerUsuario = async (userData) => {
  const redisClient = connectToRedis();
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUsuario = new Usuario({
    ...userData,
    password: hashedPassword
  });
  
  const saved = await newUsuario.save();
  
  // Invalidar caches
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
  
  // Invalidar caches
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
  
  // Invalidar caches
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
  let cached = await redisClient.get(key);
  if (cached) {
    console.log("[Leyendo getUsuariosByTipo desde Redis]");
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error al parsear caché de getUsuariosByTipo, volviendo a MongoDB", err);
    }
  }
  console.log("[Leyendo getUsuariosByTipo desde MongoDB]");
  const result = await Usuario.find({ tipoUsuario });
  await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
  return result;
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