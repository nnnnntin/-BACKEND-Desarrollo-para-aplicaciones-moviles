const {
  getNotificaciones,
  findNotificacionById,
  getNotificacionesByUsuario,
  getNotificacionesPorTipo,
  createNotificacion,
  updateNotificacion,
  deleteNotificacion,
  marcarComoLeida,
  marcarTodasComoLeidas,
  getNotificacionesPorEntidad
} = require("../repositories/notificacion.repository");
const {
  createNotificacionSchema,
  updateNotificacionSchema,
  marcarLeidaSchema,
  filtrarNotificacionesSchema
} = require("../routes/validations/notificacion.validation");

const { findUsuarioById } = require("../repositories/usuario.repository");
const { findReservaById } = require("../repositories/reserva.repository");
const { findPagoById } = require("../repositories/pago.repository");
const { findOficinaById } = require("../repositories/oficina.repository");
const { findMembresiaById } = require("../repositories/membresia.repository");

const ENTIDAD_MAP = {
  'reserva': findReservaById,
  'pago': findPagoById,
  'oficina': findOficinaById,
  'usuario': findUsuarioById,
  'membresia': findMembresiaById
};

const TIPOS_ENTIDAD_VALIDOS = ['reserva', 'pago', 'oficina', 'usuario', 'membresia'];
const TIPOS_NOTIFICACION_VALIDOS = ['reserva', 'pago', 'sistema', 'recordatorio', 'promocion'];
const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta'];

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
 * Valida que una entidad relacionada existe
 * @param {string} tipo - Tipo de entidad
 * @param {string} id - ID de la entidad
 * @returns {Promise<Object>} - { valid: boolean, entity: Object|null, message: string }
 */
const validarEntidadRelacionadaExiste = async (tipo, id) => {
  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipo)) {
    return {
      valid: false,
      entity: null,
      message: `Tipo de entidad no válido: ${tipo}. Debe ser uno de: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`
    };
  }

  const findEntidadById = ENTIDAD_MAP[tipo];
  
  try {
    const entidad = await findEntidadById(id);
    
    if (!entidad) {
      return {
        valid: false,
        entity: null,
        message: `No se encontró la entidad de tipo ${tipo} con ID: ${id}`
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
        message: `Formato de ID inválido para ${tipo}: ${id}`
      };
    }
    throw error;
  }
};

/**
 * Valida que una notificación existe
 * @param {string} notificacionId - ID de la notificación a validar
 * @returns {Promise<Object>} - { valid: boolean, notificacion: Object|null, message: string }
 */
const validarNotificacionExiste = async (notificacionId) => {
  try {
    const notificacion = await findNotificacionById(notificacionId);
    
    if (!notificacion) {
      return {
        valid: false,
        notificacion: null,
        message: `No se encontró la notificación con ID: ${notificacionId}`
      };
    }

    return {
      valid: true,
      notificacion: notificacion,
      message: 'Notificación válida'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        notificacion: null,
        message: `Formato de ID de notificación inválido: ${notificacionId}`
      };
    }
    throw error;
  }
};

const getNotificacionesController = async (req, res) => {
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
    const notificaciones = await getNotificaciones(filtros, skipNum, limitNum);
    return res.status(200).json(notificaciones);
  } catch (error) {
    console.error("[Error Controller] al obtener notificaciones", error);
    return res.status(500).json({
      message: "Error al obtener las notificaciones",
      details: error.message,
    });
  }
};

const getNotificacionByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const notificacion = await findNotificacionById(id);
    if (!notificacion) {
      return res.status(404).json({
        message: "Notificación no encontrada",
        details: `No se ha encontrado la notificación con id: ${id}`
      });
    }
    res.status(200).json(notificacion);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de notificación inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar la notificación",
      details: error.message
    });
  }
};

const getNotificacionesByUsuarioController = async (req, res) => {
  const { usuarioId } = req.params;
  const { leidas } = req.query;

  try {
        const validacionUsuario = await validarUsuarioExiste(usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

    let leidasBoolean = null;

    if (leidas !== undefined) {
      if (leidas === 'true') {
        leidasBoolean = true;
      } else if (leidas === 'false') {
        leidasBoolean = false;
      } else {
        return res.status(400).json({
          message: "Valor de parámetro inválido",
          details: "El parámetro 'leidas' debe ser 'true' o 'false'",
          field: "leidas"
        });
      }
    }

    const notificaciones = await getNotificacionesByUsuario(usuarioId, leidasBoolean);
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener notificaciones del usuario",
      details: error.message
    });
  }
};

