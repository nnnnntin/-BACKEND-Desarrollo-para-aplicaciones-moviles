const {
  getPromociones,
  findPromocionById,
  findPromocionByCodigo,
  getPromocionesActivas,
  getPromocionesPorTipo,
  getPromocionesPorEntidad,
  getPromocionesPorRangoDeFechas,
  createPromocion,
  updatePromocion,
  deletePromocion,
  activarPromocion,
  incrementarUsos,
  validarPromocion,
  getPromocionesProximasAExpirar,
  actualizarAplicabilidad
} = require("../repositories/promocion.repository");
const {
  createPromocionSchema,
  updatePromocionSchema,
  validarCodigoPromocionSchema,
  filtrarPromocionesSchema
} = require("../routes/validations/promocion.validation");

const { findOficinaById } = require("../repositories/oficina.repository");
const { findSalaReunionById } = require("../repositories/salaReunion.repository");
const { findEscritorioFlexibleById } = require("../repositories/escritorioFlexible.repository");
const { findMembresiaById } = require("../repositories/membresia.repository");
const { findServicioAdicionalById } = require("../repositories/servicioAdicional.repository");
const { findUsuarioById } = require("../repositories/usuario.repository"); 
const ENTIDAD_REPOSITORY_MAP = {
  'oficina': findOficinaById,
  'sala_reunion': findSalaReunionById,
  'escritorio_flexible': findEscritorioFlexibleById,
  'membresia': findMembresiaById,
  'servicio': findServicioAdicionalById
};

const ENTIDADES_VALIDAS = ['oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio'];
const TIPOS_PROMOCION_VALIDOS = ['porcentaje', 'monto_fijo', 'gratuito'];

/**
 * Valida que las entidades especificadas en aplicableA existan
 * @param {string} entidad - Tipo de entidad
 * @param {Array} ids - Array de IDs a validar
 * @returns {Promise<Object>} - { valid: boolean, invalidIds: Array, message: string }
 */
const validarEntidadesExisten = async (entidad, ids) => {
  const findEntidadById = ENTIDAD_REPOSITORY_MAP[entidad];
  
  if (!findEntidadById) {
    return {
      valid: false,
      invalidIds: [],
      message: `Entidad no válida: ${entidad}. Debe ser una de: ${ENTIDADES_VALIDAS.join(', ')}`
    };
  }

  const invalidIds = [];
  
  for (const id of ids) {
    try {
      const entidadObtenida = await findEntidadById(id);
      if (!entidadObtenida) {
        invalidIds.push(id);
      }
    } catch (error) {
            if (error.name === 'CastError') {
        invalidIds.push(id);
      } else {
        throw error;       }
    }
  }

  return {
    valid: invalidIds.length === 0,
    invalidIds,
    message: invalidIds.length > 0 
      ? `No se encontraron las siguientes ${entidad}s con los IDs: ${invalidIds.join(', ')}`
      : 'Todas las entidades son válidas'
  };
};

/**
 * Valida una entidad específica por su tipo e ID
 * @param {string} entidadTipo - Tipo de entidad
 * @param {string} entidadId - ID de la entidad
 * @returns {Promise<Object>} - { valid: boolean, entity: Object|null, message: string }
 */
const validarEntidadEspecifica = async (entidadTipo, entidadId) => {
  const findEntidadById = ENTIDAD_REPOSITORY_MAP[entidadTipo];
  
  if (!findEntidadById) {
    return {
      valid: false,
      entity: null,
      message: `Tipo de entidad no válido: ${entidadTipo}. Debe ser una de: ${ENTIDADES_VALIDAS.join(', ')}`
    };
  }

  try {
    const entidad = await findEntidadById(entidadId);
    
    if (!entidad) {
      return {
        valid: false,
        entity: null,
        message: `No se encontró la ${entidadTipo} con ID: ${entidadId}`
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
        message: `Formato de ID inválido para ${entidadTipo}: ${entidadId}`
      };
    }
    throw error;
  }
};

const getPromocionesController = async (req, res) => {
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
    const promociones = await getPromociones(filtros, skipNum, limitNum);
    return res.status(200).json(promociones);
  } catch (error) {
    console.error("[Controller] Error al obtener promociones", error);
    return res.status(500).json({
      message: "Error al obtener las promociones",
      details: error.message
    });
  }
};

