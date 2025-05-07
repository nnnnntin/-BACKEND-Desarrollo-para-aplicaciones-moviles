const Disponibilidad = require("../models/disponibilidad.model");
const connectToRedis = require("../services/redis.service");

const _getDisponibilidadesRedisKey = (id) => `id:${id}-disponibilidades`;
const _getDisponibilidadesFilterRedisKey = (filtros, skip, limit) => `disponibilidades:${JSON.stringify({ filtros, skip, limit })}`;

const getDisponibilidades = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getDisponibilidadesFilterRedisKey(filtros, skip, limit);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);
      if (typeof cached === "object" && cached !== null) {
        return cached;
      }
      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {
          console.log(parseError);
        }
      }
    }

    console.log("[Mongo] getDisponibilidades con paginación");
    const result = await Disponibilidad
      .find(filtros)
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (error) {
    console.log("[Error Redis] leyendo desde Mongo sin paginación", error);
    return await Disponibilidad
      .find(filtros)
      .skip(skip)
      .limit(limit)
      .lean();
  }
};

const findDisponibilidadById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getDisponibilidadesRedisKey(id);
  
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
    
    console.log("[Leyendo findDisponibilidadById desde MongoDB]");
    const doc = await Disponibilidad.findById(id).lean();
    if (doc) {
      await redisClient.set(key, JSON.stringify(doc), { ex: 3600 });
    }
    
    return doc;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await Disponibilidad.findById(id).lean();
  }
};

const getDisponibilidadByEntidad = async (entidadId, tipoEntidad) =>
  await Disponibilidad.find({ entidadId, tipoEntidad }).sort({ fechaDisponibilidad: 1 }).lean();

const getDisponibilidadByFecha = async (entidadId, tipoEntidad, fecha) => {
  const fechaBusqueda = new Date(fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fechaBusqueda);
  fechaFin.setHours(23, 59, 59, 999);

  return await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: { $gte: fechaBusqueda, $lte: fechaFin }
  }).lean();
};

const getDisponibilidadEnRango = async (entidadId, tipoEntidad, fechaInicio, fechaFin) => {
  const fechaIni = new Date(fechaInicio);
  fechaIni.setHours(0, 0, 0, 0);
  const fechaFn = new Date(fechaFin);
  fechaFn.setHours(23, 59, 59, 999);

  return await Disponibilidad.find({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: { $gte: fechaIni, $lte: fechaFn }
  }).sort({ fechaDisponibilidad: 1 }).lean();
};

const createDisponibilidad = async (disponibilidadData) => {
  const redisClient = connectToRedis();
  const newDoc = new Disponibilidad(disponibilidadData);
  const saved = await newDoc.save();
  await redisClient.del(_getDisponibilidadesRedisKey(saved._id.toString()));
  return saved;
};

const updateDisponibilidad = async (id, payload) => {
  const updated = await Disponibilidad.findByIdAndUpdate(id, payload, { new: true });
  const redisClient = connectToRedis();
  await redisClient.del(_getDisponibilidadesRedisKey(id));
  return updated;
};

const deleteDisponibilidad = async (id) => {
  const redisClient = connectToRedis();
  const removed = await Disponibilidad.findByIdAndDelete(id);
  await redisClient.del(_getDisponibilidadesRedisKey(id));
  return removed;
};

function convertirHoraAMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

const getFranjasDisponibles = async (entidadId, tipoEntidad, fecha) => {
  const dispo = await getDisponibilidadByFecha(entidadId, tipoEntidad, fecha);
  return dispo ? dispo.franjas.filter(f => f.disponible && !f.bloqueado) : [];
};

const reservarFranja = async (entidadId, tipoEntidad, fecha, horaInicio, horaFin, reservaId) => {
  const fechaB = new Date(fecha); fechaB.setHours(0,0,0,0);
  const fechaF = new Date(fechaB); fechaF.setHours(23,59,59,999);

  let dispo = await Disponibilidad.findOne({ entidadId, tipoEntidad, fechaDisponibilidad: { $gte: fechaB, $lte: fechaF } });

  if (!dispo) {
    dispo = await createDisponibilidad({ entidadId, tipoEntidad, fechaDisponibilidad: fechaB, franjas: [{ horaInicio, horaFin, disponible: true }] });
  }

  const franjas = dispo.franjas.map(f => {
    const iniF = convertirHoraAMinutos(f.horaInicio);
    const finF = convertirHoraAMinutos(f.horaFin);
    const iniR = convertirHoraAMinutos(horaInicio);
    const finR = convertirHoraAMinutos(horaFin);

    if (f.horaInicio === horaInicio && f.horaFin === horaFin) {
      return { ...f, disponible: false, reservaId };
    }
    if ((iniF >= iniR && finF <= finR) || (iniF <= iniR && finF >= iniR) || (iniF <= finR && finF >= finR)) {
      return { ...f, disponible: false, reservaId };
    }
    return f;
  });

  const updated = await Disponibilidad.findByIdAndUpdate(dispo._id, { franjas }, { new: true });
  const redisClient = connectToRedis();
  await redisClient.del(_getDisponibilidadesRedisKey(dispo._id.toString()));
  return updated;
};

