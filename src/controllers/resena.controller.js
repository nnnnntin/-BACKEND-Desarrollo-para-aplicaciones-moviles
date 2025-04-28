const {
  getResenas,
  findResenaById,
  getResenasByUsuario,
  getResenasByEntidad,
  getResenasByReserva,
  getResenasPorCalificacion,
  getResenasPendientesModeracion,
  createResena,
  updateResena,
  deleteResena,
  cambiarEstadoResena,
  responderResena,
  moderarResena,
  getPromedioCalificacionEntidad
} = require("../repositories/resena.repository");
const { 
  createResenaSchema, 
  updateResenaSchema,
  responderResenaSchema,
  moderarResenaSchema
} = require("../routes/validations/resena.validation");

const getResenasController = async (req, res) => {
  try {
    const resenas = await getResenas();
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener las reseñas", 
      details: error.message 
    });
  }
};

const getResenaByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const resena = await findResenaById(id);
    if (!resena) {
      return res.status(404).json({ message: `No se ha encontrado la reseña con id: ${id}` });
    }
    res.status(200).json(resena);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reseña inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    res.status(500).json({ 
      message: "Error al buscar la reseña", 
      details: error.message 
    });
  }
};

const getResenasByUsuarioController = async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const resenas = await getResenasByUsuario(usuarioId);
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de usuario inválido", 
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener reseñas del usuario", 
      details: error.message 
    });
  }
};

const getResenasByEntidadController = async (req, res) => {
  const { tipoEntidad, entidadId } = req.params;
  try {
    // Validar el tipo de entidad
    if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio', 'espacio'].includes(tipoEntidad)) {
      return res.status(400).json({ 
        message: "Tipo de entidad inválido",
        details: "El tipo de entidad debe ser uno de los siguientes: oficina, sala_reunion, escritorio_flexible, servicio, espacio"
      });
    }
    
    const resenas = await getResenasByEntidad(tipoEntidad, entidadId);
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de entidad inválido", 
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener reseñas de la entidad", 
      details: error.message 
    });
  }
};

const getResenasByReservaController = async (req, res) => {
  const { reservaId } = req.params;
  try {
    const resenas = await getResenasByReserva(reservaId);
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reserva inválido", 
        details: `El formato del ID '${reservaId}' no es válido`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener reseñas de la reserva", 
      details: error.message 
    });
  }
};

const getResenasPorCalificacionController = async (req, res) => {
  const { calificacionMinima } = req.query;
  
  if (!calificacionMinima || isNaN(calificacionMinima)) {
    return res.status(400).json({ 
      message: "Parámetro inválido", 
      details: "Se requiere una calificación mínima válida (número entre 0 y 5)"
    });
  }
  
  const calificacion = parseFloat(calificacionMinima);
  if (calificacion < 0 || calificacion > 5) {
    return res.status(400).json({ 
      message: "Calificación fuera de rango", 
      details: "La calificación debe estar entre 0 y 5"
    });
  }
  
  try {
    const resenas = await getResenasPorCalificacion(calificacion);
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener reseñas por calificación", 
      details: error.message 
    });
  }
};

const getResenasPendientesModeracionController = async (req, res) => {
  try {
    const resenas = await getResenasPendientesModeracion();
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener reseñas pendientes de moderación", 
      details: error.message 
    });
  }
};

const createResenaController = async (req, res) => {
  const { error, value } = createResenaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    // Aquí podría verificarse si el usuario tiene una reserva completada para la entidad
    const resena = await createResena(value);
    
    try {
      // Actualizar la calificación promedio de la entidad
      await actualizarPromedioEntidad(value.entidadResenada.tipo, value.entidadResenada.id);
      
      res.status(201).json({ message: "Reseña creada correctamente", resena });
    } catch (promError) {
      console.error("Error al actualizar promedio:", promError);
      // Continuamos aunque falle la actualización del promedio
      res.status(201).json({ 
        message: "Reseña creada correctamente, pero ocurrió un error al actualizar calificación promedio", 
        resena,
        warning: "No se pudo actualizar la calificación promedio de la entidad"
      });
    }
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación en modelo", 
        details: errors
      });
    }
    
    if (error.message && error.message.includes('ya ha reseñado') || error.message.includes('already reviewed')) {
      return res.status(400).json({ 
        message: "Reseña duplicada", 
        details: "El usuario ya ha creado una reseña para esta entidad"
      });
    }
    
    if (error.message && (error.message.includes('no encontrada') || error.message.includes('not found'))) {
      return res.status(404).json({ 
        message: "Entidad no encontrada", 
        details: "La entidad reseñada no existe en el sistema"
      });
    }
    
    if (error.message && error.message.includes('reserva')) {
      return res.status(400).json({ 
        message: "No se puede crear la reseña", 
        details: "El usuario no tiene una reserva completada para esta entidad"
      });
    }
    
    res.status(500).json({ 
      message: "Error al crear la reseña", 
      details: error.message 
    });
  }
};

const updateResenaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateResenaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    const resena = await updateResena(id, value);
    if (!resena) {
      return res.status(404).json({ message: `No se ha encontrado la reseña con id: ${id}` });
    }
    
    // Si la calificación cambió, actualizar el promedio de la entidad
    if (value.calificacion) {
      try {
        const resenaCompleta = await findResenaById(id);
        await actualizarPromedioEntidad(
          resenaCompleta.entidadResenada.tipo, 
          resenaCompleta.entidadResenada.id
        );
      } catch (promError) {
        console.error("Error al actualizar promedio:", promError);
        // Continuamos aunque falle la actualización del promedio
        return res.status(200).json({ 
          message: "Reseña actualizada, pero ocurrió un error al actualizar calificación promedio", 
          resena,
          warning: "No se pudo actualizar la calificación promedio de la entidad"
        });
      }
    }
    
    res.status(200).json(resena);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reseña inválido", 
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
    
    if (error.message && error.message.includes('no permitido') || error.message.includes('not allowed')) {
      return res.status(403).json({ 
        message: "Operación no permitida", 
        details: "No se permite modificar esta reseña"
      });
    }
    
    res.status(500).json({ 
      message: "Error al actualizar la reseña", 
      details: error.message 
    });
  }
};

const deleteResenaController = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener la reseña antes de eliminarla para actualizar el promedio después
    const resena = await findResenaById(id);
    if (!resena) {
      return res.status(404).json({ message: `No se ha encontrado la reseña con id: ${id}` });
    }
    
    await deleteResena(id);
    
    // Actualizar la calificación promedio de la entidad
    try {
      await actualizarPromedioEntidad(
        resena.entidadResenada.tipo, 
        resena.entidadResenada.id
      );
    } catch (promError) {
      console.error("Error al actualizar promedio:", promError);
      // Continuamos aunque falle la actualización del promedio
      return res.status(200).json({ 
        message: "Reseña eliminada correctamente, pero ocurrió un error al actualizar calificación promedio",
        warning: "No se pudo actualizar la calificación promedio de la entidad"
      });
    }
    
    res.status(200).json({ message: "Reseña eliminada correctamente" });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reseña inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('no permitido') || error.message.includes('not allowed')) {
      return res.status(403).json({ 
        message: "Operación no permitida", 
        details: "No se permite eliminar esta reseña"
      });
    }
    
    res.status(500).json({ 
      message: "Error al eliminar la reseña", 
      details: error.message 
    });
  }
};

const cambiarEstadoResenaController = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!['pendiente', 'aprobada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ 
      message: "Estado no válido", 
      details: "El estado debe ser 'pendiente', 'aprobada' o 'rechazada'"
    });
  }
  
  try {
    const resena = await cambiarEstadoResena(id, estado);
    if (!resena) {
      return res.status(404).json({ message: `No se ha encontrado la reseña con id: ${id}` });
    }
    
    // Si el estado cambió a aprobada o rechazada, actualizar el promedio
    if (estado === 'aprobada' || estado === 'rechazada') {
      try {
        await actualizarPromedioEntidad(
          resena.entidadResenada.tipo, 
          resena.entidadResenada.id
        );
      } catch (promError) {
        console.error("Error al actualizar promedio:", promError);
        // Continuamos aunque falle la actualización del promedio
        return res.status(200).json({ 
          message: "Estado actualizado correctamente, pero ocurrió un error al actualizar calificación promedio", 
          resena,
          warning: "No se pudo actualizar la calificación promedio de la entidad"
        });
      }
    }
    
    res.status(200).json({ message: "Estado actualizado correctamente", resena });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reseña inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('no permitido') || error.message.includes('not allowed')) {
      return res.status(403).json({ 
        message: "Operación no permitida", 
        details: "No se permite cambiar el estado de esta reseña"
      });
    }
    
    res.status(500).json({ 
      message: "Error al cambiar el estado de la reseña", 
      details: error.message 
    });
  }
};

const responderResenaController = async (req, res) => {
  const { error, value } = responderResenaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  const { resenaId, usuarioId, texto } = value;
  
  try {
    const resena = await responderResena(resenaId, usuarioId, texto);
    if (!resena) {
      return res.status(404).json({ message: `No se ha encontrado la reseña con id: ${resenaId}` });
    }
    res.status(200).json({ message: "Respuesta agregada correctamente", resena });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID inválido", 
        details: "El formato de ID de reseña o usuario no es válido"
      });
    }
    
    if (error.message && error.message.includes('ya respondida') || error.message.includes('already responded')) {
      return res.status(400).json({ 
        message: "Reseña ya respondida", 
        details: "Esta reseña ya ha sido respondida"
      });
    }
    
    if (error.message && error.message.includes('no autorizado') || error.message.includes('not authorized')) {
      return res.status(403).json({ 
        message: "No autorizado", 
        details: "No tiene permisos para responder a esta reseña"
      });
    }
    
    res.status(500).json({ 
      message: "Error al responder la reseña", 
      details: error.message 
    });
  }
};

