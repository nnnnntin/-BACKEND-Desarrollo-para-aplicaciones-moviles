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

const { findUsuarioById } = require("../repositories/usuario.repository");
const { findOficinaById } = require("../repositories/oficina.repository");
const { findSalaReunionById } = require("../repositories/salaReunion.repository");
const { findEscritorioFlexibleById } = require("../repositories/escritorioFlexible.repository");
const { findServicioAdicionalById } = require("../repositories/servicioAdicional.repository");
const { getReservasByCliente, getEstadisticasGananciasCliente } = require("../repositories/reserva.repository");

const ENTIDAD_RESERVABLE_MAP = {
  'oficina': findOficinaById,
  'sala_reunion': findSalaReunionById,
  'escritorio_flexible': findEscritorioFlexibleById
};

const ENTIDADES_RESERVABLES_VALIDAS = ['oficina', 'sala_reunion', 'escritorio_flexible'];
const ESTADOS_RESERVA_VALIDOS = ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio'];

/**
 * Valida que un usuario existe
 * @param {string} usuarioId - ID del usuario a validar
 * @returns {Promise<Object>} - { valid: boolean, user: Object|null, message: string }
 */
const validarUsuarioExiste = async (usuarioId) => {
  try {
    const usuario = await findUsuarioById(usuarioId);

    if (!usuario) {
      return {
        valid: false,
        user: null,
        message: `No se encontró el usuario con ID: ${usuarioId}`
      };
    }

    return {
      valid: true,
      user: usuario,
      message: 'Usuario válido'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        user: null,
        message: `Formato de ID de usuario inválido: ${usuarioId}`
      };
    }
    throw error;
  }
};

/**
 * Valida que una entidad reservable existe
 * @param {string} tipoEntidad - Tipo de entidad
 * @param {string} entidadId - ID de la entidad
 * @returns {Promise<Object>} - { valid: boolean, entity: Object|null, message: string }
 */