const getPromocionByIdController = async (req, res) => {
  const { id } = req.params;
  
  try {
    const promocion = await findPromocionById(id);
    if (!promocion) {
      return res.status(404).json({ 
        message: `No se ha encontrado la promoción con id: ${id}` 
      });
    }
    res.status(200).json(promocion);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de promoción inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar la promoción",
      details: error.message
    });
  }
};

const getPromocionByCodigoController = async (req, res) => {
  const { codigo } = req.params;
  
  try {
    const promocion = await findPromocionByCodigo(codigo);
    if (!promocion) {
      return res.status(404).json({ 
        message: `No se ha encontrado la promoción con código: ${codigo}` 
      });
    }
    res.status(200).json(promocion);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al buscar la promoción por código",
      details: error.message
    });
  }
};

const getPromocionesActivasController = async (req, res) => {
  try {
    const promociones = await getPromocionesActivas();
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener las promociones activas",
      details: error.message
    });
  }
};

const getPromocionesPorTipoController = async (req, res) => {
  const { tipo } = req.params;

  if (!TIPOS_PROMOCION_VALIDOS.includes(tipo)) {
    return res.status(400).json({
      message: "Tipo de promoción no válido",
      details: `El tipo debe ser una de: ${TIPOS_PROMOCION_VALIDOS.join(', ')}`
    });
  }

  try {
    const promociones = await getPromocionesPorTipo(tipo);
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener promociones por tipo",
      details: error.message
    });
  }
};

const getPromocionesPorEntidadController = async (req, res) => {
  const { entidad, entidadId } = req.query;

  if (!entidad || !ENTIDADES_VALIDAS.includes(entidad)) {
    return res.status(400).json({
      message: "Tipo de entidad no válido",
      details: `La entidad debe ser una de: ${ENTIDADES_VALIDAS.join(', ')}`
    });
  }

  try {
        if (entidadId) {
      const validacion = await validarEntidadEspecifica(entidad, entidadId);
      if (!validacion.valid) {
        return res.status(400).json({
          message: "Entidad no válida",
          details: validacion.message
        });
      }
    }

    const promociones = await getPromocionesPorEntidad(entidad, entidadId);
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener promociones por entidad",
      details: error.message
    });
  }
};

const getPromocionesPorRangoDeFechasController = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requieren fechas de inicio y fin"
    });
  }

  try {
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
      return res.status(400).json({
        message: "Formato de fechas inválido",
        details: "Las fechas deben estar en formato válido (ISO 8601)"
      });
    }

    if (fechaInicioDate > fechaFinDate) {
      return res.status(400).json({
        message: "Rango de fechas inválido",
        details: "La fecha de inicio debe ser anterior a la fecha de fin"
      });
    }

    const promociones = await getPromocionesPorRangoDeFechas(fechaInicioDate, fechaFinDate);
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener promociones por rango de fechas",
      details: error.message
    });
  }
};

const createPromocionController = async (req, res) => {
  const { error, value } = createPromocionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los datos de la promoción",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

    const fechaInicio = new Date(value.fechaInicio);
  const fechaFin = new Date(value.fechaFin);
  const fechaActual = new Date();

  if (fechaInicio >= fechaFin) {
    return res.status(400).json({
      message: "Error en las fechas de la promoción",
      details: "La fecha de inicio debe ser anterior a la fecha de fin"
    });
  }

  if (fechaFin <= fechaActual) {
    return res.status(400).json({
      message: "Error en las fechas de la promoción",
      details: "La fecha de fin debe ser posterior a la fecha actual"
    });
  }

    const { entidad, ids } = value.aplicableA;
  
  try {
    const validacion = await validarEntidadesExisten(entidad, ids);
    
    if (!validacion.valid) {
      return res.status(400).json({
        message: "Entidades no válidas en aplicableA",
        details: validacion.message,
        invalidIds: validacion.invalidIds
      });
    }

    const promocion = await createPromocion(value);
    res.status(201).json({ 
      message: "Promoción creada correctamente", 
      promocion 
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Código de promoción duplicado",
        details: "El código de promoción ya está en uso",
        field: "codigo"
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
      message: "Error al crear la promoción",
      details: error.message
    });
  }
};

