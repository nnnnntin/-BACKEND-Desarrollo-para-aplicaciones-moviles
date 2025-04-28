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

const getPromocionesController = async (req, res) => {
  try {
    const promociones = await getPromociones();
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
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
      return res.status(404).json({ message: `No se ha encontrado la promoción con id: ${id}` });
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
      return res.status(404).json({ message: `No se ha encontrado la promoción con código: ${codigo}` });
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
  
  if (!['porcentaje', 'monto_fijo', 'gratuito'].includes(tipo)) {
    return res.status(400).json({ 
      message: "Tipo de promoción no válido", 
      details: "El tipo debe ser 'porcentaje', 'monto_fijo' o 'gratuito'"
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
  
  if (!entidad || !['oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio'].includes(entidad)) {
    return res.status(400).json({ 
      message: "Tipo de entidad no válido", 
      details: "La entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible', 'membresia' o 'servicio'"
    });
  }
  
  try {
    const promociones = await getPromocionesPorEntidad(entidad, entidadId);
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de entidad inválido", 
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }
    
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
    const promociones = await getPromocionesPorRangoDeFechas(new Date(fechaInicio), new Date(fechaFin));
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    
    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({ 
        message: "Error en formato de fechas", 
        details: "Las fechas proporcionadas no son válidas"
      });
    }
    
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
  
  try {
    const promocion = await createPromocion(value);
    res.status(201).json({ message: "Promoción creada correctamente", promocion });
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
    
    if (error.message && error.message.includes('fechas')) {
      return res.status(400).json({ 
        message: "Error en las fechas de la promoción", 
        details: error.message
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
    const promocion = await updatePromocion(id, value);
    if (!promocion) {
      return res.status(404).json({ message: `No se ha encontrado la promoción con id: ${id}` });
    }
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
    
    if (error.message && error.message.includes('fechas')) {
      return res.status(400).json({ 
        message: "Error en las fechas de la promoción", 
        details: error.message
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
      return res.status(404).json({ message: `No se ha encontrado la promoción con id: ${id}` });
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
    
    if (error.message && (error.message.includes('en uso') || error.message.includes('in use'))) {
      return res.status(400).json({ 
        message: "No se puede eliminar la promoción", 
        details: "La promoción está siendo utilizada actualmente"
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
      return res.status(404).json({ message: `No se ha encontrado la promoción con id: ${id}` });
    }
    res.status(200).json({ message: "Promoción activada correctamente", promocion });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de promoción inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('expirada')) {
      return res.status(400).json({ 
        message: "No se puede activar la promoción", 
        details: "La promoción ya ha expirado"
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
      return res.status(404).json({ message: `No se ha encontrado la promoción con id: ${id}` });
    }
    res.status(200).json({ message: "Usos incrementados correctamente", promocion });
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
    
    if (error.message && error.message.includes('activa')) {
      return res.status(400).json({ 
        message: "Promoción inactiva", 
        details: "No se pueden incrementar usos en una promoción inactiva"
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
  
  const { codigo, usuarioId, entidadTipo, entidadId, fecha } = value;
  
  try {
    const resultado = await validarPromocion(codigo, usuarioId, entidadTipo, entidadId);
    
    if (!resultado.valido) {
      return res.status(400).json({ 
        message: "Código de promoción inválido", 
        details: resultado.mensaje
      });
    }
    
    res.status(200).json({ 
      message: "Código de promoción válido", 
      promocion: resultado.promocion 
    });
  } catch (error) {
    console.error(error);
    
    if (error.message && error.message.includes('no encontrado') || error.message.includes('not found')) {
      return res.status(404).json({ 
        message: "Código no encontrado", 
        details: `No existe una promoción con el código: ${codigo}`
      });
    }
    
    if (error.message && error.message.includes('expirado')) {
      return res.status(400).json({ 
        message: "Promoción expirada", 
        details: "La fecha de validez de la promoción ha expirado"
      });
    }
    
    if (error.message && error.message.includes('usado')) {
      return res.status(400).json({ 
        message: "Promoción ya utilizada", 
        details: "Este usuario ya ha utilizado esta promoción anteriormente"
      });
    }
    
    res.status(500).json({ 
      message: "Error al validar la promoción", 
      details: error.message 
    });
  }
};

const getPromocionesProximasAExpirarController = async (req, res) => {
  const { diasRestantes } = req.query;
  
  try {
    const promociones = await getPromocionesProximasAExpirar(
      diasRestantes ? parseInt(diasRestantes) : 7
    );
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    
    if (error.message && error.message.includes('formato') || error.message.includes('número')) {
      return res.status(400).json({ 
        message: "Formato inválido para días restantes", 
        details: "El valor para días restantes debe ser un número entero positivo"
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener promociones próximas a expirar", 
      details: error.message 
    });
  }
};

const actualizarAplicabilidadController = async (req, res) => {
  const { id } = req.params;
  const { entidad, ids } = req.body;
  
  if (!entidad || !['oficina', 'sala_reunion', 'escritorio_flexible', 'membresia', 'servicio'].includes(entidad)) {
    return res.status(400).json({ 
      message: "Tipo de entidad no válido", 
      details: "La entidad debe ser 'oficina', 'sala_reunion', 'escritorio_flexible', 'membresia' o 'servicio'"
    });
  }
  
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ 
      message: "Formato inválido de IDs", 
      details: "Se requiere un array de IDs"
    });
  }
  
  try {
    const promocion = await actualizarAplicabilidad(id, entidad, ids);
    if (!promocion) {
      return res.status(404).json({ message: `No se ha encontrado la promoción con id: ${id}` });
    }
    res.status(200).json({ message: "Aplicabilidad actualizada correctamente", promocion });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "Error en formato de ID", 
        details: "El formato de uno o más IDs no es válido"
      });
    }
    
    if (error.message && error.message.includes('no existe') || error.message.includes('not found')) {
      return res.status(404).json({ 
        message: "Entidades no encontradas", 
        details: "Uno o más IDs de entidades no existen en el sistema"
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
    // Convertir a filtros de MongoDB
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
    if (value.fechaDesde) filtros.fechaInicio = { $gte: new Date(value.fechaDesde) };
    if (value.fechaHasta) filtros.fechaFin = { $lte: new Date(value.fechaHasta) };
    
    const promociones = await getPromociones(filtros);
    res.status(200).json(promociones);
  } catch (error) {
    console.error(error);
    
    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({ 
        message: "Error en formato de fechas", 
        details: "Las fechas proporcionadas no son válidas"
      });
    }
    
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