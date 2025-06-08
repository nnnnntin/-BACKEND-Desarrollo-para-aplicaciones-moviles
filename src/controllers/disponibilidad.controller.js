const {
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
} = require("../repositories/disponibilidad.repository");
const {
  createDisponibilidadSchema,
  updateDisponibilidadSchema,
  consultarDisponibilidadSchema,
  bloquearFranjaHorariaSchema
} = require("../routes/validations/disponibilidad.validation");

const { findOficinaById } = require("../repositories/oficina.repository");
const { findSalaReunionById } = require("../repositories/salaReunion.repository");
const { findEscritorioFlexibleById } = require("../repositories/escritorioFlexible.repository");
const { findReservaById } = require("../repositories/reserva.repository");

const ENTIDAD_MAP = {
  'oficina': findOficinaById,
  'sala_reunion': findSalaReunionById,
  'escritorio_flexible': findEscritorioFlexibleById
};

const TIPOS_ENTIDAD_VALIDOS = ['oficina', 'sala_reunion', 'escritorio_flexible'];

const validarEntidadExiste = async (tipoEntidad, entidadId) => {
  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return {
      valid: false,
      entity: null,
      message: `Tipo de entidad no válido: ${tipoEntidad}. Debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    };
  }

  const findEntidadById = ENTIDAD_MAP[tipoEntidad];
  
  try {
    const entidad = await findEntidadById(entidadId);
    
    if (!entidad) {
      return {
        valid: false,
        entity: null,
        message: `No se encontró la entidad de tipo ${tipoEntidad} con ID: ${entidadId}`
      };
    }

    return {
      valid: true,
      entity: entidad,
      message: 'Entidad válida'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        entity: null,
        message: `Formato de ID inválido para ${tipoEntidad}: ${entidadId}`
      };
    }
    throw error;
  }
};

/**
 * Valida que una reserva existe
 * @param {string} reservaId - ID de la reserva
 * @returns {Promise<Object>} - { valid: boolean, reserva: Object|null, message: string }
 */
const validarReservaExiste = async (reservaId) => {
  try {
    const reserva = await findReservaById(reservaId);
    
    if (!reserva) {
      return {
        valid: false,
        reserva: null,
        message: `No se encontró la reserva con ID: ${reservaId}`
      };
    }

    return {
      valid: true,
      reserva: reserva,
      message: 'Reserva válida'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        reserva: null,
        message: `Formato de ID de reserva inválido: ${reservaId}`
      };
    }
    throw error;
  }
};

const validarFranjaHoraria = (disponibilidad, fecha, horaInicio, horaFin) => {
  const fechaDisponibilidad = new Date(disponibilidad.fechaDisponibilidad);
  const fechaSolicitada = new Date(fecha);
  
  fechaDisponibilidad.setHours(0, 0, 0, 0);
  fechaSolicitada.setHours(0, 0, 0, 0);
  
  if (fechaDisponibilidad.getTime() !== fechaSolicitada.getTime()) {
    return {
      valid: false,
      franja: null,
      message: `La fecha solicitada (${fecha}) no coincide con la disponibilidad`
    };
  }

  const franja = disponibilidad.franjas.find(f => 
    f.horaInicio === horaInicio && f.horaFin === horaFin
  );

  if (!franja) {
    return {
      valid: false,
      franja: null,
      message: `No existe una franja horaria de ${horaInicio} a ${horaFin} en la fecha ${fecha}`
    };
  }

  return {
    valid: true,
    franja: franja,
    message: 'Franja horaria válida'
  };
};

const getDisponibilidadesController = async (req, res) => {
  const { skip = "0", limit = "10", ...filtros } = req.query;
  const skipNum = parseInt(skip, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(skipNum) || skipNum < 0) {
    return res.status(400).json({
      message: "Parámetro inválido",
      details: "`skip` debe ser un entero ≥ 0",
    });
  }
  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({
      message: "Parámetro inválido",
      details: "`limit` debe ser un entero ≥ 1",
    });
  }

  try {
    const disponibilidades = await getDisponibilidades(filtros, skipNum, limitNum);
    res.status(200).json(disponibilidades);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener disponibilidades",
      details: error.message,
    });
  }
};

const getDisponibilidadByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const disponibilidad = await findDisponibilidadById(id);
    if (!disponibilidad) {
      return res.status(404).json({
        message: `No se ha encontrado la disponibilidad con id: ${id}`
      });
    }
    res.status(200).json(disponibilidad);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de disponibilidad inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar la disponibilidad",
      details: error.message
    });
  }
};

const getDisponibilidadByEntidadController = async (req, res) => {
  const { entidadId, tipoEntidad } = req.params;

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  try {
    const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

    const disponibilidades = await getDisponibilidadByEntidad(entidadId, tipoEntidad);
    res.status(200).json(disponibilidades);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener disponibilidades por entidad",
      details: error.message
    });
  }
};

const getDisponibilidadByFechaController = async (req, res) => {
  const { entidadId, tipoEntidad, fecha } = req.query;

  if (!entidadId || !tipoEntidad || !fecha) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requiere entidadId, tipoEntidad y fecha"
    });
  }

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "La fecha debe tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

    const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

    const disponibilidad = await getDisponibilidadByFecha(entidadId, tipoEntidad, fecha);
    if (!disponibilidad) {
      return res.status(404).json({
        message: "Disponibilidad no encontrada",
        details: `No hay disponibilidad para la fecha: ${fecha}`
      });
    }
    res.status(200).json(disponibilidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener disponibilidad por fecha",
      details: error.message
    });
  }
};

const getDisponibilidadEnRangoController = async (req, res) => {
  const { entidadId, tipoEntidad, fechaInicio, fechaFin } = req.query;

  if (!entidadId || !tipoEntidad || !fechaInicio || !fechaFin) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requieren todos los parámetros: entidadId, tipoEntidad, fechaInicio y fechaFin"
    });
  }

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  try {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "Las fechas deben tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

    if (inicio > fin) {
      return res.status(400).json({
        message: "Rango de fechas inválido",
        details: "La fecha de inicio debe ser anterior a la fecha de fin"
      });
    }

    const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

    const disponibilidades = await getDisponibilidadEnRango(entidadId, tipoEntidad, fechaInicio, fechaFin);
    res.status(200).json(disponibilidades);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener disponibilidades en rango",
      details: error.message
    });
  }
};

const createDisponibilidadController = async (req, res) => {
  const { error, value } = createDisponibilidadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const validacionEntidad = await validarEntidadExiste(value.tipoEntidad, value.entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

    if (value.franjas && value.franjas.length > 0) {
      for (let i = 0; i < value.franjas.length; i++) {
        const franja = value.franjas[i];
        
        const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!horaRegex.test(franja.horaInicio) || !horaRegex.test(franja.horaFin)) {
          return res.status(400).json({
            message: "Formato de hora inválido",
            details: `Las horas de la franja ${i + 1} deben tener formato HH:MM (24h)`
          });
        }

        const [inicioHora, inicioMin] = franja.horaInicio.split(':').map(Number);
        const [finHora, finMin] = franja.horaFin.split(':').map(Number);
        
        if (inicioHora > finHora || (inicioHora === finHora && inicioMin >= finMin)) {
          return res.status(400).json({
            message: "Rango de horas inválido",
            details: `En la franja ${i + 1}, la hora de inicio debe ser anterior a la hora de fin`
          });
        }
      }
    }

    const disponibilidad = await createDisponibilidad(value);
    res.status(201).json({
      message: "Disponibilidad creada correctamente",
      disponibilidad,
      entidadValidada: {
        tipo: value.tipoEntidad,
        id: validacionEntidad.entity._id,
        nombre: validacionEntidad.entity.nombre || validacionEntidad.entity.codigo
      }
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Disponibilidad duplicada",
        details: "Ya existe una disponibilidad para esta entidad en la fecha especificada"
      });
    }

    res.status(500).json({
      message: "Error al crear la disponibilidad",
      details: error.message
    });
  }
};

const updateDisponibilidadController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateDisponibilidadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const disponibilidadExistente = await findDisponibilidadById(id);
    if (!disponibilidadExistente) {
      return res.status(404).json({
        message: `No se ha encontrado la disponibilidad con id: ${id}`
      });
    }

    if (value.entidadId && value.tipoEntidad) {
      const validacionEntidad = await validarEntidadExiste(value.tipoEntidad, value.entidadId);
      if (!validacionEntidad.valid) {
        return res.status(404).json({
          message: "Nueva entidad no encontrada",
          details: validacionEntidad.message
        });
      }
    }

    if (value.franjas && value.franjas.length > 0) {
      for (let i = 0; i < value.franjas.length; i++) {
        const franja = value.franjas[i];
        
        const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!horaRegex.test(franja.horaInicio) || !horaRegex.test(franja.horaFin)) {
          return res.status(400).json({
            message: "Formato de hora inválido",
            details: `Las horas de la franja ${i + 1} deben tener formato HH:MM (24h)`
          });
        }

        const [inicioHora, inicioMin] = franja.horaInicio.split(':').map(Number);
        const [finHora, finMin] = franja.horaFin.split(':').map(Number);
        
        if (inicioHora > finHora || (inicioHora === finHora && inicioMin >= finMin)) {
          return res.status(400).json({
            message: "Rango de horas inválido",
            details: `En la franja ${i + 1}, la hora de inicio debe ser anterior a la hora de fin`
          });
        }

        const franjaExistente = disponibilidadExistente.franjas.find(f => 
          f.horaInicio === franja.horaInicio && f.horaFin === franja.horaFin
        );
        
        if (franjaExistente && franjaExistente.reservaId && !franja.disponible) {
          return res.status(400).json({
            message: "Franja con reserva activa",
            details: `La franja de ${franja.horaInicio} a ${franja.horaFin} tiene una reserva activa y no puede ser modificada`
          });
        }
      }
    }

    const disponibilidad = await updateDisponibilidad(id, value);
    res.status(200).json({
      message: "Disponibilidad actualizada correctamente",
      disponibilidad
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de disponibilidad inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    res.status(500).json({
      message: "Error al actualizar la disponibilidad",
      details: error.message
    });
  }
};

const deleteDisponibilidadController = async (req, res) => {
  const { id } = req.params;
  try {
    const disponibilidadExistente = await findDisponibilidadById(id);
    if (!disponibilidadExistente) {
      return res.status(404).json({
        message: `No se ha encontrado la disponibilidad con id: ${id}`
      });
    }

    const franjasConReserva = disponibilidadExistente.franjas.filter(f => f.reservaId);
    if (franjasConReserva.length > 0) {
      return res.status(400).json({
        message: "Disponibilidad con reservas activas",
        details: `No se puede eliminar la disponibilidad porque tiene ${franjasConReserva.length} franja(s) con reservas asociadas`
      });
    }

    const disponibilidad = await deleteDisponibilidad(id);
    res.status(200).json({
      message: "Disponibilidad eliminada correctamente"
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de disponibilidad inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al eliminar la disponibilidad",
      details: error.message
    });
  }
};

const getFranjasDisponiblesController = async (req, res) => {
  const { entidadId, tipoEntidad, fecha } = req.query;

  if (!entidadId || !tipoEntidad || !fecha) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requiere entidadId, tipoEntidad y fecha"
    });
  }

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "La fecha debe tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

    const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

    const franjas = await getFranjasDisponibles(entidadId, tipoEntidad, fecha);
    res.status(200).json({
      franjas,
      entidad: {
        tipo: tipoEntidad,
        id: validacionEntidad.entity._id,
        nombre: validacionEntidad.entity.nombre || validacionEntidad.entity.codigo
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener franjas disponibles",
      details: error.message
    });
  }
};

const reservarFranjaController = async (req, res) => {
  const { entidadId, tipoEntidad, fecha, horaInicio, horaFin, reservaId } = req.body;

  if (!entidadId || !tipoEntidad || !fecha || !horaInicio || !horaFin || !reservaId) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren todos los campos: entidadId, tipoEntidad, fecha, horaInicio, horaFin y reservaId"
    });
  }

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
    return res.status(400).json({
      message: "Formato de hora inválido",
      details: "Las horas deben tener formato HH:MM (24h)"
    });
  }

  const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
  const [finHora, finMin] = horaFin.split(':').map(Number);

  if (inicioHora > finHora || (inicioHora === finHora && inicioMin >= finMin)) {
    return res.status(400).json({
      message: "Rango de horas inválido",
      details: "La hora de inicio debe ser anterior a la hora de fin"
    });
  }

  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "La fecha debe tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

        const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

        const validacionReserva = await validarReservaExiste(reservaId);
    if (!validacionReserva.valid) {
      return res.status(404).json({
        message: "Reserva no encontrada",
        details: validacionReserva.message
      });
    }

        const disponibilidad = await getDisponibilidadByFecha(entidadId, tipoEntidad, fecha);
    if (!disponibilidad) {
      return res.status(404).json({
        message: "Disponibilidad no encontrada",
        details: `No existe disponibilidad para la fecha ${fecha}`
      });
    }

        const validacionFranja = validarFranjaHoraria(disponibilidad, fecha, horaInicio, horaFin);
    if (!validacionFranja.valid) {
      return res.status(400).json({
        message: "Franja horaria inválida",
        details: validacionFranja.message
      });
    }

        if (!validacionFranja.franja.disponible) {
      return res.status(400).json({
        message: "Franja no disponible",
        details: `La franja de ${horaInicio} a ${horaFin} no está disponible`
      });
    }

        if (validacionFranja.franja.bloqueado) {
      return res.status(400).json({
        message: "Franja bloqueada",
        details: `La franja de ${horaInicio} a ${horaFin} está bloqueada${validacionFranja.franja.motivo ? `: ${validacionFranja.franja.motivo}` : ''}`
      });
    }

        if (validacionFranja.franja.reservaId) {
      return res.status(400).json({
        message: "Franja ya reservada",
        details: `La franja de ${horaInicio} a ${horaFin} ya tiene una reserva asociada`
      });
    }

        if (validacionReserva.reserva.entidadReservada) {
      const entidadReserva = validacionReserva.reserva.entidadReservada;
      if (entidadReserva.tipo !== tipoEntidad || entidadReserva.id.toString() !== entidadId) {
        return res.status(400).json({
          message: "Reserva no corresponde a la entidad",
          details: "La reserva especificada no corresponde a la entidad que se quiere reservar"
        });
      }
    }

    const disponibilidadActualizada = await reservarFranja(entidadId, tipoEntidad, fecha, horaInicio, horaFin, reservaId);
    res.status(200).json({
      message: "Franja horaria reservada correctamente",
      disponibilidad: disponibilidadActualizada,
      reserva: {
        id: validacionReserva.reserva._id,
        usuario: validacionReserva.reserva.usuarioId,
        estado: validacionReserva.reserva.estado
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al reservar la franja horaria",
      details: error.message
    });
  }
};

const liberarFranjaController = async (req, res) => {
  const { entidadId, tipoEntidad, fecha, horaInicio, horaFin } = req.body;

  if (!entidadId || !tipoEntidad || !fecha || !horaInicio || !horaFin) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren todos los campos: entidadId, tipoEntidad, fecha, horaInicio y horaFin"
    });
  }

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
    return res.status(400).json({
      message: "Formato de hora inválido",
      details: "Las horas deben tener formato HH:MM (24h)"
    });
  }

  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "La fecha debe tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

        const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

        const disponibilidad = await getDisponibilidadByFecha(entidadId, tipoEntidad, fecha);
    if (!disponibilidad) {
      return res.status(404).json({
        message: "Disponibilidad no encontrada",
        details: `No existe disponibilidad para la fecha ${fecha}`
      });
    }

        const validacionFranja = validarFranjaHoraria(disponibilidad, fecha, horaInicio, horaFin);
    if (!validacionFranja.valid) {
      return res.status(400).json({
        message: "Franja horaria inválida",
        details: validacionFranja.message
      });
    }

        if (validacionFranja.franja.bloqueado) {
      return res.status(400).json({
        message: "Franja bloqueada",
        details: `No se puede liberar la franja de ${horaInicio} a ${horaFin} porque está bloqueada${validacionFranja.franja.motivo ? `: ${validacionFranja.franja.motivo}` : ''}`
      });
    }

        if (!validacionFranja.franja.reservaId) {
      return res.status(400).json({
        message: "Franja no reservada",
        details: `La franja de ${horaInicio} a ${horaFin} no tiene ninguna reserva asociada`
      });
    }

    const reservaIdAnterior = validacionFranja.franja.reservaId;
    const disponibilidadActualizada = await liberarFranja(entidadId, tipoEntidad, fecha, horaInicio, horaFin);
    res.status(200).json({
      message: "Franja horaria liberada correctamente",
      disponibilidad: disponibilidadActualizada,
      reservaLiberada: reservaIdAnterior
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al liberar la franja horaria",
      details: error.message
    });
  }
};

const bloquearFranjaController = async (req, res) => {
  const { error, value } = bloquearFranjaHorariaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const {
    entidadId,
    tipoEntidad,
    fecha,
    horaInicio,
    horaFin,
    motivo,
    recurrente,
    diasRecurrencia,
    fechaFinRecurrencia
  } = value;

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  if (recurrente) {
    if (!Array.isArray(diasRecurrencia) || diasRecurrencia.length === 0) {
      return res.status(400).json({
        message: "Días de recurrencia inválidos",
        details: "Se requiere al menos un día de recurrencia"
      });
    }

    const diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const diasInvalidos = diasRecurrencia.filter(dia => !diasValidos.includes(dia));

    if (diasInvalidos.length > 0) {
      return res.status(400).json({
        message: "Días no válidos",
        details: `Los siguientes días no son válidos: ${diasInvalidos.join(', ')}`
      });
    }

    if (!fechaFinRecurrencia) {
      return res.status(400).json({
        message: "Fecha fin recurrencia requerida",
        details: "Para bloqueos recurrentes se requiere una fecha de fin de recurrencia"
      });
    }

    const fechaFinObj = new Date(fechaFinRecurrencia);
    if (isNaN(fechaFinObj.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha fin inválido",
        details: "La fecha de fin debe tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

    const fechaInicioObj = new Date(fecha);
    if (fechaInicioObj > fechaFinObj) {
      return res.status(400).json({
        message: "Rango de fechas inválido",
        details: "La fecha de inicio debe ser anterior a la fecha de fin de recurrencia"
      });
    }
  }

  try {
        const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

    if (recurrente) {
      const fechaInicio = new Date(fecha);
      const fechaFin = new Date(fechaFinRecurrencia);

      const diasSemana = {
        'lunes': 1,
        'martes': 2,
        'miércoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sábado': 6,
        'domingo': 0
      };

      const diasSeleccionadosNumeros = diasRecurrencia.map(dia => diasSemana[dia]);
      const bloqueos = [];
      const errores = [];

      for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.getDay();

        if (diasSeleccionadosNumeros.includes(diaSemana)) {
          try {
                        const disponibilidad = await getDisponibilidadByFecha(entidadId, tipoEntidad, d);
            if (disponibilidad) {
              const validacionFranja = validarFranjaHoraria(disponibilidad, d, horaInicio, horaFin);
              
              if (validacionFranja.valid) {
                                if (validacionFranja.franja.reservaId) {
                  errores.push({
                    fecha: d.toISOString().split('T')[0],
                    error: 'Franja con reserva activa'
                  });
                  continue;
                }
                
                                if (validacionFranja.franja.bloqueado) {
                  errores.push({
                    fecha: d.toISOString().split('T')[0],
                    error: 'Franja ya bloqueada'
                  });
                  continue;
                }
              }
            }

            const disponibilidadBloqueada = await bloquearFranja(
              entidadId,
              tipoEntidad,
              new Date(d),
              horaInicio,
              horaFin,
              motivo
            );
            if (disponibilidadBloqueada) {
              bloqueos.push(disponibilidadBloqueada);
            }
          } catch (bloqueoError) {
            errores.push({
              fecha: d.toISOString().split('T')[0],
              error: bloqueoError.message
            });
          }
        }
      }

      if (bloqueos.length === 0) {
        return res.status(400).json({
          message: "No se pudo bloquear ninguna franja",
          details: "No se pudieron bloquear las franjas en los días seleccionados",
          errores: errores.length > 0 ? errores : undefined
        });
      }

      res.status(200).json({
        message: "Franjas horarias bloqueadas correctamente",
        totalBloqueados: bloqueos.length,
        totalDias: Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1,
        diasSeleccionados: diasRecurrencia,
        errores: errores.length > 0 ? errores : undefined
      });
    } else {
            const disponibilidad = await getDisponibilidadByFecha(entidadId, tipoEntidad, fecha);
      if (!disponibilidad) {
                const disponibilidadBloqueada = await bloquearFranja(entidadId, tipoEntidad, fecha, horaInicio, horaFin, motivo);
        return res.status(200).json({
          message: "Franja horaria bloqueada correctamente (se creó nueva disponibilidad)",
          disponibilidad: disponibilidadBloqueada
        });
      }

            const validacionFranja = validarFranjaHoraria(disponibilidad, fecha, horaInicio, horaFin);
      if (validacionFranja.valid) {
                if (validacionFranja.franja.reservaId) {
          return res.status(400).json({
            message: "Franja con reserva activa",
            details: `La franja de ${horaInicio} a ${horaFin} tiene una reserva y no puede ser bloqueada`
          });
        }

                if (validacionFranja.franja.bloqueado) {
          return res.status(400).json({
            message: "Franja ya bloqueada",
            details: `La franja de ${horaInicio} a ${horaFin} ya está bloqueada${validacionFranja.franja.motivo ? `: ${validacionFranja.franja.motivo}` : ''}`
          });
        }
      }

      const disponibilidadBloqueada = await bloquearFranja(entidadId, tipoEntidad, fecha, horaInicio, horaFin, motivo);
      res.status(200).json({
        message: "Franja horaria bloqueada correctamente",
        disponibilidad: disponibilidadBloqueada
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al bloquear la franja horaria",
      details: error.message
    });
  }
};

const desbloquearFranjaController = async (req, res) => {
  const { entidadId, tipoEntidad, fecha, horaInicio, horaFin } = req.body;

  if (!entidadId || !tipoEntidad || !fecha || !horaInicio || !horaFin) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren todos los campos: entidadId, tipoEntidad, fecha, horaInicio y horaFin"
    });
  }

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
    return res.status(400).json({
      message: "Formato de hora inválido",
      details: "Las horas deben tener formato HH:MM (24h)"
    });
  }

  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "La fecha debe tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

        const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

        const disponibilidad = await getDisponibilidadByFecha(entidadId, tipoEntidad, fecha);
    if (!disponibilidad) {
      return res.status(404).json({
        message: "Disponibilidad no encontrada",
        details: `No existe disponibilidad para la fecha ${fecha}`
      });
    }

        const validacionFranja = validarFranjaHoraria(disponibilidad, fecha, horaInicio, horaFin);
    if (!validacionFranja.valid) {
      return res.status(400).json({
        message: "Franja horaria inválida",
        details: validacionFranja.message
      });
    }

        if (!validacionFranja.franja.bloqueado) {
      return res.status(400).json({
        message: "Franja no bloqueada",
        details: `La franja de ${horaInicio} a ${horaFin} no está bloqueada`
      });
    }

    const disponibilidadDesbloqueada = await desbloquearFranja(entidadId, tipoEntidad, fecha, horaInicio, horaFin);
    res.status(200).json({
      message: "Franja horaria desbloqueada correctamente",
      disponibilidad: disponibilidadDesbloqueada,
      motivoAnterior: validacionFranja.franja.motivo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al desbloquear la franja horaria",
      details: error.message
    });
  }
};

const crearDisponibilidadDiariaController = async (req, res) => {
  const { entidadId, tipoEntidad, fechaInicio, fechaFin, franjasBase } = req.body;

  if (!entidadId || !tipoEntidad || !fechaInicio || !fechaFin || !franjasBase || !Array.isArray(franjasBase)) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren todos los campos: entidadId, tipoEntidad, fechaInicio, fechaFin y franjasBase (array)"
    });
  }

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  for (const franja of franjasBase) {
    if (!franja.horaInicio || !franja.horaFin) {
      return res.status(400).json({
        message: "Franja inválida",
        details: "Cada franja debe tener horaInicio y horaFin"
      });
    }

    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(franja.horaInicio) || !horaRegex.test(franja.horaFin)) {
      return res.status(400).json({
        message: "Formato de hora inválido",
        details: "Las horas deben tener formato HH:MM (24h)"
      });
    }

    const [inicioHora, inicioMin] = franja.horaInicio.split(':').map(Number);
    const [finHora, finMin] = franja.horaFin.split(':').map(Number);

    if (inicioHora > finHora || (inicioHora === finHora && inicioMin >= finMin)) {
      return res.status(400).json({
        message: "Rango de horas inválido",
        details: `La hora de inicio ${franja.horaInicio} debe ser anterior a la hora de fin ${franja.horaFin}`
      });
    }
  }

  try {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "Las fechas deben tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

    if (inicio > fin) {
      return res.status(400).json({
        message: "Rango de fechas inválido",
        details: "La fecha de inicio debe ser anterior a la fecha de fin"
      });
    }

        const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

        for (let i = 0; i < franjasBase.length; i++) {
      for (let j = i + 1; j < franjasBase.length; j++) {
        const franja1 = franjasBase[i];
        const franja2 = franjasBase[j];
        
        const inicio1 = parseInt(franja1.horaInicio.split(':').join(''));
        const fin1 = parseInt(franja1.horaFin.split(':').join(''));
        const inicio2 = parseInt(franja2.horaInicio.split(':').join(''));
        const fin2 = parseInt(franja2.horaFin.split(':').join(''));
        
        if ((inicio1 < fin2 && fin1 > inicio2)) {
          return res.status(400).json({
            message: "Franjas solapadas",
            details: `Las franjas ${franja1.horaInicio}-${franja1.horaFin} y ${franja2.horaInicio}-${franja2.horaFin} se solapan`
          });
        }
      }
    }

    const disponibilidades = await crearDisponibilidadDiaria(entidadId, tipoEntidad, fechaInicio, fechaFin, franjasBase);
    res.status(201).json({
      message: "Disponibilidades diarias creadas correctamente",
      total: disponibilidades.length,
      periodo: `Del ${new Date(fechaInicio).toLocaleDateString()} al ${new Date(fechaFin).toLocaleDateString()}`,
      entidad: {
        tipo: tipoEntidad,
        id: validacionEntidad.entity._id,
        nombre: validacionEntidad.entity.nombre || validacionEntidad.entity.codigo
      },
      disponibilidades: disponibilidades.map(d => ({
        id: d._id,
        fecha: d.fechaDisponibilidad,
        totalFranjas: d.franjas.length
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al crear disponibilidades diarias",
      details: error.message
    });
  }
};

const consultarDisponibilidadController = async (req, res) => {
  const { error, value } = consultarDisponibilidadSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los parámetros",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { entidadId, tipoEntidad, fechaInicio, fechaFin, horaInicio, horaFin } = value;

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `El tipo de entidad debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    });
  }

  if (horaInicio && horaFin) {
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
      return res.status(400).json({
        message: "Formato de hora inválido",
        details: "Las horas deben tener formato HH:MM (24h)"
      });
    }

    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [finHora, finMin] = horaFin.split(':').map(Number);

    if (inicioHora > finHora || (inicioHora === finHora && inicioMin >= finMin)) {
      return res.status(400).json({
        message: "Rango de horas inválido",
        details: "La hora de inicio debe ser anterior a la hora de fin"
      });
    }
  }

  try {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "Las fechas deben tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

    if (inicio > fin) {
      return res.status(400).json({
        message: "Rango de fechas inválido",
        details: "La fecha de inicio debe ser anterior a la fecha de fin"
      });
    }

        const validacionEntidad = await validarEntidadExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

    const disponibilidades = await getDisponibilidadEnRango(entidadId, tipoEntidad, fechaInicio, fechaFin);

    if (horaInicio && horaFin) {
      const disponibilidadesFiltradas = disponibilidades.map(disp => {
        const franjas = disp.franjas.filter(franja => {
          return (
            franja.disponible &&
            !franja.bloqueado &&
            franja.horaInicio >= horaInicio &&
            franja.horaFin <= horaFin
          );
        });

        return {
          ...disp,
          franjas,
          totalFranjasDisponibles: franjas.length
        };
      });

      res.status(200).json({
        entidad: {
          tipo: tipoEntidad,
          id: validacionEntidad.entity._id,
          nombre: validacionEntidad.entity.nombre || validacionEntidad.entity.codigo
        },
        periodo: {
          desde: fechaInicio,
          hasta: fechaFin,
          horaInicio: horaInicio,
          horaFin: horaFin
        },
        disponibilidades: disponibilidadesFiltradas
      });
    } else {
      res.status(200).json({
        entidad: {
          tipo: tipoEntidad,
          id: validacionEntidad.entity._id,
          nombre: validacionEntidad.entity.nombre || validacionEntidad.entity.codigo
        },
        periodo: {
          desde: fechaInicio,
          hasta: fechaFin
        },
        disponibilidades
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al consultar disponibilidad",
      details: error.message
    });
  }
};

module.exports = {
  getDisponibilidadesController,
  getDisponibilidadByIdController,
  getDisponibilidadByEntidadController,
  getDisponibilidadByFechaController,
  getDisponibilidadEnRangoController,
  createDisponibilidadController,
  updateDisponibilidadController,
  deleteDisponibilidadController,
  getFranjasDisponiblesController,
  reservarFranjaController,
  liberarFranjaController,
  bloquearFranjaController,
  desbloquearFranjaController,
  crearDisponibilidadDiariaController,
  consultarDisponibilidadController
};