const updatePromocionController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updatePromocionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los datos de actualización",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        const promocionExistente = await findPromocionById(id);
    if (!promocionExistente) {
      return res.status(404).json({ 
        message: `No se ha encontrado la promoción con id: ${id}` 
      });
    }

        if (value.fechaInicio || value.fechaFin) {
      const fechaInicio = new Date(value.fechaInicio || promocionExistente.fechaInicio);
      const fechaFin = new Date(value.fechaFin || promocionExistente.fechaFin);

      if (fechaInicio >= fechaFin) {
        return res.status(400).json({
          message: "Error en las fechas de la promoción",
          details: "La fecha de inicio debe ser anterior a la fecha de fin"
        });
      }
    }

        if (value.aplicableA) {
      const { entidad, ids } = value.aplicableA;
      
      const validacion = await validarEntidadesExisten(entidad, ids);
      
      if (!validacion.valid) {
        return res.status(400).json({
          message: "Entidades no válidas en aplicableA",
          details: validacion.message,
          invalidIds: validacion.invalidIds
        });
      }
    }

    const promocion = await updatePromocion(id, value);
    res.status(200).json(promocion);
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Código de promoción duplicado",
        details: "El código de promoción ya está en uso",
        field: "codigo"
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Error de tipo de datos",
        details: `El valor '${error.value}' no es válido para el campo '${error.path}'`,
        field: error.path
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
      message: "Error al actualizar la promoción",
      details: error.message
    });
  }
};

const deletePromocionController = async (req, res) => {
  const { id } = req.params;
  
  try {
    const promocion = await deletePromocion(id);
    if (!promocion) {
      return res.status(404).json({ 
        message: `No se ha encontrado la promoción con id: ${id}` 
      });
    }
    res.status(200).json({ message: "Promoción desactivada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de promoción inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al desactivar la promoción",
      details: error.message
    });
  }
};

const activarPromocionController = async (req, res) => {
  const { id } = req.params;
  
  try {
    const promocion = await activarPromocion(id);
    if (!promocion) {
      return res.status(404).json({ 
        message: `No se ha encontrado la promoción con id: ${id}` 
      });
    }
    res.status(200).json({ 
      message: "Promoción activada correctamente", 
      promocion 
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de promoción inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al activar la promoción",
      details: error.message
    });
  }
};

