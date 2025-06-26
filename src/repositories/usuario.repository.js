const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const Usuario = require("../models/usuario.model");
const connectToRedis = require("../services/redis.service");

const _getUsuarioRedisKey = (id) => `id:${id}-usuario`;
const _getUsuarioByEmailRedisKey = (email) => `usuario:email:${email}`;
const _getUsuarioByUsernameRedisKey = (username) => `usuario:username:${username}`;
const _getUsuariosFilterRedisKey = (filtros, skip, limit) =>
  `usuarios:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getUsuariosByTipoRedisKey = (tipoUsuario) => `usuarios:tipo:${tipoUsuario}`;

const encryptSensitiveData = (data) => {
  const algorithm = 'aes-256-cbc';
  const keyString = process.env.ENCRYPTION_KEY || 'your-secret-key-32-characters!!';

  const key = crypto.createHash('sha256').update(keyString).digest();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

const decryptSensitiveData = (encryptedData) => {
  try {
    const algorithm = 'aes-256-cbc';
    const keyString = process.env.ENCRYPTION_KEY || 'your-secret-key-32-characters!!';

    const key = crypto.createHash('sha256').update(keyString).digest();

    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error decrypting sensitive data:', error);
    return null;
  }
};

const getLastDigits = (number, digits = 4) => {
  return number.slice(-digits);
};

const detectCardBrand = (cardNumber) => {
  const firstDigit = cardNumber.charAt(0);
  const firstTwo = cardNumber.substring(0, 2);
  const firstFour = cardNumber.substring(0, 4);

  if (firstDigit === '4') return 'visa';
  if (['51', '52', '53', '54', '55'].includes(firstTwo) ||
    (parseInt(firstFour) >= 2221 && parseInt(firstFour) <= 2720)) return 'mastercard';
  if (['34', '37'].includes(firstTwo)) return 'american_express';
  if (firstFour === '6011' || firstTwo === '65') return 'discover';
  return 'otro';
};

const processMetodosPago = (metodosPago) => {
  if (!metodosPago || !Array.isArray(metodosPago)) return [];

  return metodosPago.map(metodo => {
    const processed = { ...metodo };

    if (metodo.tipo === 'tarjeta_credito' || metodo.tipo === 'tarjeta_debito') {
      processed.numero = encryptSensitiveData(metodo.numero);
      processed.ultimosDigitos = getLastDigits(metodo.numero);
      processed.cvc = encryptSensitiveData(metodo.cvc);

      if (!metodo.marca) {
        processed.marca = detectCardBrand(metodo.numero);
      }
    } else if (metodo.tipo === 'cuenta_bancaria') {
      processed.numeroCuenta = encryptSensitiveData(metodo.numeroCuenta);
      processed.ultimosDigitos = getLastDigits(metodo.numeroCuenta);
    }

    return processed;
  });
};

const getUsuarios = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getUsuariosFilterRedisKey(filtros, skip, limit);

  try {
    if (await redisClient.exists(key)) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try { return JSON.parse(cached); } catch { }
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
        } catch (parseError) { }
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
        } catch (parseError) { }
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
        } catch (parseError) { }
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

  const nombreFinal =
    userData.nombre && userData.nombre.trim().length > 0
      ? userData.nombre.trim()
      : userData.username;
  const apellidosFinal =
    userData.apellidos && userData.apellidos.trim().length > 0
      ? userData.apellidos.trim()
      : '';

  const newUsuarioData = {
    ...userData,
    password: hashedPassword,
    nombre: nombreFinal,
    apellidos: apellidosFinal,
  };

  if (userData.metodoPago && Array.isArray(userData.metodoPago)) {
    newUsuarioData.metodoPago = processMetodosPago(userData.metodoPago);
    console.log('🟢 [Repository] Métodos de pago procesados:', newUsuarioData.metodoPago.length);
  }

  if (
    userData.imagen &&
    typeof userData.imagen === 'string' &&
    userData.imagen.trim()
  ) {
    newUsuarioData.imagen = userData.imagen.trim();
    console.log('🟢 [Repository] Campo imagen incluido:', newUsuarioData.imagen);
  } else {
    console.log('🟡 [Repository] Campo imagen no incluido - valor:', userData.imagen);
    delete newUsuarioData.imagen;
  }

  console.log('🔵 [Repository] Datos finales para MongoDB:', {
    ...newUsuarioData,
    password: '[HASH]'
  });

  const newUsuario = new Usuario(newUsuarioData);
  try {
    const saved = await newUsuario.save();
    console.log('🟢 [Repository] Usuario guardado exitosamente:', {
      id: saved._id,
      username: saved.username,
      email: saved.email,
      imagen: saved.imagen,
      hasImagen: !!saved.imagen,
      metodosPagoCount: saved.metodoPago?.length || 0
    });

    await redisClient.del(_getUsuariosFilterRedisKey({}));
    if (saved.email) await redisClient.del(_getUsuarioByEmailRedisKey(saved.email));
    if (saved.username) await redisClient.del(_getUsuarioByUsernameRedisKey(saved.username));
    if (saved.tipoUsuario) await redisClient.del(_getUsuariosByTipoRedisKey(saved.tipoUsuario));

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

  console.log('🔵 [Repository] Actualizando usuario con payload:', {
    id,
    hasImagen: !!payload.imagen,
    imagen: payload.imagen,
    hasMetodosPago: !!payload.metodoPago,
    metodosPagoCount: payload.metodoPago?.length || 0,
    otherFields: Object.keys(payload).filter(key => !['imagen', 'password', 'metodoPago'].includes(key))
  });

  if (payload.metodoPago && Array.isArray(payload.metodoPago)) {
    payload.metodoPago = processMetodosPago(payload.metodoPago);
    console.log('🟢 [Repository] Métodos de pago procesados para actualización');
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }

  const updated = await Usuario.findByIdAndUpdate(id, payload, { new: true });

  console.log('🟢 [Repository] Usuario actualizado:', {
    id: updated._id,
    imagen: updated.imagen,
    hasImagen: !!updated.imagen,
    metodosPagoCount: updated.metodoPago?.length || 0
  });

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
        } catch (parseError) { }
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

const addMetodoPago = async (usuarioId, metodoPagoData) => {
  const redisClient = connectToRedis();

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const metodoProcesado = processMetodosPago([metodoPagoData])[0];

    if (metodoProcesado.predeterminado) {
      usuario.metodoPago.forEach(metodo => {
        metodo.predeterminado = false;
      });
    }

    usuario.metodoPago.push(metodoProcesado);
    const usuarioActualizado = await usuario.save();

    await redisClient.del(_getUsuarioRedisKey(usuarioId));

    console.log('🟢 [Repository] Método de pago agregado exitosamente');
    return usuarioActualizado;

  } catch (error) {
    console.error('🔴 [Repository] Error agregando método de pago:', error);
    throw error;
  }
};

const updateMetodoPago = async (usuarioId, metodoPagoId, updateData) => {
  const redisClient = connectToRedis();

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const metodoPago = usuario.metodoPago.id(metodoPagoId);
    if (!metodoPago) {
      throw new Error('Método de pago no encontrado');
    }

    if (updateData.predeterminado === true) {
      usuario.metodoPago.forEach(metodo => {
        if (metodo._id.toString() !== metodoPagoId) {
          metodo.predeterminado = false;
        }
      });
    }

    Object.keys(updateData).forEach(key => {
      if (key !== 'metodoPagoId' && updateData[key] !== undefined) {
        metodoPago[key] = updateData[key];
      }
    });

    const usuarioActualizado = await usuario.save();
    await redisClient.del(_getUsuarioRedisKey(usuarioId));

    console.log('🟢 [Repository] Método de pago actualizado exitosamente');
    return usuarioActualizado;

  } catch (error) {
    console.error('🔴 [Repository] Error actualizando método de pago:', error);
    throw error;
  }
};

const deleteMetodoPago = async (usuarioId, metodoPagoId) => {
  const redisClient = connectToRedis();

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const metodoPago = usuario.metodoPago.id(metodoPagoId);
    if (!metodoPago) {
      throw new Error('Método de pago no encontrado');
    }

    const metodosActivos = usuario.metodoPago.filter(metodo => metodo.activo);
    if (metodosActivos.length === 1 && metodoPago.activo) {
      throw new Error('No se puede eliminar el único método de pago activo');
    }

    usuario.metodoPago.pull(metodoPagoId);
    const usuarioActualizado = await usuario.save();

    await redisClient.del(_getUsuarioRedisKey(usuarioId));

    console.log('🟢 [Repository] Método de pago eliminado exitosamente');
    return usuarioActualizado;

  } catch (error) {
    console.error('🔴 [Repository] Error eliminando método de pago:', error);
    throw error;
  }
};

const setDefaultMetodoPago = async (usuarioId, metodoPagoId) => {
  const redisClient = connectToRedis();

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const metodoPago = usuario.metodoPago.id(metodoPagoId);
    if (!metodoPago) {
      throw new Error('Método de pago no encontrado');
    }

    if (!metodoPago.activo) {
      throw new Error('No se puede establecer como predeterminado un método de pago inactivo');
    }

    usuario.metodoPago.forEach(metodo => {
      metodo.predeterminado = false;
    });

    metodoPago.predeterminado = true;

    const usuarioActualizado = await usuario.save();
    await redisClient.del(_getUsuarioRedisKey(usuarioId));

    console.log('🟢 [Repository] Método de pago establecido como predeterminado');
    return usuarioActualizado;

  } catch (error) {
    console.error('🔴 [Repository] Error estableciendo método predeterminado:', error);
    throw error;
  }
};

const getMetodosPagoSeguros = (metodosPago) => {
  if (!metodosPago || !Array.isArray(metodosPago)) return [];

  return metodosPago.map(metodo => {
    const metodoSeguro = {
      _id: metodo._id,
      tipo: metodo.tipo,
      predeterminado: metodo.predeterminado,
      activo: metodo.activo,
      fechaCreacion: metodo.fechaCreacion
    };

    if (metodo.tipo === 'tarjeta_credito' || metodo.tipo === 'tarjeta_debito') {
      metodoSeguro.ultimosDigitos = metodo.ultimosDigitos;
      metodoSeguro.titular = metodo.titular;
      metodoSeguro.fechaVencimiento = metodo.fechaVencimiento;
      metodoSeguro.marca = metodo.marca;
    } else if (metodo.tipo === 'cuenta_bancaria') {
      metodoSeguro.banco = metodo.banco;
      metodoSeguro.ultimosDigitos = metodo.ultimosDigitos;
      metodoSeguro.titular = metodo.titular;
      metodoSeguro.tipoCuenta = metodo.tipoCuenta;
    }

    return metodoSeguro;
  });
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
  cambiarRolUsuario,
  addMetodoPago,
  updateMetodoPago,
  deleteMetodoPago,
  setDefaultMetodoPago,
  getMetodosPagoSeguros
};