const getNotificacionesPorTipoController = async (req, res) => {
  const { tipo } = req.params;
  const { destinatarioId } = req.query;

  try {
    if (!TIPOS_NOTIFICACION_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        message: "Tipo de notificación inválido",
        details: `Los tipos válidos son: ${TIPOS_NOTIFICACION_VALIDOS.join(', ')}`,
        field: "tipo"
      });
    }

        if (destinatarioId) {
      const validacionDestinatario = await validarUsuarioExiste(destinatarioId);
      if (!validacionDestinatario.valid) {
        return res.status(404).json({
          message: "Destinatario no encontrado",
          details: validacionDestinatario.message
        });
      }
    }

    const notificaciones = await getNotificacionesPorTipo(tipo, destinatarioId);
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener notificaciones por tipo",
      details: error.message
    });
  }
};

const createNotificacionController = async (req, res) => {
  const { error, value } = createNotificacionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        const validacionDestinatario = await validarUsuarioExiste(value.destinatarioId);
    if (!validacionDestinatario.valid) {
      return res.status(404).json({
        message: "Destinatario no encontrado",
        details: validacionDestinatario.message
      });
    }

        if (value.remitenteId) {
      const validacionRemitente = await validarUsuarioExiste(value.remitenteId);
      if (!validacionRemitente.valid) {
        return res.status(404).json({
          message: "Remitente no encontrado",
          details: validacionRemitente.message
        });
      }
    }

        if (value.entidadRelacionada && value.entidadRelacionada.tipo && value.entidadRelacionada.id) {
      const { tipo, id } = value.entidadRelacionada;
      const validacionEntidad = await validarEntidadRelacionadaExiste(tipo, id);
      if (!validacionEntidad.valid) {
        return res.status(404).json({
          message: "Entidad relacionada no encontrada",
          details: validacionEntidad.message
        });
      }
    }

        if (!TIPOS_NOTIFICACION_VALIDOS.includes(value.tipoNotificacion)) {
      return res.status(400).json({
        message: "Tipo de notificación inválido",
        details: `El tipo debe ser uno de: ${TIPOS_NOTIFICACION_VALIDOS.join(', ')}`
      });
    }

        if (value.prioridad && !PRIORIDADES_VALIDAS.includes(value.prioridad)) {
      return res.status(400).json({
        message: "Prioridad inválida",
        details: `La prioridad debe ser una de: ${PRIORIDADES_VALIDAS.join(', ')}`
      });
    }

        if (value.expirar) {
      const fechaExpiracion = new Date(value.expirar);
      const fechaActual = new Date();
      
      if (isNaN(fechaExpiracion.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de expiración debe tener un formato válido"
        });
      }

      if (fechaExpiracion <= fechaActual) {
        return res.status(400).json({
          message: "Fecha de expiración inválida",
          details: "La fecha de expiración debe ser posterior a la fecha actual"
        });
      }
    }

    const notificacion = await createNotificacion(value);
    res.status(201).json({ 
      message: "Notificación creada correctamente", 
      notificacion,
      destinatarioValidado: {
        id: validacionDestinatario.user._id,
        nombre: validacionDestinatario.user.nombre,
        email: validacionDestinatario.user.email
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

    res.status(500).json({
      message: "Error al crear la notificación",
      details: error.message
    });
  }
};

const updateNotificacionController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateNotificacionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        const notificacionExistente = await findNotificacionById(id);
    if (!notificacionExistente) {
      return res.status(404).json({
        message: "Notificación no encontrada",
        details: `No se ha encontrado la notificación con id: ${id}`
      });
    }

        if (notificacionExistente.leido) {
      return res.status(400).json({
        message: "Notificación no modificable",
        details: "No se puede modificar una notificación que ya ha sido leída"
      });
    }

        if (value.destinatarioId && value.destinatarioId !== notificacionExistente.destinatarioId.toString()) {
      const validacionDestinatario = await validarUsuarioExiste(value.destinatarioId);
      if (!validacionDestinatario.valid) {
        return res.status(404).json({
          message: "Destinatario no encontrado",
          details: validacionDestinatario.message
        });
      }
    }

        if (value.remitenteId) {
      const validacionRemitente = await validarUsuarioExiste(value.remitenteId);
      if (!validacionRemitente.valid) {
        return res.status(404).json({
          message: "Remitente no encontrado",
          details: validacionRemitente.message
        });
      }
    }

        if (value.entidadRelacionada && value.entidadRelacionada.tipo && value.entidadRelacionada.id) {
      const { tipo, id: entidadId } = value.entidadRelacionada;
      const validacionEntidad = await validarEntidadRelacionadaExiste(tipo, entidadId);
      if (!validacionEntidad.valid) {
        return res.status(404).json({
          message: "Entidad relacionada no encontrada",
          details: validacionEntidad.message
        });
      }
    }

        if (value.tipoNotificacion && !TIPOS_NOTIFICACION_VALIDOS.includes(value.tipoNotificacion)) {
      return res.status(400).json({
        message: "Tipo de notificación inválido",
        details: `El tipo debe ser uno de: ${TIPOS_NOTIFICACION_VALIDOS.join(', ')}`
      });
    }

        if (value.prioridad && !PRIORIDADES_VALIDAS.includes(value.prioridad)) {
      return res.status(400).json({
        message: "Prioridad inválida",
        details: `La prioridad debe ser una de: ${PRIORIDADES_VALIDAS.join(', ')}`
      });
    }

        if (value.expirar) {
      const fechaExpiracion = new Date(value.expirar);
      const fechaActual = new Date();
      
      if (isNaN(fechaExpiracion.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de expiración debe tener un formato válido"
        });
      }

      if (fechaExpiracion <= fechaActual) {
        return res.status(400).json({
          message: "Fecha de expiración inválida",
          details: "La fecha de expiración debe ser posterior a la fecha actual"
        });
      }
    }

    const notificacion = await updateNotificacion(id, value);
    res.status(200).json({
      message: "Notificación actualizada correctamente",
      notificacion
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de notificación inválido",
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
      message: "Error al actualizar la notificación",
      details: error.message
    });
  }
};

