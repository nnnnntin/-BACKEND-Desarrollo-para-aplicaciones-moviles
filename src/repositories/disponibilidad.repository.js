const Disponibilidad = require("../models/disponibilidad.model");

const getDisponibilidades = async (filtros = {}) => {
  return await Disponibilidad.find(filtros);
};

const findDisponibilidadById = async (id) => {
  return await Disponibilidad.findById(id);
};

const getDisponibilidadByEntidad = async (entidadId, tipoEntidad) => {
  return await Disponibilidad.find({
    entidadId,
    tipoEntidad
  }).sort({ fechaDisponibilidad: 1 });
};

const getDisponibilidadByFecha = async (entidadId, tipoEntidad, fecha) => {
  const fechaBusqueda = new Date(fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);

  const fechaFin = new Date(fechaBusqueda);
  fechaFin.setHours(23, 59, 59, 999);

  return await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaBusqueda,
      $lte: fechaFin
    }
  });
};

const getDisponibilidadEnRango = async (entidadId, tipoEntidad, fechaInicio, fechaFin) => {
  const fechaInicioObj = new Date(fechaInicio);
  fechaInicioObj.setHours(0, 0, 0, 0);

  const fechaFinObj = new Date(fechaFin);
  fechaFinObj.setHours(23, 59, 59, 999);

  return await Disponibilidad.find({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaInicioObj,
      $lte: fechaFinObj
    }
  }).sort({ fechaDisponibilidad: 1 });
};

const createDisponibilidad = async (disponibilidadData) => {
  const newDisponibilidad = new Disponibilidad(disponibilidadData);
  return await newDisponibilidad.save();
};

const updateDisponibilidad = async (id, payload) => {
  return await Disponibilidad.findByIdAndUpdate(id, payload, { new: true });
};

const deleteDisponibilidad = async (id) => {
  return await Disponibilidad.findByIdAndDelete(id);
};

const getFranjasDisponibles = async (entidadId, tipoEntidad, fecha) => {
  const disponibilidad = await getDisponibilidadByFecha(entidadId, tipoEntidad, fecha);

  if (!disponibilidad) {
    return [];
  }

  return disponibilidad.franjas.filter(franja => franja.disponible && !franja.bloqueado);
};

const reservarFranja = async (entidadId, tipoEntidad, fecha, horaInicio, horaFin, reservaId) => {
  const fechaBusqueda = new Date(fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fechaBusqueda);
  fechaFin.setHours(23, 59, 59, 999);

  let disponibilidad = await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaBusqueda,
      $lte: fechaFin
    }
  });

  if (!disponibilidad) {
    disponibilidad = await createDisponibilidad({
      entidadId,
      tipoEntidad,
      fechaDisponibilidad: fechaBusqueda,
      franjas: [
        { horaInicio, horaFin, disponible: true }
      ]
    });
  }

  const franjas = disponibilidad.franjas.map(franja => {
    if (franja.horaInicio === horaInicio && franja.horaFin === horaFin) {
      return {
        ...franja,
        disponible: false,
        reservaId
      };
    }

    const inicioFranja = convertirHoraAMinutos(franja.horaInicio);
    const finFranja = convertirHoraAMinutos(franja.horaFin);
    const inicioRes = convertirHoraAMinutos(horaInicio);
    const finRes = convertirHoraAMinutos(horaFin);

    if (
      (inicioFranja >= inicioRes && finFranja <= finRes) ||
      (inicioFranja <= inicioRes && finFranja >= inicioRes) ||
      (inicioFranja <= finRes && finFranja >= finRes)
    ) {
      return {
        ...franja,
        disponible: false,
        reservaId
      };
    }

    return franja;
  });

  return await Disponibilidad.findByIdAndUpdate(
    disponibilidad._id,
    { franjas },
    { new: true }
  );
};

