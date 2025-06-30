const {
  getReservasServicio,
  findReservaServicioById,
  getReservasByUsuario,
  getReservasByServicio,
  getReservasByReservaEspacio,
  getReservasPorEstado,
  getReservasPorRangoFechas,
  createReservaServicio,
  updateReservaServicio,
  deleteReservaServicio,
  cambiarEstadoReserva,
  confirmarReservaServicio,
  cancelarReservaServicio,
  completarReservaServicio,
  vincularPago,
  getReservasPendientesByFecha
} = require("../repositories/reservaServicio.repository");
const {
  createReservaServicioSchema,
  updateReservaServicioSchema,
  aprobarRechazarReservaServicioSchema,
  filtrarReservasServicioSchema
} = require("../routes/validations/reservaServicio.validation");

const Usuario = require("../models/usuario.model");
const ServicioAdicional = require("../models/servicioAdicional.model");
const Reserva = require("../models/reserva.model");
const ReservaServicio = require("../models/reservaServicio.model");
const Pago = require("../models/pago.model");

const getReservasServicioController = async (req, res) => {
  const { skip = "0", limit = "10", ...filtros } = req.query;
  const skipNum  = parseInt(skip,  10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(skipNum) || skipNum < 0) {
    return res.status(400).json({
      message: "Parámetro inválido",
      details: "`skip` debe ser un entero ≥ 0"
    });
  }
  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({
      message: "Parámetro inválido",
      details: "`limit` debe ser un entero ≥ 1"
    });
  }

  try {
    const reservas = await getReservasServicio(filtros, skipNum, limitNum);
    return res.status(200).json(reservas);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las reservas de servicio",
      details: error.message
    });
  }
};

const getReservaServicioByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await findReservaServicioById(id);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva de servicio con id: ${id}` });
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
      message: "Error al buscar la reserva de servicio",
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

const getReservasByServicioController = async (req, res) => {
  const { servicioId } = req.params;
  try {
    const reservas = await getReservasByServicio(servicioId);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de servicio inválido",
        details: `El formato del ID '${servicioId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Servicio no encontrado",
        details: `No existe un servicio con id: ${servicioId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener reservas por servicio",
      details: error.message
    });
  }
};

const getReservasByReservaEspacioController = async (req, res) => {
  const { reservaEspacioId } = req.params;
  try {
    const reservas = await getReservasByReservaEspacio(reservaEspacioId);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de reserva de espacio inválido",
        details: `El formato del ID '${reservaEspacioId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Reserva de espacio no encontrada",
        details: `No existe una reserva de espacio con id: ${reservaEspacioId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener reservas por reserva de espacio",
      details: error.message
    });
  }
};

const getReservasPorEstadoController = async (req, res) => {
  const { estado } = req.params;

  if (!['pendiente', 'confirmado', 'cancelado', 'completado'].includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: "El estado debe ser 'pendiente', 'confirmado', 'cancelado' o 'completado'"
    });
  }

  try {
    const reservas = await getReservasPorEstado(estado);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener reservas por estado",
      details: error.message
    });
  }
};

const getReservasPorRangoFechasController = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requieren fechas de inicio y fin"
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

    const reservas = await getReservasPorRangoFechas(inicio, fin);
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
      message: "Error al obtener reservas por rango de fechas",
      details: error.message
    });
  }
};

const createReservaServicioController = async (req, res) => {
  const { error, value } = createReservaServicioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        if (value.usuarioId) {
      const usuarioExiste = await Usuario.findById(value.usuarioId);
      if (!usuarioExiste) {
        return res.status(404).json({
          message: "Usuario no encontrado",
          details: `No existe un usuario con id: ${value.usuarioId}`,
          field: "usuarioId"
        });
      }

            if (!usuarioExiste.activo) {
        return res.status(400).json({
          message: "Usuario inactivo",
          details: "El usuario especificado no está activo",
          field: "usuarioId"
        });
      }
    }

        if (value.servicioId) {
      const servicioExiste = await ServicioAdicional.findById(value.servicioId);
      if (!servicioExiste) {
        return res.status(404).json({
          message: "Servicio adicional no encontrado",
          details: `No existe un servicio adicional con id: ${value.servicioId}`,
          field: "servicioId"
        });
      }

            if (!servicioExiste.activo) {
        return res.status(400).json({
          message: "Servicio adicional inactivo",
          details: "El servicio adicional especificado no está activo",
          field: "servicioId"
        });
      }
    }

        if (value.reservaEspacioId) {
      const reservaEspacioExiste = await Reserva.findById(value.reservaEspacioId);
      if (!reservaEspacioExiste) {
        return res.status(404).json({
          message: "Reserva de espacio no encontrada",
          details: `No existe una reserva de espacio con id: ${value.reservaEspacioId}`,
          field: "reservaEspacioId"
        });
      }

            if (!['confirmada', 'pendiente'].includes(reservaEspacioExiste.estado)) {
        return res.status(400).json({
          message: "Reserva de espacio en estado inválido",
          details: "Solo se pueden vincular servicios a reservas confirmadas o pendientes",
          field: "reservaEspacioId"
        });
      }
    }

    const reserva = await createReservaServicio(value);
    return res.status(201).json({
      message: "Reserva de servicio creada correctamente",
      reserva
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: `El formato del ID no es válido`
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    if (error.message.includes("not available")) {
      return res.status(400).json({
        message: "Servicio no disponible",
        details: "El servicio no está disponible en la fecha y hora seleccionadas"
      });
    }

    return res.status(500).json({
      message: "Error al crear la reserva de servicio",
      details: error.message
    });
  }
};

const updateReservaServicioController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateReservaServicioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        if (value.usuarioId) {
      const usuarioExiste = await Usuario.findById(value.usuarioId);
      if (!usuarioExiste) {
        return res.status(404).json({
          message: "Usuario no encontrado",
          details: `No existe un usuario con id: ${value.usuarioId}`,
          field: "usuarioId"
        });
      }

            if (!usuarioExiste.activo) {
        return res.status(400).json({
          message: "Usuario inactivo",
          details: "El usuario especificado no está activo",
          field: "usuarioId"
        });
      }
    }

        if (value.servicioId) {
      const servicioExiste = await ServicioAdicional.findById(value.servicioId);
      if (!servicioExiste) {
        return res.status(404).json({
          message: "Servicio adicional no encontrado",
          details: `No existe un servicio adicional con id: ${value.servicioId}`,
          field: "servicioId"
        });
      }

            if (!servicioExiste.activo) {
        return res.status(400).json({
          message: "Servicio adicional inactivo",
          details: "El servicio adicional especificado no está activo",
          field: "servicioId"
        });
      }
    }

        if (value.reservaEspacioId) {
      const reservaEspacioExiste = await Reserva.findById(value.reservaEspacioId);
      if (!reservaEspacioExiste) {
        return res.status(404).json({
          message: "Reserva de espacio no encontrada",
          details: `No existe una reserva de espacio con id: ${value.reservaEspacioId}`,
          field: "reservaEspacioId"
        });
      }

            if (!['confirmada', 'pendiente'].includes(reservaEspacioExiste.estado)) {
        return res.status(400).json({
          message: "Reserva de espacio en estado inválido",
          details: "Solo se pueden vincular servicios a reservas confirmadas o pendientes",
          field: "reservaEspacioId"
        });
      }
    }

    const reserva = await updateReservaServicio(id, value);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva de servicio con id: ${id}` });
    }
    res.status(200).json(reserva);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: `El formato del ID no es válido`
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

    if (error.message && error.message.includes('servicio no disponible') || error.message.includes('service not available')) {
      return res.status(400).json({
        message: "Servicio no disponible",
        details: "El servicio no está disponible en la nueva fecha y hora"
      });
    }

    res.status(500).json({
      message: "Error al actualizar la reserva de servicio",
      details: error.message
    });
  }
};