const deleteNotificacionController = async (req, res) => {
  const { id } = req.params;
  try {
        const notificacionExistente = await findNotificacionById(id);
    if (!notificacionExistente) {
      return res.status(404).json({
        message: "Notificación no encontrada",
        details: `No se ha encontrado la notificación con id: ${id}`
      });
    }

        if (notificacionExistente.tipoNotificacion === 'sistema' && !notificacionExistente.leido) {
      return res.status(400).json({
        message: "Notificación no eliminable",
        details: "No se pueden eliminar notificaciones de sistema no leídas"
      });
    }

    const notificacion = await deleteNotificacion(id);
    res.status(200).json({ message: "Notificación eliminada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de notificación inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al eliminar la notificación",
      details: error.message
    });
  }
};

const marcarComoLeidaController = async (req, res) => {
  const { error, value } = marcarLeidaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { notificacionId } = value;

  try {
        const validacionNotificacion = await validarNotificacionExiste(notificacionId);
    if (!validacionNotificacion.valid) {
      return res.status(404).json({
        message: "Notificación no encontrada",
        details: validacionNotificacion.message
      });
    }

        if (validacionNotificacion.notificacion.leido) {
      return res.status(400).json({
        message: "Notificación ya leída",
        details: "La notificación ya fue marcada como leída anteriormente"
      });
    }

    const notificacion = await marcarComoLeida(notificacionId);
    res.status(200).json({ 
      message: "Notificación marcada como leída", 
      notificacion 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al marcar la notificación como leída",
      details: error.message
    });
  }
};

