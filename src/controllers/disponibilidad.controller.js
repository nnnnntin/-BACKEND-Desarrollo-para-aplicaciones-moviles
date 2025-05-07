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
  const {
    id
  } = req.params;
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
  const {
    entidadId,
    tipoEntidad
  } = req.params;

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
    });
  }

  try {
    const disponibilidades = await getDisponibilidadByEntidad(entidadId, tipoEntidad);
    res.status(200).json(disponibilidades);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrada') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: `No existe una entidad del tipo ${tipoEntidad} con id: ${entidadId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener disponibilidades por entidad",
      details: error.message
    });
  }
};

const getDisponibilidadByFechaController = async (req, res) => {
  const {
    entidadId,
    tipoEntidad,
    fecha
  } = req.query;

  if (!entidadId || !tipoEntidad || !fecha) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requiere entidadId, tipoEntidad y fecha"
    });
  }

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
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

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({
        message: "Error en la fecha",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener disponibilidad por fecha",
      details: error.message
    });
  }
};

const getDisponibilidadEnRangoController = async (req, res) => {
  const {
    entidadId,
    tipoEntidad,
    fechaInicio,
    fechaFin
  } = req.query;

  if (!entidadId || !tipoEntidad || !fechaInicio || !fechaFin) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requieren todos los parámetros: entidadId, tipoEntidad, fechaInicio y fechaFin"
    });
  }

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
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

    const disponibilidades = await getDisponibilidadEnRango(entidadId, tipoEntidad, fechaInicio, fechaFin);
    res.status(200).json(disponibilidades);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrada') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: `No existe una entidad del tipo ${tipoEntidad} con id: ${entidadId}`
      });
    }

    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({
        message: "Error en las fechas",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener disponibilidades en rango",
      details: error.message
    });
  }
};

const createDisponibilidadController = async (req, res) => {
  const {
    error,
    value
  } = createDisponibilidadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const disponibilidad = await createDisponibilidad(value);
    res.status(201).json({
      message: "Disponibilidad creada correctamente",
      disponibilidad
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

    if (error.message && error.message.includes('entidad no encontrada') || error.message.includes('entity not found')) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: "La entidad especificada no existe"
      });
    }

    if (error.message && error.message.includes('franjas')) {
      return res.status(400).json({
        message: "Error en franjas horarias",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al crear la disponibilidad",
      details: error.message
    });
  }
};

const updateDisponibilidadController = async (req, res) => {
  const {
    id
  } = req.params;
  const {
    error,
    value
  } = updateDisponibilidadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const disponibilidad = await updateDisponibilidad(id, value);
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

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    if (error.message && error.message.includes('reservas afectadas') || error.message.includes('affected bookings')) {
      return res.status(400).json({
        message: "Reservas afectadas",
        details: "La modificación afectaría a reservas existentes"
      });
    }

    if (error.message && error.message.includes('franjas')) {
      return res.status(400).json({
        message: "Error en franjas horarias",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al actualizar la disponibilidad",
      details: error.message
    });
  }
};

const deleteDisponibilidadController = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const disponibilidad = await deleteDisponibilidad(id);
    if (!disponibilidad) {
      return res.status(404).json({
        message: `No se ha encontrado la disponibilidad con id: ${id}`
      });
    }
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

    if (error.message && error.message.includes('reservas activas') || error.message.includes('active bookings')) {
      return res.status(400).json({
        message: "Disponibilidad con reservas",
        details: "No se puede eliminar la disponibilidad porque tiene reservas asociadas"
      });
    }

    res.status(500).json({
      message: "Error al eliminar la disponibilidad",
      details: error.message
    });
  }
};

