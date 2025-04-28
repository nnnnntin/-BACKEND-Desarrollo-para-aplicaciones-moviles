const {
  getReservas,
  findReservaById,
  getReservasByUsuario,
  getReservasByEntidad,
  getReservasPendientesAprobacion,
  getReservasPorFecha,
  createReserva,
  updateReserva,
  deleteReserva,
  cambiarEstadoReserva,
  aprobarReserva,
  rechazarReserva,
  getReservasRecurrentes,
  vincularPagoReserva
} = require("../repositories/reserva.repository");
const { 
  createReservaSchema, 
  updateReservaSchema,
  filtrarReservasSchema,
  cancelarReservaSchema
} = require("../routes/validations/reserva.validation");

const getReservasController = async (req, res) => {
  try {
    const reservas = await getReservas();
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener las reservas", 
      details: error.message 
    });
  }
};

const getReservaByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await findReservaById(id);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${id}` });
    }
    res.status(200).json(reserva);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reserva inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    res.status(500).json({ 
      message: "Error al buscar la reserva", 
      details: error.message 
    });
  }
};

const getReservasByUsuarioController = async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const reservas = await getReservasByUsuario(usuarioId);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de usuario inválido", 
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener reservas del usuario", 
      details: error.message 
    });
  }
};

const getReservasByEntidadController = async (req, res) => {
  const { tipoEntidad, entidadId } = req.params;
  try {
    // Validar tipo de entidad
    if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'espacio'].includes(tipoEntidad)) {
      return res.status(400).json({ 
        message: "Tipo de entidad inválido", 
        details: "El tipo de entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible' o 'espacio'"
      });
    }
    
    const reservas = await getReservasByEntidad(tipoEntidad, entidadId);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de entidad inválido", 
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('no encontrada') || error.message.includes('not found')) {
      return res.status(404).json({ 
        message: "Entidad no encontrada", 
        details: `No se encontró la entidad de tipo ${tipoEntidad} con id: ${entidadId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener reservas de la entidad", 
      details: error.message 
    });
  }
};

const getReservasPendientesAprobacionController = async (req, res) => {
  try {
    const reservas = await getReservasPendientesAprobacion();
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener reservas pendientes de aprobación", 
      details: error.message 
    });
  }
};

const getReservasPorFechaController = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  
  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ 
      message: "Parámetros incompletos", 
      details: "Se requieren fechas de inicio y fin"
    });
  }
  
  try {
    // Validar formato de fechas
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
    
    const reservas = await getReservasPorFecha(inicio, fin);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    
    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({ 
        message: "Error en las fechas", 
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener reservas por fecha", 
      details: error.message 
    });
  }
};

const createReservaController = async (req, res) => {
  const { error, value } = createReservaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    // Aquí podría agregarse lógica para verificar disponibilidad antes de crear la reserva
    const reserva = await createReserva(value);
    res.status(201).json({ message: "Reserva creada correctamente", reserva });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación en modelo", 
        details: errors
      });
    }
    
    if (error.message && error.message.includes('no disponible') || error.message.includes('not available')) {
      return res.status(400).json({ 
        message: "Espacio no disponible", 
        details: "El espacio no está disponible en la fecha y hora seleccionadas"
      });
    }
    
    if (error.message && error.message.includes('solapamiento') || error.message.includes('overlap')) {
      return res.status(400).json({ 
        message: "Conflicto de horarios", 
        details: "La reserva se solapa con otra reserva existente"
      });
    }
    
    if (error.message && error.message.includes('usuario no encontrado') || error.message.includes('user not found')) {
      return res.status(404).json({ 
        message: "Usuario no encontrado", 
        details: "El usuario especificado no existe"
      });
    }
    
    if (error.message && error.message.includes('entidad no encontrada') || error.message.includes('entity not found')) {
      return res.status(404).json({ 
        message: "Entidad no encontrada", 
        details: "La entidad a reservar no existe"
      });
    }
    
    res.status(500).json({ 
      message: "Error al crear la reserva", 
      details: error.message 
    });
  }
};

const updateReservaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateReservaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    const reserva = await updateReserva(id, value);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${id}` });
    }
    res.status(200).json(reserva);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reserva inválido", 
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
    
    if (error.message && error.message.includes('no modificable') || error.message.includes('cannot be modified')) {
      return res.status(400).json({ 
        message: "Reserva no modificable", 
        details: "La reserva no puede ser modificada en su estado actual"
      });
    }
    
    if (error.message && error.message.includes('solapamiento') || error.message.includes('overlap')) {
      return res.status(400).json({ 
        message: "Conflicto de horarios", 
        details: "La reserva modificada se solapa con otra reserva existente"
      });
    }
    
    res.status(500).json({ 
      message: "Error al actualizar la reserva", 
      details: error.message 
    });
  }
};

const deleteReservaController = async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await deleteReserva(id);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${id}` });
    }
    res.status(200).json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reserva inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('no eliminable') || error.message.includes('cannot be deleted')) {
      return res.status(400).json({ 
        message: "Reserva no eliminable", 
        details: "La reserva no puede ser eliminada en su estado actual"
      });
    }
    
    if (error.message && error.message.includes('pagos asociados') || error.message.includes('associated payments')) {
      return res.status(400).json({ 
        message: "Reserva con pagos", 
        details: "La reserva tiene pagos asociados y no puede ser eliminada directamente"
      });
    }
    
    res.status(500).json({ 
      message: "Error al eliminar la reserva", 
      details: error.message 
    });
  }
};

