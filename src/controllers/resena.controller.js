const {
  getResenas,
  findResenaById,
  getResenasByUsuario,
  getResenasByEntidad,
  getResenasByReserva,
  getResenasPorCalificacion,
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

const { findUsuarioById } = require("../repositories/usuario.repository");
const { findOficinaById } = require("../repositories/oficina.repository");
const { findSalaReunionById } = require("../repositories/salaReunion.repository");
const { findEscritorioFlexibleById } = require("../repositories/escritorioFlexible.repository");
const { findServicioAdicionalById } = require("../repositories/servicioAdicional.repository");
const { findReservaById } = require("../repositories/reserva.repository");

const ENTIDAD_MAP = {
  'oficina': findOficinaById,
  'espacio': async (id) => {
        const salaReunion = await findSalaReunionById(id);
    if (salaReunion) return salaReunion;
    
    const escritorioFlexible = await findEscritorioFlexibleById(id);
    if (escritorioFlexible) return escritorioFlexible;
    
    return null;
  },
  'servicio': findServicioAdicionalById
};

const TIPOS_ENTIDAD_VALIDOS = ['oficina', 'espacio', 'servicio'];
const ESTADOS_RESENA_VALIDOS = ['pendiente', 'aprobada', 'rechazada'];

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
 * Valida que una entidad reseñable existe
 * @param {string} tipo - Tipo de entidad
 * @param {string} id - ID de la entidad
 * @returns {Promise<Object>} - { valid: boolean, entity: Object|null, message: string }
 */
const validarEntidadResenableExiste = async (tipo, id) => {
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
 * Valida que una reserva existe
 * @param {string} reservaId - ID de la reserva a validar
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

/**
 * Valida que una reseña existe
 * @param {string} resenaId - ID de la reseña a validar
 * @returns {Promise<Object>} - { valid: boolean, resena: Object|null, message: string }
 */
const validarResenaExiste = async (resenaId) => {
  try {
    const resena = await findResenaById(resenaId);
    
    if (!resena) {
      return {
        valid: false,
        resena: null,
        message: `No se encontró la reseña con ID: ${resenaId}`
      };
    }

    return {
      valid: true,
      resena: resena,
      message: 'Reseña válida'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        resena: null,
        message: `Formato de ID de reseña inválido: ${resenaId}`
      };
    }
    throw error;
  }
};

const getResenasController = async (req, res) => {
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
    const resenas = await getResenas(filtros, skipNum, limitNum);
    return res.status(200).json(resenas);
  } catch (error) {
    return res.status(500).json({
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
        const validacionUsuario = await validarUsuarioExiste(usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

    const resenas = await getResenasByUsuario(usuarioId);
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener reseñas del usuario",
      details: error.message
    });
  }
};

const getResenasByEntidadController = async (req, res) => {
  const { tipoEntidad, entidadId } = req.params;
  try {
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
        const validacionReserva = await validarReservaExiste(reservaId);
    if (!validacionReserva.valid) {
      return res.status(404).json({
        message: "Reserva no encontrada",
        details: validacionReserva.message
      });
    }

    const resenas = await getResenasByReserva(reservaId);
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
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
        const validacionUsuario = await validarUsuarioExiste(value.usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

        const { tipo, id } = value.entidadResenada;
    const validacionEntidad = await validarEntidadResenableExiste(tipo, id);
    if (!validacionEntidad.valid) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: validacionEntidad.message
      });
    }

        if (value.reservaId) {
      const validacionReserva = await validarReservaExiste(value.reservaId);
      if (!validacionReserva.valid) {
        return res.status(404).json({
          message: "Reserva no encontrada",
          details: validacionReserva.message
        });
      }

            if (validacionReserva.reserva.usuarioId.toString() !== value.usuarioId) {
        return res.status(400).json({
          message: "Reserva no válida",
          details: "La reserva no pertenece al usuario que está creando la reseña"
        });
      }

            if (validacionReserva.reserva.entidadReservada.tipo !== tipo ||
          validacionReserva.reserva.entidadReservada.id.toString() !== id) {
        return res.status(400).json({
          message: "Reserva no corresponde",
          details: "La reserva no corresponde con la entidad que se está reseñando"
        });
      }

            if (validacionReserva.reserva.estado !== 'completada') {
        return res.status(400).json({
          message: "Reserva no completada",
          details: "Solo se pueden reseñar reservas completadas"
        });
      }
    }

    const resena = await createResena(value);

    try {
      await actualizarPromedioEntidad(value.entidadResenada.tipo, value.entidadResenada.id);

      res.status(201).json({ 
        message: "Reseña creada correctamente", 
        resena,
        usuarioValidado: {
          id: validacionUsuario.user._id,
          nombre: validacionUsuario.user.nombre,
          email: validacionUsuario.user.email
        },
        entidadValidada: {
          tipo: tipo,
          id: validacionEntidad.entity._id,
          nombre: validacionEntidad.entity.nombre || validacionEntidad.entity.codigo || 'Entidad'
        }
      });
    } catch (promError) {
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

    if (error.message && (error.message.includes('ya ha reseñado') || error.message.includes('already reviewed'))) {
      return res.status(400).json({
        message: "Reseña duplicada",
        details: "El usuario ya ha creado una reseña para esta entidad"
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
        const resenaExistente = await findResenaById(id);
    if (!resenaExistente) {
      return res.status(404).json({ 
        message: `No se ha encontrado la reseña con id: ${id}` 
      });
    }

        if (value.usuarioId && value.usuarioId !== resenaExistente.usuarioId.toString()) {
      const validacionUsuario = await validarUsuarioExiste(value.usuarioId);
      if (!validacionUsuario.valid) {
        return res.status(404).json({
          message: "Usuario no encontrado",
          details: validacionUsuario.message
        });
      }
    }

        if (value.entidadResenada) {
      const { tipo, id: entidadId } = value.entidadResenada;
      const validacionEntidad = await validarEntidadResenableExiste(tipo, entidadId);
      if (!validacionEntidad.valid) {
        return res.status(404).json({
          message: "Entidad no encontrada",
          details: validacionEntidad.message
        });
      }
    }

        if (value.reservaId && value.reservaId !== resenaExistente.reservaId?.toString()) {
      const validacionReserva = await validarReservaExiste(value.reservaId);
      if (!validacionReserva.valid) {
        return res.status(404).json({
          message: "Reserva no encontrada",
          details: validacionReserva.message
        });
      }

            const usuarioId = value.usuarioId || resenaExistente.usuarioId.toString();
      if (validacionReserva.reserva.usuarioId.toString() !== usuarioId) {
        return res.status(400).json({
          message: "Reserva no válida",
          details: "La reserva no pertenece al usuario de la reseña"
        });
      }
    }

    const resena = await updateResena(id, value);

    if (value.calificacion) {
      try {
        const resenaCompleta = await findResenaById(id);
        await actualizarPromedioEntidad(
          resenaCompleta.entidadResenada.tipo,
          resenaCompleta.entidadResenada.id
        );
      } catch (promError) {
        return res.status(200).json({
          message: "Reseña actualizada, pero ocurrió un error al actualizar calificación promedio",
          resena,
          warning: "No se pudo actualizar la calificación promedio de la entidad"
        });
      }
    }

    res.status(200).json({
      message: "Reseña actualizada correctamente",
      resena
    });
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

    if (error.message && (error.message.includes('no permitido') || error.message.includes('not allowed'))) {
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
    const resena = await findResenaById(id);
    if (!resena) {
      return res.status(404).json({ message: `No se ha encontrado la reseña con id: ${id}` });
    }

    await deleteResena(id);

    try {
      await actualizarPromedioEntidad(
        resena.entidadResenada.tipo,
        resena.entidadResenada.id
      );
    } catch (promError) {
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

    if (error.message && (error.message.includes('no permitido') || error.message.includes('not allowed'))) {
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

  if (!ESTADOS_RESENA_VALIDOS.includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: `El estado debe ser uno de: ${ESTADOS_RESENA_VALIDOS.join(', ')}`
    });
  }

  try {
        const resenaExistente = await findResenaById(id);
    if (!resenaExistente) {
      return res.status(404).json({ 
        message: `No se ha encontrado la reseña con id: ${id}` 
      });
    }

    const resena = await cambiarEstadoResena(id, estado);

    if (estado === 'aprobada' || estado === 'rechazada') {
      try {
        await actualizarPromedioEntidad(
          resena.entidadResenada.tipo,
          resena.entidadResenada.id
        );
      } catch (promError) {
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

    if (error.message && (error.message.includes('no permitido') || error.message.includes('not allowed'))) {
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
        const validacionResena = await validarResenaExiste(resenaId);
    if (!validacionResena.valid) {
      return res.status(404).json({
        message: "Reseña no encontrada",
        details: validacionResena.message
      });
    }

        const validacionUsuario = await validarUsuarioExiste(usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

        if (validacionResena.resena.respuesta && validacionResena.resena.respuesta.usuarioId) {
      return res.status(400).json({
        message: "Reseña ya respondida",
        details: "Esta reseña ya ha sido respondida"
      });
    }

    const resena = await responderResena(resenaId, usuarioId, texto);
    res.status(200).json({ 
      message: "Respuesta agregada correctamente", 
      resena,
      respondidaPor: {
        id: validacionUsuario.user._id,
        nombre: validacionUsuario.user.nombre,
        email: validacionUsuario.user.email
      }
    });
  } catch (error) {
    console.error(error);

    if (error.message && (error.message.includes('no autorizado') || error.message.includes('not authorized'))) {
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
        const validacionResena = await validarResenaExiste(resenaId);
    if (!validacionResena.valid) {
      return res.status(404).json({
        message: "Reseña no encontrada",
        details: validacionResena.message
      });
    }

        if (validacionResena.resena.estado !== 'pendiente') {
      return res.status(400).json({
        message: "Reseña ya moderada",
        details: "Esta reseña ya ha sido moderada"
      });
    }

    const resena = await moderarResena(resenaId, estado);

    try {
      await actualizarPromedioEntidad(
        resena.entidadResenada.tipo,
        resena.entidadResenada.id
      );
    } catch (promError) {
      return res.status(200).json({
        message: `Reseña ${estado === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente, pero ocurrió un error al actualizar calificación promedio`,
        resena,
        warning: "No se pudo actualizar la calificación promedio de la entidad"
      });
    }

    res.status(200).json({ 
      message: `Reseña ${estado === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente`, 
      resena 
    });
  } catch (error) {
    console.error(error);

    if (error.message && (error.message.includes('no autorizado') || error.message.includes('not authorized'))) {
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

const actualizarPromedioEntidad = async (tipoEntidad, entidadId) => {
  try {
    const promedio = await getPromedioCalificacionEntidad(tipoEntidad, entidadId);

    switch (tipoEntidad) {
      case 'oficina':
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
    console.error(error);
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
  createResenaController,
  updateResenaController,
  deleteResenaController,
  cambiarEstadoResenaController,
  responderResenaController,
  moderarResenaController,
  getPromedioCalificacionEntidadController
};