const getFranjasDisponiblesController = async (req, res) => {
  const {
    entidadId,
    tipoEntidad,
    fecha
  } = req.query;

  if (!entidadId || !tipoEntidad || !fecha) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requiere entidadId, tipoEntidad y fecha"
    });
  }

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
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

    const franjas = await getFranjasDisponibles(entidadId, tipoEntidad, fecha);
    res.status(200).json(franjas);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no existe disponibilidad') || error.message.includes('no availability'))) {
      return res.status(404).json({
        message: "Disponibilidad no encontrada",
        details: `No hay disponibilidad para la fecha: ${fecha}`
      });
    }

    if (error.message && (error.message.includes('no encontrada') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: `No existe una entidad del tipo ${tipoEntidad} con id: ${entidadId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener franjas disponibles",
      details: error.message
    });
  }
};

const reservarFranjaController = async (req, res) => {
  const {
    entidadId,
    tipoEntidad,
    fecha,
    horaInicio,
    horaFin,
    reservaId
  } = req.body;

  if (!entidadId || !tipoEntidad || !fecha || !horaInicio || !horaFin || !reservaId) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren todos los campos: entidadId, tipoEntidad, fecha, horaInicio, horaFin y reservaId"
    });
  }

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
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

    const disponibilidad = await reservarFranja(entidadId, tipoEntidad, fecha, horaInicio, horaFin, reservaId);
    if (!disponibilidad) {
      return res.status(404).json({
        message: "No se pudo reservar la franja",
        details: "La disponibilidad no existe o no está disponible en las horas especificadas"
      });
    }
    res.status(200).json({
      message: "Franja horaria reservada correctamente",
      disponibilidad
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      const field = error.path === 'entidadId' ? 'entidad' : (error.path === 'reservaId' ? 'reserva' : error.path);
      return res.status(400).json({
        message: `ID de ${field} inválido`,
        details: `El formato del ID no es válido`
      });
    }

    if (error.message && error.message.includes('no disponible') || error.message.includes('not available')) {
      return res.status(400).json({
        message: "Franja no disponible",
        details: "La franja horaria solicitada no está disponible"
      });
    }

    if (error.message && error.message.includes('ya reservada') || error.message.includes('already booked')) {
      return res.status(400).json({
        message: "Franja ya reservada",
        details: "La franja horaria ya está reservada"
      });
    }

    if (error.message && error.message.includes('bloqueada') || error.message.includes('blocked')) {
      return res.status(400).json({
        message: "Franja bloqueada",
        details: "La franja horaria está bloqueada y no puede ser reservada"
      });
    }

    if (error.message && error.message.includes('reserva no encontrada') || error.message.includes('booking not found')) {
      return res.status(404).json({
        message: "Reserva no encontrada",
        details: `No existe una reserva con id: ${reservaId}`
      });
    }

    res.status(500).json({
      message: "Error al reservar la franja horaria",
      details: error.message
    });
  }
};

const liberarFranjaController = async (req, res) => {
  const {
    entidadId,
    tipoEntidad,
    fecha,
    horaInicio,
    horaFin
  } = req.body;

  if (!entidadId || !tipoEntidad || !fecha || !horaInicio || !horaFin) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren todos los campos: entidadId, tipoEntidad, fecha, horaInicio y horaFin"
    });
  }

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
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

    const disponibilidad = await liberarFranja(entidadId, tipoEntidad, fecha, horaInicio, horaFin);
    if (!disponibilidad) {
      return res.status(404).json({
        message: "No se pudo liberar la franja",
        details: "La disponibilidad no existe o la franja no está reservada"
      });
    }
    res.status(200).json({
      message: "Franja horaria liberada correctamente",
      disponibilidad
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    if (error.message && error.message.includes('no reservada') || error.message.includes('not booked')) {
      return res.status(400).json({
        message: "Franja no reservada",
        details: "La franja horaria no está reservada"
      });
    }

    if (error.message && error.message.includes('bloqueada') || error.message.includes('blocked')) {
      return res.status(400).json({
        message: "Franja bloqueada",
        details: "La franja horaria está bloqueada y no puede ser liberada"
      });
    }

    res.status(500).json({
      message: "Error al liberar la franja horaria",
      details: error.message
    });
  }
};

const bloquearFranjaController = async (req, res) => {
  const {
    error,
    value
  } = bloquearFranjaHorariaSchema.validate(req.body);
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

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
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

      for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.getDay();

        if (diasSeleccionadosNumeros.includes(diaSemana)) {
          try {
            const disponibilidad = await bloquearFranja(
              entidadId,
              tipoEntidad,
              new Date(d),
              horaInicio,
              horaFin,
              motivo
            );
            if (disponibilidad) {
              bloqueos.push(disponibilidad);
            }
          } catch (bloqueoError) {
            console.error(`Error al bloquear ${d.toISOString().split('T')[0]}:`, bloqueoError);
          }
        }
      }

      if (bloqueos.length === 0) {
        return res.status(400).json({
          message: "No se pudo bloquear ninguna franja",
          details: "No se pudieron bloquear las franjas en los días seleccionados"
        });
      }

      res.status(200).json({
        message: "Franjas horarias bloqueadas correctamente",
        totalBloqueados: bloqueos.length,
        totalDias: Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1,
        diasSeleccionados: diasRecurrencia
      });
    } else {
      const disponibilidad = await bloquearFranja(entidadId, tipoEntidad, fecha, horaInicio, horaFin, motivo);
      if (!disponibilidad) {
        return res.status(404).json({
          message: "No se pudo bloquear la franja horaria",
          details: "La disponibilidad no existe o la franja no está disponible"
        });
      }
      res.status(200).json({
        message: "Franja horaria bloqueada correctamente",
        disponibilidad
      });
    }
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({
        message: "Error en la fecha",
        details: error.message
      });
    }

    if (error.message && error.message.includes('disponibilidad no encontrada') || error.message.includes('availability not found')) {
      return res.status(404).json({
        message: "Disponibilidad no encontrada",
        details: `No existe disponibilidad para la fecha: ${fecha}`
      });
    }

    if (error.message && error.message.includes('ya reservada') || error.message.includes('already booked')) {
      return res.status(400).json({
        message: "Franja reservada",
        details: "La franja ya está reservada y no puede ser bloqueada"
      });
    }

    if (error.message && error.message.includes('ya bloqueada') || error.message.includes('already blocked')) {
      return res.status(400).json({
        message: "Franja ya bloqueada",
        details: "La franja ya está bloqueada"
      });
    }

    res.status(500).json({
      message: "Error al bloquear la franja horaria",
      details: error.message
    });
  }
};

const desbloquearFranjaController = async (req, res) => {
  const {
    entidadId,
    tipoEntidad,
    fecha,
    horaInicio,
    horaFin
  } = req.body;

  if (!entidadId || !tipoEntidad || !fecha || !horaInicio || !horaFin) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren todos los campos: entidadId, tipoEntidad, fecha, horaInicio y horaFin"
    });
  }

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
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

    const disponibilidad = await desbloquearFranja(entidadId, tipoEntidad, fecha, horaInicio, horaFin);
    if (!disponibilidad) {
      return res.status(404).json({
        message: "No se pudo desbloquear la franja",
        details: "La disponibilidad no existe o la franja no está bloqueada"
      });
    }
    res.status(200).json({
      message: "Franja horaria desbloqueada correctamente",
      disponibilidad
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    if (error.message && error.message.includes('no bloqueada') || error.message.includes('not blocked')) {
      return res.status(400).json({
        message: "Franja no bloqueada",
        details: "La franja horaria no está bloqueada"
      });
    }

    if (error.message && error.message.includes('disponibilidad no encontrada') || error.message.includes('availability not found')) {
      return res.status(404).json({
        message: "Disponibilidad no encontrada",
        details: `No existe disponibilidad para la fecha: ${fecha}`
      });
    }

    res.status(500).json({
      message: "Error al desbloquear la franja horaria",
      details: error.message
    });
  }
};

const crearDisponibilidadDiariaController = async (req, res) => {
  const {
    entidadId,
    tipoEntidad,
    fechaInicio,
    fechaFin,
    franjasBase
  } = req.body;

  if (!entidadId || !tipoEntidad || !fechaInicio || !fechaFin || !franjasBase || !Array.isArray(franjasBase)) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren todos los campos: entidadId, tipoEntidad, fechaInicio, fechaFin y franjasBase (array)"
    });
  }

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
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

    const disponibilidades = await crearDisponibilidadDiaria(entidadId, tipoEntidad, fechaInicio, fechaFin, franjasBase);
    res.status(201).json({
      message: "Disponibilidades diarias creadas correctamente",
      total: disponibilidades.length,
      periodo: `Del ${new Date(fechaInicio).toLocaleDateString()} al ${new Date(fechaFin).toLocaleDateString()}`,
      disponibilidades
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({
        message: "Error en las fechas",
        details: error.message
      });
    }

    if (error.message && error.message.includes('entidad no encontrada') || error.message.includes('entity not found')) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: `No existe una entidad del tipo ${tipoEntidad} con id: ${entidadId}`
      });
    }

    if (error.message && error.message.includes('franjas solapadas') || error.message.includes('overlapping slots')) {
      return res.status(400).json({
        message: "Franjas solapadas",
        details: "Hay franjas horarias que se solapan entre sí"
      });
    }

    res.status(500).json({
      message: "Error al crear disponibilidades diarias",
      details: error.message
    });
  }
};

const consultarDisponibilidadController = async (req, res) => {
  const {
    error,
    value
  } = consultarDisponibilidadSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los parámetros",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const {
    entidadId,
    tipoEntidad,
    fechaInicio,
    fechaFin,
    horaInicio,
    horaFin
  } = value;

  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio'].includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'servicio'"
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
          ...disp._doc,
          franjas
        };
      });

      res.status(200).json(disponibilidadesFiltradas);
    } else {
      res.status(200).json(disponibilidades);
    }
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({
        message: "Error en las fechas",
        details: error.message
      });
    }

    if (error.message && error.message.includes('entidad no encontrada') || error.message.includes('entity not found')) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: `No existe una entidad del tipo ${tipoEntidad} con id: ${entidadId}`
      });
    }

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