const cambiarEstadoReservaController = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!['pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio'].includes(estado)) {
    return res.status(400).json({ 
      message: "Estado no válido", 
      details: "El estado debe ser 'pendiente', 'confirmada', 'cancelada', 'completada' o 'no_asistio'"
    });
  }
  
  try {
    const reserva = await cambiarEstadoReserva(id, estado);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${id}` });
    }
    res.status(200).json({ message: "Estado actualizado correctamente", reserva });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reserva inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('transición no permitida') || error.message.includes('transition not allowed')) {
      return res.status(400).json({ 
        message: "Cambio de estado no permitido", 
        details: `No se permite cambiar el estado de '${error.currentState}' a '${estado}'`
      });
    }
    
    res.status(500).json({ 
      message: "Error al cambiar el estado de la reserva", 
      details: error.message 
    });
  }
};

const aprobarReservaController = async (req, res) => {
  const { id } = req.params;
  const { aprobadorId, notas } = req.body;
  
  if (!aprobadorId) {
    return res.status(400).json({ 
      message: "Datos incompletos", 
      details: "Se requiere ID del aprobador"
    });
  }
  
  try {
    const reserva = await aprobarReserva(id, aprobadorId, notas);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${id}` });
    }
    res.status(200).json({ message: "Reserva aprobada correctamente", reserva });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      const field = error.path === 'id' ? 'reserva' : 'aprobador';
      return res.status(400).json({ 
        message: `ID de ${field} inválido`, 
        details: `El formato del ID no es válido`
      });
    }
    
    if (error.message && error.message.includes('no pendiente') || error.message.includes('not pending')) {
      return res.status(400).json({ 
        message: "Reserva no pendiente", 
        details: "Solo se pueden aprobar reservas en estado pendiente"
      });
    }
    
    if (error.message && error.message.includes('aprobador no autorizado') || error.message.includes('not authorized')) {
      return res.status(403).json({ 
        message: "Aprobador no autorizado", 
        details: "El usuario no tiene permisos para aprobar reservas"
      });
    }
    
    res.status(500).json({ 
      message: "Error al aprobar la reserva", 
      details: error.message 
    });
  }
};

const rechazarReservaController = async (req, res) => {
  const { id } = req.params;
  const { aprobadorId, notas } = req.body;
  
  if (!aprobadorId || !notas) {
    return res.status(400).json({ 
      message: "Datos incompletos", 
      details: "Se requiere ID del aprobador y motivo de rechazo"
    });
  }
  
  try {
    const reserva = await rechazarReserva(id, aprobadorId, notas);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${id}` });
    }
    res.status(200).json({ message: "Reserva rechazada correctamente", reserva });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      const field = error.path === 'id' ? 'reserva' : 'aprobador';
      return res.status(400).json({ 
        message: `ID de ${field} inválido`, 
        details: `El formato del ID no es válido`
      });
    }
    
    if (error.message && error.message.includes('no pendiente') || error.message.includes('not pending')) {
      return res.status(400).json({ 
        message: "Reserva no pendiente", 
        details: "Solo se pueden rechazar reservas en estado pendiente"
      });
    }
    
    if (error.message && error.message.includes('aprobador no autorizado') || error.message.includes('not authorized')) {
      return res.status(403).json({ 
        message: "Aprobador no autorizado", 
        details: "El usuario no tiene permisos para rechazar reservas"
      });
    }
    
    res.status(500).json({ 
      message: "Error al rechazar la reserva", 
      details: error.message 
    });
  }
};

const getReservasRecurrentesController = async (req, res) => {
  try {
    const reservas = await getReservasRecurrentes();
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener reservas recurrentes", 
      details: error.message 
    });
  }
};

const vincularPagoReservaController = async (req, res) => {
  const { id } = req.params;
  const { pagoId } = req.body;
  
  if (!pagoId) {
    return res.status(400).json({ 
      message: "Datos incompletos", 
      details: "Se requiere ID del pago"
    });
  }
  
  try {
    const reserva = await vincularPagoReserva(id, pagoId);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${id}` });
    }
    res.status(200).json({ message: "Pago vinculado correctamente", reserva });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      const field = error.path === 'id' ? 'reserva' : 'pago';
      return res.status(400).json({ 
        message: `ID de ${field} inválido`, 
        details: `El formato del ID no es válido`
      });
    }
    
    if (error.message && error.message.includes('pago no encontrado') || error.message.includes('payment not found')) {
      return res.status(404).json({ 
        message: "Pago no encontrado", 
        details: `No se encontró el pago con id: ${pagoId}`
      });
    }
    
    if (error.message && error.message.includes('ya vinculado') || error.message.includes('already linked')) {
      return res.status(400).json({ 
        message: "Pago ya vinculado", 
        details: "El pago ya está vinculado a esta u otra reserva"
      });
    }
    
    if (error.message && error.message.includes('estado incorrecto') || error.message.includes('wrong state')) {
      return res.status(400).json({ 
        message: "Estado de reserva incorrecto", 
        details: "La reserva debe estar en estado confirmada o pendiente para vincular un pago"
      });
    }
    
    res.status(500).json({ 
      message: "Error al vincular el pago", 
      details: error.message 
    });
  }
};