const validarEntidadReservableExiste = async (tipoEntidad, entidadId) => {
  const findEntidadById = ENTIDAD_RESERVABLE_MAP[tipoEntidad];

  if (!findEntidadById) {
    return {
      valid: false,
      entity: null,
      message: `Tipo de entidad no válido: ${tipoEntidad}. Debe ser una de: ${ENTIDADES_RESERVABLES_VALIDAS.join(', ')}`
    };
  }

  try {
    const entidad = await findEntidadById(entidadId);

    if (!entidad) {
      return {
        valid: false,
        entity: null,
        message: `No se encontró la ${tipoEntidad} con ID: ${entidadId}`
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
 * Valida que todos los servicios adicionales existen
 * @param {Array} serviciosIds - Array de IDs de servicios adicionales
 * @returns {Promise<Object>} - { valid: boolean, invalidIds: Array, services: Array, message: string }
 */
const validarServiciosAdicionalesExisten = async (serviciosIds) => {
  if (!serviciosIds || !Array.isArray(serviciosIds) || serviciosIds.length === 0) {
    return {
      valid: true,
      invalidIds: [],
      services: [],
      message: 'No hay servicios adicionales para validar'
    };
  }

  const invalidIds = [];
  const services = [];

  for (const servicioId of serviciosIds) {
    try {
      const servicio = await findServicioAdicionalById(servicioId);
      if (!servicio) {
        invalidIds.push(servicioId);
      } else {
        services.push(servicio);
      }
    } catch (error) {
      if (error.name === 'CastError') {
        invalidIds.push(servicioId);
      } else {
        throw error;
      }
    }
  }

  return {
    valid: invalidIds.length === 0,
    invalidIds,
    services,
    message: invalidIds.length > 0
      ? `No se encontraron los siguientes servicios adicionales: ${invalidIds.join(', ')}`
      : 'Todos los servicios adicionales son válidos'
  };
};

const getReservasController = async (req, res) => {
  const { skip = "0", limit = "10", ...filtros } = req.query;
  const skipNum = parseInt(skip, 10);
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
    const reservas = await getReservas(filtros, skipNum, limitNum);
    return res.status(200).json(reservas);
  } catch (error) {
    console.error("[Controller] Error al obtener reservas", error);
    return res.status(500).json({
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
      return res.status(404).json({
        message: `No se ha encontrado la reserva con id: ${id}`
      });
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
    const validacionUsuario = await validarUsuarioExiste(usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

    const reservas = await getReservasByUsuario(usuarioId);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener reservas del usuario",
      details: error.message
    });
  }
};

const getReservasByEntidadController = async (req, res) => {
  const { tipoEntidad, entidadId } = req.params;

  try {
    if (!ENTIDADES_RESERVABLES_VALIDAS.includes(tipoEntidad)) {
      return res.status(400).json({
        message: "Tipo de entidad inválido",
        details: `El tipo de entidad debe ser una de: ${ENTIDADES_RESERVABLES_VALIDAS.join(', ')}`
      });
    }

    const validacionEntidad = await validarEntidadReservableExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

    const reservas = await getReservasByEntidad(tipoEntidad, entidadId);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
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
    // Validar que el usuario existe
    const validacionUsuario = await validarUsuarioExiste(value.usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

    // NUEVO: Validar que el cliente/propietario existe
    const validacionCliente = await validarUsuarioExiste(value.clienteId);
    if (!validacionCliente.valid) {
      return res.status(404).json({
        message: "Cliente/propietario no encontrado",
        details: validacionCliente.message
      });
    }

    // Validar que la entidad reservable existe
    const { tipo: tipoEntidad, id: entidadId } = value.entidadReservada;
    const validacionEntidad = await validarEntidadReservableExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad reservable no encontrada",
        details: validacionEntidad.message
      });
    }
    // Validar servicios adicionales si existen
    if (value.serviciosAdicionales && value.serviciosAdicionales.length > 0) {
      const validacionServicios = await validarServiciosAdicionalesExisten(value.serviciosAdicionales);
      if (!validacionServicios.valid) {
        return res.status(404).json({
          message: "Servicios adicionales no encontrados",
          details: validacionServicios.message,
          invalidIds: validacionServicios.invalidIds
        });
      }
    }

    // Validar fechas
    const fechaInicio = new Date(value.fechaInicio);
    const fechaFin = new Date(value.fechaFin);
    const fechaActual = new Date();

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "Las fechas deben tener un formato válido"
      });
    }

    if (fechaInicio >= fechaFin) {
      return res.status(400).json({
        message: "Error en las fechas de la reserva",
        details: "La fecha de inicio debe ser anterior a la fecha de fin"
      });
    }

    if (fechaInicio <= fechaActual) {
      return res.status(400).json({
        message: "Error en la fecha de inicio",
        details: "La fecha de inicio debe ser posterior a la fecha actual"
      });
    }

    // NUEVO: Validar coherencia de precios
    if (value.precioFinalPagado > value.precioTotal) {
      return res.status(400).json({
        message: "Error en los precios",
        details: "El precio final pagado no puede ser mayor al precio total"
      });
    }

    // NUEVO: Si hay descuento, validar que el precio final sea correcto
    if (value.descuento && value.descuento.porcentaje > 0) {
      const descuentoEsperado = value.precioTotal * (value.descuento.porcentaje / 100);
      const precioFinalEsperado = value.precioTotal - descuentoEsperado;
      const diferencia = Math.abs(value.precioFinalPagado - precioFinalEsperado);

      // Permitir una pequeña diferencia por redondeo (centavos)
      if (diferencia > 0.01) {
        return res.status(400).json({
          message: "Error en el cálculo del precio",
          details: `El precio final pagado (${value.precioFinalPagado}) no coincide con el precio esperado después del descuento (${precioFinalEsperado.toFixed(2)})`
        });
      }
    }

    // Crear la reserva
    const reserva = await createReserva(value);

    res.status(201).json({
      message: "Reserva creada correctamente",
      reserva,
      usuarioValidado: {
        id: validacionUsuario.user._id,
        nombre: validacionUsuario.user.nombre,
        email: validacionUsuario.user.email
      },
      clienteValidado: { // NUEVO
        id: validacionCliente.user._id,
        nombre: validacionCliente.user.nombre,
        email: validacionCliente.user.email
      },
      entidadValidada: {
        tipo: tipoEntidad,
        id: validacionEntidad.entity._id,
        nombre: validacionEntidad.entity.nombre || validacionEntidad.entity.codigo
      },
      resumenPrecios: { // NUEVO
        precioTotal: value.precioTotal,
        precioFinalPagado: value.precioFinalPagado,
        descuento: value.descuento || null,
        ahorro: value.precioTotal - value.precioFinalPagado
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

    if (error.message && (error.message.includes('no disponible') || error.message.includes('not available'))) {
      return res.status(400).json({
        message: "Espacio no disponible",
        details: "El espacio no está disponible en la fecha y hora seleccionadas"
      });
    }

    if (error.message && (error.message.includes('solapamiento') || error.message.includes('overlap'))) {
      return res.status(400).json({
        message: "Conflicto de horarios",
        details: "La reserva se solapa con otra reserva existente"
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
    const reservaExistente = await findReservaById(id);
    if (!reservaExistente) {
      return res.status(404).json({
        message: `No se ha encontrado la reserva con id: ${id}`
      });
    }

    if (value.usuarioId) {
      const validacionUsuario = await validarUsuarioExiste(value.usuarioId);
      if (!validacionUsuario.valid) {
        return res.status(404).json({
          message: "Usuario no encontrado",
          details: validacionUsuario.message
        });
      }
    }

    if (value.entidadReservada) {
      const { tipo: tipoEntidad, id: entidadId } = value.entidadReservada;
      const validacionEntidad = await validarEntidadReservableExiste(tipoEntidad, entidadId);
      if (!validacionEntidad.valid) {
        return res.status(404).json({
          message: "Entidad reservable no encontrada",
          details: validacionEntidad.message
        });
      }
    }

    if (value.serviciosAdicionales && value.serviciosAdicionales.length > 0) {
      const validacionServicios = await validarServiciosAdicionalesExisten(value.serviciosAdicionales);
      if (!validacionServicios.valid) {
        return res.status(404).json({
          message: "Servicios adicionales no encontrados",
          details: validacionServicios.message,
          invalidIds: validacionServicios.invalidIds
        });
      }
    }

    if (value.fechaInicio || value.fechaFin) {
      const fechaInicio = new Date(value.fechaInicio || reservaExistente.fechaInicio);
      const fechaFin = new Date(value.fechaFin || reservaExistente.fechaFin);

      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "Las fechas deben tener un formato válido"
        });
      }

      if (fechaInicio >= fechaFin) {
        return res.status(400).json({
          message: "Error en las fechas de la reserva",
          details: "La fecha de inicio debe ser anterior a la fecha de fin"
        });
      }
    }

    const reserva = await updateReserva(id, value);
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

    if (error.message && (error.message.includes('no modificable') || error.message.includes('cannot be modified'))) {
      return res.status(400).json({
        message: "Reserva no modificable",
        details: "La reserva no puede ser modificada en su estado actual"
      });
    }

    if (error.message && (error.message.includes('solapamiento') || error.message.includes('overlap'))) {
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
      return res.status(404).json({
        message: `No se ha encontrado la reserva con id: ${id}`
      });
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

    if (error.message && (error.message.includes('no eliminable') || error.message.includes('cannot be deleted'))) {
      return res.status(400).json({
        message: "Reserva no eliminable",
        details: "La reserva no puede ser eliminada en su estado actual"
      });
    }

    if (error.message && (error.message.includes('pagos asociados') || error.message.includes('associated payments'))) {
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

  if (!ESTADOS_RESERVA_VALIDOS.includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: `El estado debe ser uno de: ${ESTADOS_RESERVA_VALIDOS.join(', ')}`
    });
  }

  try {
    const reservaExistente = await findReservaById(id);
    if (!reservaExistente) {
      return res.status(404).json({
        message: `No se ha encontrado la reserva con id: ${id}`
      });
    }

    const reserva = await cambiarEstadoReserva(id, estado);
    res.status(200).json({
      message: "Estado actualizado correctamente",
      reserva
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de reserva inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && (error.message.includes('transición no permitida') || error.message.includes('transition not allowed'))) {
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
    const reservaExistente = await findReservaById(id);
    if (!reservaExistente) {
      return res.status(404).json({
        message: `No se ha encontrado la reserva con id: ${id}`
      });
    }

    const validacionAprobador = await validarUsuarioExiste(aprobadorId);
    if (!validacionAprobador.valid) {
      return res.status(404).json({
        message: "Aprobador no encontrado",
        details: validacionAprobador.message
      });
    }

    const reserva = await aprobarReserva(id, aprobadorId, notas);
    res.status(200).json({
      message: "Reserva aprobada correctamente",
      reserva,
      aprobador: {
        id: validacionAprobador.user._id,
        nombre: validacionAprobador.user.nombre,
        email: validacionAprobador.user.email
      }
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Formato de ID inválido",
        details: "El formato de uno de los IDs no es válido"
      });
    }

    if (error.message && (error.message.includes('no pendiente') || error.message.includes('not pending'))) {
      return res.status(400).json({
        message: "Reserva no pendiente",
        details: "Solo se pueden aprobar reservas en estado pendiente"
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
  const { aprobadorId, motivo } = req.body;

  if (!aprobadorId || !motivo) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requiere ID del aprobador y motivo de rechazo"
    });
  }

  try {
    const reservaExistente = await findReservaById(id);
    if (!reservaExistente) {
      return res.status(404).json({
        message: `No se ha encontrado la reserva con id: ${id}`
      });
    }

    const validacionAprobador = await validarUsuarioExiste(aprobadorId);
    if (!validacionAprobador.valid) {
      return res.status(404).json({
        message: "Aprobador no encontrado",
        details: validacionAprobador.message
      });
    }

    const reserva = await rechazarReserva(id, aprobadorId, motivo);
    return res.status(200).json({
      message: "Reserva rechazada correctamente",
      reserva,
      aprobador: {
        id: validacionAprobador.user._id,
        nombre: validacionAprobador.user.nombre,
        email: validacionAprobador.user.email
      }
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Formato de ID inválido",
        details: "El formato de uno de los IDs no es válido"
      });
    }

    if (error.message && (error.message.includes('no pendiente') || error.message.includes('not pending'))) {
      return res.status(400).json({
        message: "Reserva no pendiente",
        details: "Solo se pueden rechazar reservas en estado pendiente"
      });
    }

    return res.status(500).json({
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
    const reservaExistente = await findReservaById(id);
    if (!reservaExistente) {
      return res.status(404).json({
        message: `No se ha encontrado la reserva con id: ${id}`
      });
    }

    const reserva = await vincularPagoReserva(id, pagoId);
    res.status(200).json({
      message: "Pago vinculado correctamente",
      reserva
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Formato de ID inválido",
        details: "El formato de uno de los IDs no es válido"
      });
    }

    if (error.message && (error.message.includes('pago no encontrado') || error.message.includes('payment not found'))) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se encontró el pago con id: ${pagoId}`
      });
    }

    if (error.message && (error.message.includes('ya vinculado') || error.message.includes('already linked'))) {
      return res.status(400).json({
        message: "Pago ya vinculado",
        details: "El pago ya está vinculado a esta u otra reserva"
      });
    }

    if (error.message && (error.message.includes('estado incorrecto') || error.message.includes('wrong state'))) {
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
    const reservaExistente = await findReservaById(reservaId);
    if (!reservaExistente) {
      return res.status(404).json({
        message: `No se ha encontrado la reserva con id: ${reservaId}`
      });
    }

    const reserva = await cambiarEstadoReserva(reservaId, 'cancelada');

    try {
      const reservaActualizada = await updateReserva(reservaId, {
        motivoCancelacion: motivo,
        fechaCancelacion: new Date(),
        reembolsoSolicitado: solicitarReembolso
      });

      res.status(200).json({
        message: "Reserva cancelada correctamente",
        reserva: reservaActualizada
      });
    } catch (updateError) {
      console.error("Error al actualizar detalles de cancelación:", updateError);
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

    if (error.message && (error.message.includes('no se puede cancelar') || error.message.includes('cannot cancel'))) {
      return res.status(400).json({
        message: "Reserva no cancelable",
        details: "La reserva no puede ser cancelada en su estado actual o ha pasado el plazo para cancelación"
      });
    }

    if (error.message && (error.message.includes('políticas de cancelación') || error.message.includes('cancellation policy'))) {
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

// NUEVA: Obtener reservas por cliente/propietario
const getReservasByClienteController = async (req, res) => {
  const { clienteId } = req.params;

  try {
    // Validar que el cliente existe
    const validacionCliente = await validarUsuarioExiste(clienteId);
    if (!validacionCliente.valid) {
      return res.status(404).json({
        message: "Cliente no encontrado",
        details: validacionCliente.message
      });
    }

    const reservas = await getReservasByCliente(clienteId);

    // Agregar información adicional
    const resumen = {
      totalReservas: reservas.length,
      reservasConfirmadas: reservas.filter(r => r.estado === 'confirmada').length,
      reservasCompletadas: reservas.filter(r => r.estado === 'completada').length,
      reservasCanceladas: reservas.filter(r => r.estado === 'cancelada').length,
      ingresosTotales: reservas
        .filter(r => ['confirmada', 'completada'].includes(r.estado))
        .reduce((total, r) => total + (r.precioFinalPagado || 0), 0)
    };

    res.status(200).json({
      cliente: {
        id: validacionCliente.user._id,
        nombre: validacionCliente.user.nombre,
        email: validacionCliente.user.email
      },
      resumen,
      reservas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener reservas del cliente",
      details: error.message
    });
  }
};

// NUEVA: Obtener estadísticas de ganancias por cliente
const getEstadisticasGananciasClienteController = async (req, res) => {
  const { clienteId } = req.params;
  const { fechaInicio, fechaFin } = req.query;

  try {
    // Validar que el cliente existe
    const validacionCliente = await validarUsuarioExiste(clienteId);
    if (!validacionCliente.valid) {
      return res.status(404).json({
        message: "Cliente no encontrado",
        details: validacionCliente.message
      });
    }

    // Validar fechas si se proporcionan
    let inicio = null;
    let fin = null;

    if (fechaInicio) {
      inicio = new Date(fechaInicio);
      if (isNaN(inicio.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de inicio debe tener un formato válido (YYYY-MM-DD)"
        });
      }
    }

    if (fechaFin) {
      fin = new Date(fechaFin);
      if (isNaN(fin.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de fin debe tener un formato válido (YYYY-MM-DD)"
        });
      }
    }

    if (inicio && fin && inicio > fin) {
      return res.status(400).json({
        message: "Rango de fechas inválido",
        details: "La fecha de inicio debe ser anterior a la fecha de fin"
      });
    }

    const estadisticas = await getEstadisticasGananciasCliente(clienteId, inicio, fin);

    // Agregar estadísticas adicionales
    const reservasPorMes = {};
    const ingresosPorMes = {};

    estadisticas.reservas.forEach(reserva => {
      const fecha = new Date(reserva.fechaInicio);
      const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

      reservasPorMes[mesAno] = (reservasPorMes[mesAno] || 0) + 1;
      ingresosPorMes[mesAno] = (ingresosPorMes[mesAno] || 0) + (reserva.precioFinalPagado || 0);
    });

    // Estadísticas por tipo de entidad
    const estadisticasPorTipo = {};
    estadisticas.reservas.forEach(reserva => {
      const tipo = reserva.entidadReservada?.tipo || 'desconocido';
      if (!estadisticasPorTipo[tipo]) {
        estadisticasPorTipo[tipo] = {
          cantidad: 0,
          ingresos: 0
        };
      }
      estadisticasPorTipo[tipo].cantidad += 1;
      estadisticasPorTipo[tipo].ingresos += reserva.precioFinalPagado || 0;
    });

    res.status(200).json({
      cliente: {
        id: validacionCliente.user._id,
        nombre: validacionCliente.user.nombre,
        email: validacionCliente.user.email
      },
      periodo: {
        fechaInicio: inicio?.toISOString().split('T')[0] || 'Sin límite',
        fechaFin: fin?.toISOString().split('T')[0] || 'Sin límite'
      },
      estadisticasGenerales: {
        totalReservas: estadisticas.totalReservas,
        totalGanancias: Math.round(estadisticas.totalGanancias * 100) / 100,
        promedioGananciasPorReserva: Math.round(estadisticas.promedioGananciasPorReserva * 100) / 100
      },
      estadisticasPorMes: {
        reservasPorMes,
        ingresosPorMes: Object.fromEntries(
          Object.entries(ingresosPorMes).map(([mes, ingreso]) => [
            mes,
            Math.round(ingreso * 100) / 100
          ])
        )
      },
      estadisticasPorTipo,
      reservasDetalle: estadisticas.reservas.map(reserva => ({
        id: reserva._id,
        fechaInicio: reserva.fechaInicio,
        fechaFin: reserva.fechaFin,
        estado: reserva.estado,
        precioTotal: reserva.precioTotal,
        precioFinalPagado: reserva.precioFinalPagado,
        entidadReservada: reserva.entidadReservada,
        usuario: reserva.usuarioId
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener estadísticas de ganancias",
      details: error.message
    });
  }
};

// Actualización del filtrarReservasController para incluir clienteId
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
    const filtros = {};

    // Validar usuario si se proporciona
    if (value.usuarioId) {
      const validacionUsuario = await validarUsuarioExiste(value.usuarioId);
      if (!validacionUsuario.valid) {
        return res.status(404).json({
          message: "Usuario no encontrado en filtros",
          details: validacionUsuario.message
        });
      }
      filtros.usuarioId = value.usuarioId;
    }

    // NUEVO: Validar cliente si se proporciona
    if (value.clienteId) {
      const validacionCliente = await validarUsuarioExiste(value.clienteId);
      if (!validacionCliente.valid) {
        return res.status(404).json({
          message: "Cliente no encontrado en filtros",
          details: validacionCliente.message
        });
      }
      filtros.clienteId = value.clienteId;
    }

    // Validar tipo de entidad
    if (value.tipoEntidad) {
      if (!ENTIDADES_RESERVABLES_VALIDAS.includes(value.tipoEntidad)) {
        return res.status(400).json({
          message: "Tipo de entidad inválido en filtros",
          details: `El tipo de entidad debe ser una de: ${ENTIDADES_RESERVABLES_VALIDAS.join(', ')}`
        });
      }
      filtros['entidadReservada.tipo'] = value.tipoEntidad;

      if (value.entidadId) {
        const validacionEntidad = await validarEntidadReservableExiste(value.tipoEntidad, value.entidadId);
        if (!validacionEntidad.valid) {
          return res.status(404).json({
            message: "Entidad no encontrada en filtros",
            details: validacionEntidad.message
          });
        }
        filtros['entidadReservada.id'] = value.entidadId;
      }
    }

    if (value.estado) {
      if (!ESTADOS_RESERVA_VALIDOS.includes(value.estado)) {
        return res.status(400).json({
          message: "Estado inválido en filtros",
          details: `El estado debe ser uno de: ${ESTADOS_RESERVA_VALIDOS.join(', ')}`
        });
      }
      filtros.estado = value.estado;
    }

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

    // NUEVO: Filtros por precio
    if (value.precioMinimo !== undefined) {
      filtros.precioFinalPagado = { ...filtros.precioFinalPagado, $gte: value.precioMinimo };
    }

    if (value.precioMaximo !== undefined) {
      filtros.precioFinalPagado = { ...filtros.precioFinalPagado, $lte: value.precioMaximo };
    }

    if (value.esRecurrente !== undefined) filtros.esRecurrente = value.esRecurrente;

    const reservas = await getReservas(filtros);

    // Agregar estadísticas de los resultados filtrados
    const estadisticas = {
      totalResultados: reservas.length,
      ingresosTotales: reservas.reduce((total, r) => total + (r.precioFinalPagado || 0), 0),
      estadoDistribucion: reservas.reduce((acc, r) => {
        acc[r.estado] = (acc[r.estado] || 0) + 1;
        return acc;
      }, {})
    };

    res.status(200).json({
      filtrosAplicados: value,
      estadisticas,
      reservas
    });
  } catch (error) {
    console.error(error);
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
  filtrarReservasController,
  getReservasByClienteController,
  getEstadisticasGananciasClienteController,
  filtrarReservasController // Actualizada
};