const marcarTodasComoLeidasController = async (req, res) => {
  const { usuarioId } = req.params;

  try {
        const validacionUsuario = await validarUsuarioExiste(usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

    const resultado = await marcarTodasComoLeidas(usuarioId);

    if (resultado.modifiedCount === 0) {
      return res.status(200).json({
        message: "No hay notificaciones pendientes para marcar",
        cantidad: 0
      });
    }

    res.status(200).json({
      message: "Notificaciones marcadas como leídas",
      cantidad: resultado.modifiedCount,
      usuario: {
        id: validacionUsuario.user._id,
        nombre: validacionUsuario.user.nombre,
        email: validacionUsuario.user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al marcar todas las notificaciones como leídas",
      details: error.message
    });
  }
};

const getNotificacionesPorEntidadController = async (req, res) => {
  const { tipoEntidad, entidadId } = req.params;

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `Los tipos de entidad válidos son: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`,
      field: "tipoEntidad"
    });
  }

  try {
        const validacionEntidad = await validarEntidadRelacionadaExiste(tipoEntidad, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

    const notificaciones = await getNotificacionesPorEntidad(tipoEntidad, entidadId);
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener notificaciones por entidad",
      details: error.message
    });
  }
};

const filtrarNotificacionesController = async (req, res) => {
  const { error, value } = filtrarNotificacionesSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los filtros",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const filtros = {};

        if (value.destinatarioId) {
      const validacionDestinatario = await validarUsuarioExiste(value.destinatarioId);
      if (!validacionDestinatario.valid) {
        return res.status(404).json({
          message: "Destinatario no encontrado en filtros",
          details: validacionDestinatario.message
        });
      }
      filtros.destinatarioId = value.destinatarioId;
    }

    if (value.tipoNotificacion) {
      if (!TIPOS_NOTIFICACION_VALIDOS.includes(value.tipoNotificacion)) {
        return res.status(400).json({
          message: "Tipo de notificación inválido",
          details: `Los tipos válidos son: ${TIPOS_NOTIFICACION_VALIDOS.join(', ')}`,
          field: "tipoNotificacion"
        });
      }
      filtros.tipoNotificacion = value.tipoNotificacion;
    }

    if (value.leido !== undefined) {
      if (typeof value.leido === 'string') {
        if (value.leido === 'true') {
          filtros.leido = true;
        } else if (value.leido === 'false') {
          filtros.leido = false;
        } else {
          return res.status(400).json({
            message: "Valor de parámetro inválido",
            details: "El parámetro 'leido' debe ser un booleano o 'true'/'false'",
            field: "leido"
          });
        }
      } else {
        filtros.leido = value.leido;
      }
    }

    if (value.prioridad) {
      if (!PRIORIDADES_VALIDAS.includes(value.prioridad)) {
        return res.status(400).json({
          message: "Prioridad inválida",
          details: `Las prioridades válidas son: ${PRIORIDADES_VALIDAS.join(', ')}`,
          field: "prioridad"
        });
      }
      filtros.prioridad = value.prioridad;
    }

    if (value.desde) {
      const fechaDesde = new Date(value.desde);

      if (isNaN(fechaDesde.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha 'desde' debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "desde"
        });
      }

      filtros.createdAt = { $gte: fechaDesde };
    }

    if (value.hasta) {
      const fechaHasta = new Date(value.hasta);

      if (isNaN(fechaHasta.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha 'hasta' debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "hasta"
        });
      }

      if (filtros.createdAt) {
        filtros.createdAt.$lte = fechaHasta;
      } else {
        filtros.createdAt = { $lte: fechaHasta };
      }
    }

    if (value.desde && value.hasta) {
      const fechaDesde = new Date(value.desde);
      const fechaHasta = new Date(value.hasta);

      if (fechaDesde > fechaHasta) {
        return res.status(400).json({
          message: "Rango de fechas inválido",
          details: "La fecha 'desde' debe ser anterior o igual a la fecha 'hasta'"
        });
      }
    }

    const notificaciones = await getNotificaciones(filtros);
    res.status(200).json(notificaciones);
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
      message: "Error al filtrar notificaciones",
      details: error.message
    });
  }
};

module.exports = {
  getNotificacionesController,
  getNotificacionByIdController,
  getNotificacionesByUsuarioController,
  getNotificacionesPorTipoController,
  createNotificacionController,
  updateNotificacionController,
  deleteNotificacionController,
  marcarComoLeidaController,
  marcarTodasComoLeidasController,
  getNotificacionesPorEntidadController,
  filtrarNotificacionesController
};