const deleteReservaServicioController = async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await deleteReservaServicio(id);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva de servicio con id: ${id}` });
    }
    res.status(200).json({ message: "Reserva de servicio eliminada correctamente" });
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
      message: "Error al eliminar la reserva de servicio",
      details: error.message
    });
  }
};

const cambiarEstadoReservaController = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['pendiente', 'confirmado', 'cancelado', 'completado'].includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: "El estado debe ser 'pendiente', 'confirmado', 'cancelado' o 'completado'"
    });
  }

  try {
    const reserva = await cambiarEstadoReserva(id, estado);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva de servicio con id: ${id}` });
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
        details: `No se permite cambiar el estado actual a '${estado}'`
      });
    }

    res.status(500).json({
      message: "Error al cambiar el estado de la reserva",
      details: error.message
    });
  }
};

const confirmarReservaServicioController = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await confirmarReservaServicio(id);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva de servicio con id: ${id}` });
    }
    res.status(200).json({ message: "Reserva confirmada correctamente", reserva });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de reserva inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('no pendiente') || error.message.includes('not pending')) {
      return res.status(400).json({
        message: "Reserva no pendiente",
        details: "Solo se pueden confirmar reservas en estado pendiente"
      });
    }

    if (error.message && error.message.includes('requisitos de pago') || error.message.includes('payment requirements')) {
      return res.status(400).json({
        message: "Falta pago",
        details: "La reserva requiere un pago antes de ser confirmada"
      });
    }

    res.status(500).json({
      message: "Error al confirmar la reserva",
      details: error.message
    });
  }
};

const cancelarReservaServicioController = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  if (!motivo) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requiere un motivo de cancelación"
    });
  }

  try {
    const reserva = await cancelarReservaServicio(id, motivo);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva de servicio con id: ${id}` });
    }
    res.status(200).json({ message: "Reserva cancelada correctamente", reserva });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de reserva inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('no cancelable') || error.message.includes('cannot be cancelled')) {
      return res.status(400).json({
        message: "Reserva no cancelable",
        details: "La reserva no puede ser cancelada en su estado actual"
      });
    }

    if (error.message && error.message.includes('plazo de cancelación') || error.message.includes('cancellation period')) {
      return res.status(400).json({
        message: "Fuera de plazo",
        details: "Ha excedido el plazo para cancelar esta reserva"
      });
    }

    res.status(500).json({
      message: "Error al cancelar la reserva",
      details: error.message
    });
  }
};