const liberarFranja = async (entidadId, tipoEntidad, fecha, horaInicio, horaFin) => {
  const fechaB = new Date(fecha); fechaB.setHours(0,0,0,0);
  const fechaF = new Date(fechaB); fechaF.setHours(23,59,59,999);

  let dispo = await Disponibilidad.findOne({ entidadId, tipoEntidad, fechaDisponibilidad: { $gte: fechaB, $lte: fechaF } });

  if (!dispo) {
    const saved = await createDisponibilidad({ entidadId, tipoEntidad, fechaDisponibilidad: fechaB, franjas: [{ horaInicio, horaFin, disponible: true, reservaId: null, bloqueado: false }] });
    return saved;
  }

  const franjas = dispo.franjas.map(f => {
    if (f.horaInicio === horaInicio && f.horaFin === horaFin && !f.bloqueado) {
      return { ...f._doc, disponible: true, reservaId: null };
    }
    return f;
  });

  const updated = await Disponibilidad.findByIdAndUpdate(dispo._id, { franjas }, { new: true });
  const redisClient = connectToRedis();
  await redisClient.del(_getDisponibilidadesRedisKey(dispo._id.toString()));
  return updated;
};

const bloquearFranja = async (entidadId, tipoEntidad, fecha, horaInicio, horaFin, motivo) => {
  const fechaB = new Date(fecha); fechaB.setHours(0,0,0,0);
  const fechaF = new Date(fechaB); fechaF.setHours(23,59,59,999);

  let dispo = await Disponibilidad.findOne({ entidadId, tipoEntidad, fechaDisponibilidad: { $gte: fechaB, $lte: fechaF } });
  if (!dispo) dispo = await createDisponibilidad({ entidadId, tipoEntidad, fechaDisponibilidad: fechaB, franjas: [] });

  let found = false;
  const franjas = dispo.franjas.map(f => {
    if (f.horaInicio === horaInicio && f.horaFin === horaFin) {
      found = true;
      return { ...f, disponible: false, bloqueado: true, motivo };
    }
    return f;
  });
  if (!found) franjas.push({ horaInicio, horaFin, disponible: false, bloqueado: true, motivo });

  const updated = await Disponibilidad.findByIdAndUpdate(dispo._id, { franjas }, { new: true });
  const redisClient = connectToRedis();
  await redisClient.del(_getDisponibilidadesRedisKey(dispo._id.toString()));
  return updated;
};

const desbloquearFranja = async (entidadId, tipoEntidad, fecha, horaInicio, horaFin) => {
  const fechaB = new Date(fecha); fechaB.setHours(0,0,0,0);
  const fechaF = new Date(fechaB); fechaF.setHours(23,59,59,999);

  let dispo = await Disponibilidad.findOne({ entidadId, tipoEntidad, fechaDisponibilidad: { $gte: fechaB, $lte: fechaF } });
  if (!dispo) {
    const saved = await createDisponibilidad({ entidadId, tipoEntidad, fechaDisponibilidad: fechaB, franjas: [{ horaInicio, horaFin, disponible: true, reservaId: null, bloqueado: false, motivo: "" }] });
    return saved;
  }

  const franjas = dispo.franjas.map(f => {
    if (f.horaInicio === horaInicio && f.horaFin === horaFin) {
      return { ...f._doc, disponible: true, bloqueado: false, motivo: "" };
    }
    return f;
  });

  const updated = await Disponibilidad.findByIdAndUpdate(dispo._id, { franjas }, { new: true });
  const redisClient = connectToRedis();
  await redisClient.del(_getDisponibilidadesRedisKey(dispo._id.toString()));
  return updated;
};

const crearDisponibilidadDiaria = async (entidadId, tipoEntidad, fechaInicio, fechaFin, franjasBase) => {
  const fechaIni = new Date(fechaInicio);
  fechaIni.setHours(0, 0, 0, 0);
  const fechaFn = new Date(fechaFin);
  fechaFn.setHours(23, 59, 59, 999);
  const creadas = [];
  let curr = new Date(fechaIni);

  while (curr <= fechaFn) {
    const dispon = { entidadId, tipoEntidad, fechaDisponibilidad: new Date(curr), franjas: franjasBase };
    const saved = await createDisponibilidad(dispon);
    creadas.push(saved);
    curr.setDate(curr.getDate() + 1);
  }

  return creadas;
};

module.exports = {
  getDisponibilidades,
  findDisponibilidadById,
  getDisponibilidadByEntidad,
  getDisponibilidadByFecha,
  getDisponibilidadEnRango,
  createDisponibilidad,
  updateDisponibilidad,
  deleteDisponibilidad,
  getFranjasDisponibles,
  reservarFranja,
  liberarFranja,
  bloquearFranja,
  desbloquearFranja,
  crearDisponibilidadDiaria
};