const liberarFranja = async (entidadId, tipoEntidad, fecha, horaInicio, horaFin) => {
  const fechaBusqueda = new Date(fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fechaBusqueda);
  fechaFin.setHours(23, 59, 59, 999);

  let disponibilidad = await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaBusqueda,
      $lte: fechaFin
    }
  });

  if (!disponibilidad) {
    disponibilidad = new Disponibilidad({
      entidadId,
      tipoEntidad,
      fechaDisponibilidad: fechaBusqueda,
      franjas: [
        {
          horaInicio,
          horaFin,
          disponible: true,
          reservaId: null,
          bloqueado: false
        }
      ]
    });
    return await disponibilidad.save();
  }

  const franjasActualizadas = disponibilidad.franjas.map(franja => {
    if (
      franja.horaInicio === horaInicio &&
      franja.horaFin === horaFin &&
      !franja.bloqueado
    ) {
      return {
        ...franja._doc,
        disponible: true,
        reservaId: null
      };
    }
    return franja;
  });

  return await Disponibilidad.findByIdAndUpdate(
    disponibilidad._id,
    { franjas: franjasActualizadas },
    { new: true }
  );
};


const bloquearFranja = async (entidadId, tipoEntidad, fecha, horaInicio, horaFin, motivo) => {
  const fechaBusqueda = new Date(fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);

  const fechaFin = new Date(fechaBusqueda);
  fechaFin.setHours(23, 59, 59, 999);

  let disponibilidad = await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaBusqueda,
      $lte: fechaFin
    }
  });

  if (!disponibilidad) {
    disponibilidad = await createDisponibilidad({
      entidadId,
      tipoEntidad,
      fechaDisponibilidad: fechaBusqueda,
      franjas: []
    });
  }

  let franjaEncontrada = false;
  const franjas = disponibilidad.franjas.map(franja => {
    if (franja.horaInicio === horaInicio && franja.horaFin === horaFin) {
      franjaEncontrada = true;
      return {
        ...franja,
        disponible: false,
        bloqueado: true,
        motivo
      };
    }
    return franja;
  });

  if (!franjaEncontrada) {
    franjas.push({
      horaInicio,
      horaFin,
      disponible: false,
      bloqueado: true,
      motivo
    });
  }

  return await Disponibilidad.findByIdAndUpdate(
    disponibilidad._id,
    { franjas },
    { new: true }
  );
};

const desbloquearFranja = async (entidadId, tipoEntidad, fecha, horaInicio, horaFin) => {
  const fechaBusqueda = new Date(fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fechaBusqueda);
  fechaFin.setHours(23, 59, 59, 999);

  let disponibilidad = await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaBusqueda,
      $lte: fechaFin
    }
  });

  if (!disponibilidad) {
    return await createDisponibilidad({
      entidadId,
      tipoEntidad,
      fechaDisponibilidad: fechaBusqueda,
      franjas: [
        {
          horaInicio,
          horaFin,
          disponible: true,
          reservaId: null,
          bloqueado: false,
          motivo: ""
        }
      ]
    });
  }

  const franjasActualizadas = disponibilidad.franjas.map(franja => {
    if (franja.horaInicio === horaInicio && franja.horaFin === horaFin) {
      return {
        ...franja._doc,
        disponible: true,
        bloqueado: false,
        motivo: ""
      };
    }
    return franja;
  });

  return await Disponibilidad.findByIdAndUpdate(
    disponibilidad._id,
    { franjas: franjasActualizadas },
    { new: true }
  );
};

const crearDisponibilidadDiaria = async (entidadId, tipoEntidad, fechaInicio, fechaFin, franjasBase) => {
  const fechaInicioObj = new Date(fechaInicio);
  fechaInicioObj.setHours(0, 0, 0, 0);

  const fechaFinObj = new Date(fechaFin);
  fechaFinObj.setHours(23, 59, 59, 999);

  let fechaActual = new Date(fechaInicioObj);
  const disponibilidadesCreadas = [];

  while (fechaActual <= fechaFinObj) {
    const nuevaDisponibilidad = {
      entidadId,
      tipoEntidad,
      fechaDisponibilidad: new Date(fechaActual),
      franjas: franjasBase
    };

    const disponibilidadCreada = await createDisponibilidad(nuevaDisponibilidad);
    disponibilidadesCreadas.push(disponibilidadCreada);

    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return disponibilidadesCreadas;
};

function convertirHoraAMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

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