const completarReservaServicioController = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await completarReservaServicio(id);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva de servicio con id: ${id}` });
    }
    res.status(200).json({ message: "Reserva completada correctamente", reserva });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de reserva inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('no confirmada') || error.message.includes('not confirmed')) {
      return res.status(400).json({
        message: "Reserva no confirmada",
        details: "Solo se pueden completar reservas en estado confirmado"
      });
    }

    if (error.message && error.message.includes('fecha futura') || error.message.includes('future date')) {
      return res.status(400).json({
        message: "Fecha futura",
        details: "No se puede marcar como completada una reserva con fecha futura"
      });
    }

    res.status(500).json({
      message: "Error al completar la reserva",
      details: error.message
    });
  }
};

const vincularPagoController = async (req, res) => {
  const { id } = req.params;
  const { pagoId } = req.body;

  if (!pagoId) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requiere ID del pago",
      field: "pagoId"
    });
  }

  try {
        const pagoExiste = await Pago.findById(pagoId);
    if (!pagoExiste) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No existe un pago con id: ${pagoId}`,
        field: "pagoId"
      });
    }

        if (pagoExiste.estado !== 'completado') {
      return res.status(400).json({
        message: "Pago no completado",
        details: "Solo se pueden vincular pagos en estado completado",
        field: "pagoId"
      });
    }

        const pagoYaVinculado = await ReservaServicio.findOne({ pagoId: pagoId });
    if (pagoYaVinculado && pagoYaVinculado._id.toString() !== id) {
      return res.status(400).json({
        message: "Pago ya vinculado",
        details: "El pago ya está vinculado a otra reserva de servicio",
        field: "pagoId"
      });
    }

    const reserva = await vincularPago(id, pagoId);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva de servicio con id: ${id}` });
    }
    res.status(200).json({ message: "Pago vinculado correctamente", reserva });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: `El formato del ID no es válido`
      });
    }

    res.status(500).json({
      message: "Error al vincular el pago",
      details: error.message
    });
  }
};

const getReservasPendientesByFechaController = async (req, res) => {
  const { fecha } = req.query;

  if (!fecha) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requiere una fecha"
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

    const reservas = await getReservasPendientesByFecha(fechaObj);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);

    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({
        message: "Error en la fecha",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener reservas pendientes por fecha",
      details: error.message
    });
  }
};

const aprobarRechazarReservaServicioController = async (req, res) => {
  const { error, value } = aprobarRechazarReservaServicioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { reservaServicioId, accion, motivoRechazo } = value;

  if (!['aprobar', 'rechazar'].includes(accion)) {
    return res.status(400).json({
      message: "Acción no válida",
      details: "La acción debe ser 'aprobar' o 'rechazar'"
    });
  }

  if (accion === 'rechazar' && !motivoRechazo) {
    return res.status(400).json({
      message: "Motivo de rechazo requerido",
      details: "Se requiere un motivo al rechazar la reserva"
    });
  }

  try {
        const reservaExiste = await ReservaServicio.findById(reservaServicioId);
    if (!reservaExiste) {
      return res.status(404).json({
        message: "Reserva de servicio no encontrada",
        details: `No existe una reserva de servicio con id: ${reservaServicioId}`,
        field: "reservaServicioId"
      });
    }

        if (reservaExiste.estado !== 'pendiente') {
      return res.status(400).json({
        message: "Reserva no pendiente",
        details: "Solo se pueden aprobar o rechazar reservas en estado pendiente",
        field: "reservaServicioId"
      });
    }

    let reserva;

    if (accion === 'aprobar') {
      reserva = await confirmarReservaServicio(reservaServicioId);
    } else {
      reserva = await cancelarReservaServicio(reservaServicioId, motivoRechazo);
    }

    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva de servicio con id: ${reservaServicioId}` });
    }

    res.status(200).json({
      message: `Reserva ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente`,
      reserva
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de reserva inválido",
        details: `El formato del ID '${reservaServicioId}' no es válido`
      });
    }

    if (error.message && error.message.includes('no autorizado') || error.message.includes('not authorized')) {
      return res.status(403).json({
        message: "No autorizado",
        details: "No tiene permisos para realizar esta acción"
      });
    }

    const accionTexto = accion === 'aprobar' ? 'aprobar' : 'rechazar';
    res.status(500).json({
      message: `Error al ${accionTexto} la reserva`,
      details: error.message
    });
  }
};

const filtrarReservasServicioController = async (req, res) => {
  const { error, value } = filtrarReservasServicioSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los filtros",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const filtros = {};

    if (value.usuarioId) filtros.usuarioId = value.usuarioId;
    if (value.servicioId) filtros.servicioId = value.servicioId;
    if (value.reservaEspacioId) filtros.reservaEspacioId = value.reservaEspacioId;
    if (value.estado) filtros.estado = value.estado;

    if (value.fechaDesde) {
      const fechaDesde = new Date(value.fechaDesde);

      if (isNaN(fechaDesde.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha 'desde' debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaDesde"
        });
      }

      filtros.fecha = { $gte: fechaDesde };
    }

    if (value.fechaHasta) {
      const fechaHasta = new Date(value.fechaHasta);

      if (isNaN(fechaHasta.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha 'hasta' debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaHasta"
        });
      }

      if (filtros.fecha) {
        filtros.fecha.$lte = fechaHasta;
      } else {
        filtros.fecha = { $lte: fechaHasta };
      }
    }

    const reservas = await getReservasServicio(filtros);
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
      message: "Error al filtrar reservas de servicio",
      details: error.message
    });
  }
};

module.exports = {
  getReservasServicioController,
  getReservaServicioByIdController,
  getReservasByUsuarioController,
  getReservasByServicioController,
  getReservasByReservaEspacioController,
  getReservasPorEstadoController,
  getReservasPorRangoFechasController,
  createReservaServicioController,
  updateReservaServicioController,
  deleteReservaServicioController,
  cambiarEstadoReservaController,
  confirmarReservaServicioController,
  cancelarReservaServicioController,
  completarReservaServicioController,
  vincularPagoController,
  getReservasPendientesByFechaController,
  aprobarRechazarReservaServicioController,
  filtrarReservasServicioController
};