const {
  getNotificaciones,
  findNotificacionById,
  getNotificacionesByUsuario,
  getNotificacionesPorTipo,
  getNotificacionesPendientes,
  createNotificacion,
  updateNotificacion,
  deleteNotificacion,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacionesExpiradas,
  getNotificacionesPorEntidad
} = require("../repositories/notificacion.repository");
const { 
  createNotificacionSchema, 
  updateNotificacionSchema,
  marcarLeidaSchema,
  filtrarNotificacionesSchema
} = require("../routes/validations/notificacion.validation");

const getNotificacionesController = async (req, res) => {
  try {
    const notificaciones = await getNotificaciones();
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener las notificaciones", 
      details: error.message
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
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de usuario inválido", 
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('usuario no encontrado')) {
      return res.status(404).json({ 
        message: "Usuario no encontrado", 
        details: `No existe un usuario con id: ${usuarioId}`
      });
    }
    
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
    // Validar tipo de notificación
    const tiposValidos = ['sistema', 'reserva', 'pago', 'mensaje', 'alerta'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ 
        message: "Tipo de notificación inválido", 
        details: `Los tipos válidos son: ${tiposValidos.join(', ')}`,
        field: "tipo"
      });
    }
    
    const notificaciones = await getNotificacionesPorTipo(tipo, destinatarioId);
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de destinatario inválido", 
        details: `El formato del ID no es válido`
      });
    }
    
    if (error.message && error.message.includes('destinatario no encontrado')) {
      return res.status(404).json({ 
        message: "Destinatario no encontrado", 
        details: `No existe un destinatario con id: ${destinatarioId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener notificaciones por tipo", 
      details: error.message 
    });
  }
};

const getNotificacionesPendientesController = async (req, res) => {
  const { usuarioId } = req.params;
  
  try {
    const notificaciones = await getNotificacionesPendientes(usuarioId);
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de usuario inválido", 
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('usuario no encontrado')) {
      return res.status(404).json({ 
        message: "Usuario no encontrado", 
        details: `No existe un usuario con id: ${usuarioId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener notificaciones pendientes", 
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
    const notificacion = await createNotificacion(value);
    res.status(201).json({ message: "Notificación creada correctamente", notificacion });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación en modelo", 
        details: errors
      });
    }
    
    if (error.message && error.message.includes('destinatario no encontrado')) {
      return res.status(404).json({ 
        message: "Destinatario no encontrado", 
        details: "El destinatario especificado no existe",
        field: "destinatarioId"
      });
    }
    
    if (error.message && error.message.includes('entidad no encontrada')) {
      return res.status(404).json({ 
        message: "Entidad no encontrada", 
        details: "La entidad relacionada no existe",
        field: "entidadId"
      });
    }
    
    if (error.message && error.message.includes('tipo de notificación')) {
      return res.status(400).json({ 
        message: "Tipo de notificación inválido", 
        details: error.message,
        field: "tipoNotificacion"
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
    const notificacion = await updateNotificacion(id, value);
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
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación en modelo", 
        details: errors
      });
    }
    
    if (error.message && error.message.includes('notificación leída')) {
      return res.status(400).json({ 
        message: "Notificación no modificable", 
        details: "No se puede modificar una notificación que ya ha sido leída",
        field: "leido"
      });
    }
    
    if (error.message && error.message.includes('tipo de notificación')) {
      return res.status(400).json({ 
        message: "Tipo de notificación inválido", 
        details: error.message,
        field: "tipoNotificacion"
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
    const notificacion = await deleteNotificacion(id);
    if (!notificacion) {
      return res.status(404).json({ 
        message: "Notificación no encontrada", 
        details: `No se ha encontrado la notificación con id: ${id}` 
      });
    }
    res.status(200).json({ message: "Notificación eliminada correctamente" });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de notificación inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('no eliminable')) {
      return res.status(400).json({ 
        message: "Notificación no eliminable", 
        details: error.message
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
    const notificacion = await marcarComoLeida(notificacionId);
    if (!notificacion) {
      return res.status(404).json({ 
        message: "Notificación no encontrada", 
        details: `No se ha encontrado la notificación con id: ${notificacionId}`
      });
    }
    res.status(200).json({ message: "Notificación marcada como leída", notificacion });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de notificación inválido", 
        details: `El formato del ID '${notificacionId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('ya leída')) {
      return res.status(400).json({ 
        message: "Notificación ya leída", 
        details: "La notificación ya fue marcada como leída anteriormente"
      });
    }
    
    res.status(500).json({ 
      message: "Error al marcar la notificación como leída", 
      details: error.message 
    });
  }
};

const marcarTodasComoLeidasController = async (req, res) => {
  const { usuarioId } = req.params;
  
  try {
    const resultado = await marcarTodasComoLeidas(usuarioId);
    
    if (resultado.modifiedCount === 0) {
      return res.status(200).json({ 
        message: "No hay notificaciones pendientes para marcar", 
        cantidad: 0 
      });
    }
    
    res.status(200).json({ 
      message: "Notificaciones marcadas como leídas", 
      cantidad: resultado.modifiedCount 
    });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de usuario inválido", 
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('usuario no encontrado')) {
      return res.status(404).json({ 
        message: "Usuario no encontrado", 
        details: `No existe un usuario con id: ${usuarioId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al marcar todas las notificaciones como leídas", 
      details: error.message 
    });
  }
};

const eliminarNotificacionesExpiradasController = async (req, res) => {
  try {
    const resultado = await eliminarNotificacionesExpiradas();
    
    if (resultado.deletedCount === 0) {
      return res.status(200).json({ 
        message: "No hay notificaciones expiradas para eliminar", 
        cantidad: 0 
      });
    }
    
    res.status(200).json({ 
      message: "Notificaciones expiradas eliminadas", 
      cantidad: resultado.deletedCount 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al eliminar notificaciones expiradas", 
      details: error.message 
    });
  }
};

const getNotificacionesPorEntidadController = async (req, res) => {
  const { tipoEntidad, entidadId } = req.params;
  
  // Validar tipo de entidad
  const tiposEntidadValidos = ['reserva', 'pago', 'factura', 'oficina', 'usuario', 'edificio', 'membresia'];
  if (!tiposEntidadValidos.includes(tipoEntidad)) {
    return res.status(400).json({ 
      message: "Tipo de entidad inválido", 
      details: `Los tipos de entidad válidos son: ${tiposEntidadValidos.join(', ')}`,
      field: "tipoEntidad"
    });
  }
  
  try {
    const notificaciones = await getNotificacionesPorEntidad(tipoEntidad, entidadId);
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de entidad inválido", 
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('entidad no encontrada')) {
      return res.status(404).json({ 
        message: "Entidad no encontrada", 
        details: `No existe una entidad de tipo ${tipoEntidad} con id: ${entidadId}`
      });
    }
    
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
    // Convertir a filtros de MongoDB
    const filtros = {};
    
    if (value.destinatarioId) filtros.destinatarioId = value.destinatarioId;
    
    if (value.tipoNotificacion) {
      // Validar tipo de notificación
      const tiposValidos = ['sistema', 'reserva', 'pago', 'mensaje', 'alerta'];
      if (!tiposValidos.includes(value.tipoNotificacion)) {
        return res.status(400).json({ 
          message: "Tipo de notificación inválido", 
          details: `Los tipos válidos son: ${tiposValidos.join(', ')}`,
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
      // Validar prioridad
      const prioridadesValidas = ['alta', 'media', 'baja'];
      if (!prioridadesValidas.includes(value.prioridad)) {
        return res.status(400).json({ 
          message: "Prioridad inválida", 
          details: `Las prioridades válidas son: ${prioridadesValidas.join(', ')}`,
          field: "prioridad"
        });
      }
      filtros.prioridad = value.prioridad;
    }
    
    // Manejo de fechas
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
    
    // Validar que la fecha desde no sea posterior a la fecha hasta
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
  getNotificacionesPendientesController,
  createNotificacionController,
  updateNotificacionController,
  deleteNotificacionController,
  marcarComoLeidaController,
  marcarTodasComoLeidasController,
  eliminarNotificacionesExpiradasController,
  getNotificacionesPorEntidadController,
  filtrarNotificacionesController
};