const moderarResenaController = async (req, res) => {
  const { error, value } = moderarResenaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  const { resenaId, estado, motivo } = value;
  
  if (!['aprobada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ 
      message: "Estado no válido", 
      details: "El estado debe ser 'aprobada' o 'rechazada'"
    });
  }
  
  try {
    const resena = await moderarResena(resenaId, estado);
    if (!resena) {
      return res.status(404).json({ message: `No se ha encontrado la reseña con id: ${resenaId}` });
    }
    
    // Actualizar el promedio de la entidad
    try {
      await actualizarPromedioEntidad(
        resena.entidadResenada.tipo, 
        resena.entidadResenada.id
      );
    } catch (promError) {
      console.error("Error al actualizar promedio:", promError);
      // Continuamos aunque falle la actualización del promedio
      return res.status(200).json({ 
        message: `Reseña ${estado === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente, pero ocurrió un error al actualizar calificación promedio`, 
        resena,
        warning: "No se pudo actualizar la calificación promedio de la entidad"
      });
    }
    
    res.status(200).json({ message: `Reseña ${estado === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente`, resena });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de reseña inválido", 
        details: `El formato del ID '${resenaId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('no pendiente') || error.message.includes('not pending')) {
      return res.status(400).json({ 
        message: "Reseña ya moderada", 
        details: "Esta reseña ya ha sido moderada"
      });
    }
    
    if (error.message && error.message.includes('no autorizado') || error.message.includes('not authorized')) {
      return res.status(403).json({ 
        message: "No autorizado", 
        details: "No tiene permisos para moderar reseñas"
      });
    }
    
    res.status(500).json({ 
      message: "Error al moderar la reseña", 
      details: error.message 
    });
  }
};

const getPromedioCalificacionEntidadController = async (req, res) => {
  const { tipoEntidad, entidadId } = req.params;
  
  if (!['oficina', 'sala_reunion', 'escritorio_flexible', 'servicio', 'espacio'].includes(tipoEntidad)) {
    return res.status(400).json({ 
      message: "Tipo de entidad inválido",
      details: "El tipo de entidad debe ser uno de los siguientes: oficina, sala_reunion, escritorio_flexible, servicio, espacio"
    });
  }
  
  try {
    const promedio = await getPromedioCalificacionEntidad(tipoEntidad, entidadId);
    res.status(200).json(promedio);
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
        details: `No se ha encontrado la entidad del tipo ${tipoEntidad} con ID: ${entidadId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener la calificación promedio", 
      details: error.message 
    });
  }
};

// Función auxiliar para actualizar el promedio de la entidad
const actualizarPromedioEntidad = async (tipoEntidad, entidadId) => {
  try {
    const promedio = await getPromedioCalificacionEntidad(tipoEntidad, entidadId);
    
    // Actualizar la calificación de la entidad según su tipo
    // Esta función dependería de qué tipo de entidad se está calificando
    switch(tipoEntidad) {
      case 'oficina':
        // Importar y usar el repositorio correspondiente
        try {
          const oficinaRepository = require('../repositories/oficina.repository');
          await oficinaRepository.actualizarCalificacion(entidadId, promedio.promedioCalificacion);
        } catch (error) {
          throw new Error(`Error al actualizar calificación de oficina: ${error.message}`);
        }
        break;
      case 'espacio':
        try {
          const espacioRepository = require('../repositories/espacio.repository');
          await espacioRepository.actualizarCalificacion(entidadId, promedio.promedioCalificacion);
        } catch (error) {
          throw new Error(`Error al actualizar calificación de espacio: ${error.message}`);
        }
        break;
      case 'servicio':
        try {
          const servicioRepository = require('../repositories/servicioAdicional.repository');
          await servicioRepository.actualizarCalificacion(entidadId, promedio.promedioCalificacion);
        } catch (error) {
          throw new Error(`Error al actualizar calificación de servicio: ${error.message}`);
        }
        break;
      case 'sala_reunion':
        try {
          const salaRepository = require('../repositories/salaReunion.repository');
          await salaRepository.actualizarCalificacion(entidadId, promedio.promedioCalificacion);
        } catch (error) {
          throw new Error(`Error al actualizar calificación de sala de reunión: ${error.message}`);
        }
        break;
      case 'escritorio_flexible':
        try {
          const escritorioRepository = require('../repositories/escritorioFlexible.repository');
          await escritorioRepository.actualizarCalificacion(entidadId, promedio.promedioCalificacion);
        } catch (error) {
          throw new Error(`Error al actualizar calificación de escritorio flexible: ${error.message}`);
        }
        break;
      default:
        throw new Error(`Tipo de entidad no soportado: ${tipoEntidad}`);
    }
    
    return promedio;
  } catch (error) {
    console.error('Error al actualizar promedio:', error);
    throw error;
  }
};

module.exports = {
  getResenasController,
  getResenaByIdController,
  getResenasByUsuarioController,
  getResenasByEntidadController,
  getResenasByReservaController,
  getResenasPorCalificacionController,
  getResenasPendientesModeracionController,
  createResenaController,
  updateResenaController,
  deleteResenaController,
  cambiarEstadoResenaController,
  responderResenaController,
  moderarResenaController,
  getPromedioCalificacionEntidadController
};