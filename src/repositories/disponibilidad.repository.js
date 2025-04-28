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
  // Convertir fecha a objeto Date si es string
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
  
  // Buscar la disponibilidad para esa fecha
  const disponibilidad = await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaBusqueda,
      $lte: fechaFin
    }
  });
  
  if (!disponibilidad) {
    return null;
  }
  
  // Actualizar las franjas afectadas
  const franjas = disponibilidad.franjas.map(franja => {
    // Si la franja coincide exactamente con el horario solicitado
    if (franja.horaInicio === horaInicio && franja.horaFin === horaFin) {
      return {
        ...franja,
        disponible: false,
        reservaId
      };
    }
    
    // Si la franja está dentro del horario solicitado
    const franjaInicio = convertirHoraAMinutos(franja.horaInicio);
    const franjaFin = convertirHoraAMinutos(franja.horaFin);
    const reservaInicio = convertirHoraAMinutos(horaInicio);
    const reservaFin = convertirHoraAMinutos(horaFin);
    
    if (
      (franjaInicio >= reservaInicio && franjaFin <= reservaFin) ||
      (franjaInicio <= reservaInicio && franjaFin >= reservaInicio) ||
      (franjaInicio <= reservaFin && franjaFin >= reservaFin)
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
  
  // Buscar la disponibilidad para esa fecha
  const disponibilidad = await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaBusqueda,
      $lte: fechaFin
    }
  });
  
  if (!disponibilidad) {
    return null;
  }
  
  // Actualizar las franjas afectadas
  const franjas = disponibilidad.franjas.map(franja => {
    // Si la franja coincide con el horario a liberar y no está bloqueada por otros motivos
    if (
      franja.horaInicio === horaInicio && 
      franja.horaFin === horaFin && 
      !franja.bloqueado
    ) {
      return {
        ...franja,
        disponible: true,
        reservaId: null
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

const bloquearFranja = async (entidadId, tipoEntidad, fecha, horaInicio, horaFin, motivo) => {
  const fechaBusqueda = new Date(fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);
  
  const fechaFin = new Date(fechaBusqueda);
  fechaFin.setHours(23, 59, 59, 999);
  
  // Buscar la disponibilidad para esa fecha
  let disponibilidad = await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaBusqueda,
      $lte: fechaFin
    }
  });
  
  // Si no existe, crearla
  if (!disponibilidad) {
    disponibilidad = await createDisponibilidad({
      entidadId,
      tipoEntidad,
      fechaDisponibilidad: fechaBusqueda,
      franjas: []
    });
  }
  
  // Actualizar las franjas afectadas o agregar nueva franja bloqueada
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
  
  // Buscar la disponibilidad para esa fecha
  const disponibilidad = await Disponibilidad.findOne({
    entidadId,
    tipoEntidad,
    fechaDisponibilidad: {
      $gte: fechaBusqueda,
      $lte: fechaFin
    }
  });
  
  if (!disponibilidad) {
    return null;
  }
  
  // Actualizar las franjas afectadas
  const franjas = disponibilidad.franjas.map(franja => {
    if (franja.horaInicio === horaInicio && franja.horaFin === horaFin) {
      return {
        ...franja,
        disponible: true,
        bloqueado: false,
        motivo: ''
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
    
    // Avanzar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  
  return disponibilidadesCreadas;
};

// Función auxiliar para convertir hora en formato "HH:MM" a minutos
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