const cancelarReservaController = async (req, res) => {
  const { error, value } = cancelarReservaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  const { reservaId, motivo, solicitarReembolso } = value;
  
  try {
    const reserva = await cambiarEstadoReserva(reservaId, 'cancelada');
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${reservaId}` });
    }
    
    // Actualizar con el motivo de cancelación
    try {
      const reservaActualizada = await updateReserva(reservaId, { 
        motivoCancelacion: motivo,
        fechaCancelacion: new Date(),
        reembolsoSolicitado: solicitarReembolso
      });
      
      res.status(200).json({ message: "Reserva cancelada correctamente", reserva: reservaActualizada });
    } catch (updateError) {
      console.error("Error al actualizar detalles de cancelación:", updateError);
      // Aún así la reserva fue cancelada, enviamos respuesta con advertencia
      res.status(200).json({ 
        message: "Reserva cancelada pero con error al actualizar detalles", 
        reserva,
        warning: "No se pudieron guardar todos los detalles de la cancelación"
      });
    }
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reserva inválido", 
        details: `El formato del ID '${reservaId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('no se puede cancelar') || error.message.includes('cannot cancel')) {
      return res.status(400).json({ 
        message: "Reserva no cancelable", 
        details: "La reserva no puede ser cancelada en su estado actual o ha pasado el plazo para cancelación"
      });
    }
    
    if (error.message && error.message.includes('políticas de cancelación') || error.message.includes('cancellation policy')) {
      return res.status(400).json({ 
        message: "Fuera de plazo de cancelación", 
        details: "Ha excedido el plazo permitido para cancelaciones con reembolso"
      });
    }
    
    res.status(500).json({ 
      message: "Error al cancelar la reserva", 
      details: error.message 
    });
  }
};

const filtrarReservasController = async (req, res) => {
  const { error, value } = filtrarReservasSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación en los filtros", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    // Convertir a filtros de MongoDB
    const filtros = {};
    
    if (value.usuarioId) filtros.usuarioId = value.usuarioId;
    if (value.tipoEntidad) filtros['entidadReservada.tipo'] = value.tipoEntidad;
    if (value.entidadId) filtros['entidadReservada.id'] = value.entidadId;
    if (value.estado) filtros.estado = value.estado;
    
    if (value.fechaInicio) {
      const fechaInicio = new Date(value.fechaInicio);
      if (isNaN(fechaInicio.getTime())) {
        return res.status(400).json({ 
          message: "Formato de fecha inválido", 
          details: "La fecha de inicio debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaInicio"
        });
      }
      filtros.fechaInicio = { $gte: fechaInicio };
    }
    
    if (value.fechaFin) {
      const fechaFin = new Date(value.fechaFin);
      if (isNaN(fechaFin.getTime())) {
        return res.status(400).json({ 
          message: "Formato de fecha inválido", 
          details: "La fecha de fin debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaFin"
        });
      }
      filtros.fechaFin = { $lte: fechaFin };
    }
    
    if (value.esRecurrente !== undefined) filtros.esRecurrente = value.esRecurrente;
    
    const reservas = await getReservas(filtros);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "Error en formato de ID", 
        details: `El valor '${error.value}' no es válido para el campo '${error.path}'`,
        field: error.path
      });
    }
    
    res.status(500).json({ 
      message: "Error al filtrar reservas", 
      details: error.message 
    });
  }
};

module.exports = {
  getReservasController,
  getReservaByIdController,
  getReservasByUsuarioController,
  getReservasByEntidadController,
  getReservasPendientesAprobacionController,
  getReservasPorFechaController,
  createReservaController,
  updateReservaController,
  deleteReservaController,
  cambiarEstadoReservaController,
  aprobarReservaController,
  rechazarReservaController,
  getReservasRecurrentesController,
  vincularPagoReservaController,
  cancelarReservaController,
  filtrarReservasController
};