const incrementarUsosController = async (req, res) => {
  const { id } = req.params;
  
  try {
    const promocion = await incrementarUsos(id);
    if (!promocion) {
      return res.status(404).json({ 
        message: `No se ha encontrado la promoción con id: ${id}` 
      });
    }
    res.status(200).json({ 
      message: "Usos incrementados correctamente", 
      promocion 
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de promoción inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('límite')) {
      return res.status(400).json({
        message: "Límite de usos alcanzado",
        details: "La promoción ha alcanzado su límite máximo de usos"
      });
    }

    res.status(500).json({
      message: "Error al incrementar usos de la promoción",
      details: error.message
    });
  }
};

const validarPromocionController = async (req, res) => {
  const { error, value } = validarCodigoPromocionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { codigo, usuarioId, entidadTipo, entidadId } = value;

  try {
        const promocion = await findPromocionByCodigo(codigo);
    
    if (!promocion) {
      return res.status(404).json({
        message: "Código de promoción no encontrado",
        details: `No existe una promoción con el código: ${codigo}`
      });
    }

    if (!promocion.activo) {
      return res.status(400).json({
        message: "Promoción inactiva",
        details: "La promoción no está activa"
      });
    }

        const fechaActual = new Date();
    if (fechaActual < new Date(promocion.fechaInicio) || fechaActual > new Date(promocion.fechaFin)) {
      return res.status(400).json({
        message: "Promoción expirada o no vigente",
        details: "La promoción no está dentro del rango de fechas válido"
      });
    }

        const usuario = await findUsuarioById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No existe un usuario con ID: ${usuarioId}`
      });
    }

        const validacionEntidad = await validarEntidadEspecifica(entidadTipo, entidadId);
    if (!validacionEntidad.valid) {
      return res.status(400).json({
        message: "Entidad no válida",
        details: validacionEntidad.message
      });
    }

        const aplicableAEntidad = promocion.aplicableA.entidad === entidadTipo;
    const aplicableAId = promocion.aplicableA.ids.some(id => id.toString() === entidadId);

    if (!aplicableAEntidad || !aplicableAId) {
      return res.status(400).json({
        message: "Promoción no aplicable",
        details: `La promoción no es aplicable a la ${entidadTipo} especificada`
      });
    }

        const resultado = await validarPromocion(codigo, usuarioId, entidadTipo, entidadId);

    if (!resultado.valido) {
      return res.status(400).json({
        message: "Código de promoción inválido",
        details: resultado.mensaje
      });
    }

    res.status(200).json({
      message: "Código de promoción válido",
      promocion: resultado.promocion,
      entidadValidada: validacionEntidad.entity,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al validar la promoción",
      details: error.message
    });
  }
};

const getPromocionesProximasAExpirarController = async (req, res) => {
  const { diasRestantes } = req.query;

  try {
    const dias = diasRestantes ? parseInt(diasRestantes) : 7;
    
    if (isNaN(dias) || dias < 0) {
      return res.status(400).json({
        message: "Formato inválido para días restantes",
        details: "El valor para días restantes debe ser un número entero positivo"
      });
    }

    const promociones = await getPromocionesProximasAExpirar(dias);
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener promociones próximas a expirar",
      details: error.message
    });
  }
};

const actualizarAplicabilidadController = async (req, res) => {
  const { id } = req.params;
  const { aplicableA } = req.body;
  const { entidad, ids } = aplicableA || {};

  if (!entidad || !ENTIDADES_VALIDAS.includes(entidad)) {
    return res.status(400).json({
      message: "Tipo de entidad no válido",
      details: `La entidad debe ser una de: ${ENTIDADES_VALIDAS.join(', ')}`
    });
  }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      message: "IDs requeridos",
      details: "Se requiere un array de IDs válidos"
    });
  }

  try {
        const promocionExistente = await findPromocionById(id);
    if (!promocionExistente) {
      return res.status(404).json({ 
        message: `No se ha encontrado la promoción con id: ${id}` 
      });
    }

        const validacion = await validarEntidadesExisten(entidad, ids);
    
    if (!validacion.valid) {
      return res.status(400).json({
        message: "Entidades no válidas",
        details: validacion.message,
        invalidIds: validacion.invalidIds
      });
    }

    const promocion = await actualizarAplicabilidad(id, entidad, ids);
    res.status(200).json({ 
      message: "Aplicabilidad actualizada correctamente", 
      promocion 
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Error en formato de ID",
        details: "El formato de uno o más IDs no es válido"
      });
    }

    res.status(500).json({
      message: "Error al actualizar aplicabilidad",
      details: error.message
    });
  }
};

const filtrarPromocionesController = async (req, res) => {
  const { error, value } = filtrarPromocionesSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: "Error en parámetros de filtrado",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const filtros = {};

    if (value.activo !== undefined) filtros.activo = value.activo;
    if (value.tipo) filtros.tipo = value.tipo;
    if (value.entidadTipo) filtros['aplicableA.entidad'] = value.entidadTipo;
    if (value.entidadId) filtros['aplicableA.ids'] = value.entidadId;
    if (value.vigente === true) {
      const fechaActual = new Date();
      filtros.fechaInicio = { $lte: fechaActual };
      filtros.fechaFin = { $gte: fechaActual };
    }
    if (value.fechaDesde) {
      const fechaDesde = new Date(value.fechaDesde);
      if (isNaN(fechaDesde.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha 'fechaDesde' no es válida"
        });
      }
      filtros.fechaInicio = { $gte: fechaDesde };
    }
    if (value.fechaHasta) {
      const fechaHasta = new Date(value.fechaHasta);
      if (isNaN(fechaHasta.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha 'fechaHasta' no es válida"
        });
      }
      filtros.fechaFin = { $lte: fechaHasta };
    }

    const promociones = await getPromociones(filtros);
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Error en formato de ID",
        details: `El valor '${error.value}' no es válido para el campo '${error.path}'`
      });
    }

    res.status(500).json({
      message: "Error al filtrar promociones",
      details: error.message
    });
  }
};

module.exports = {
  getPromocionesController,
  getPromocionByIdController,
  getPromocionByCodigoController,
  getPromocionesActivasController,
  getPromocionesPorTipoController,
  getPromocionesPorEntidadController,
  getPromocionesPorRangoDeFechasController,
  createPromocionController,
  updatePromocionController,
  deletePromocionController,
  activarPromocionController,
  incrementarUsosController,
  validarPromocionController,
  getPromocionesProximasAExpirarController,
  actualizarAplicabilidadController,
  filtrarPromocionesController
};