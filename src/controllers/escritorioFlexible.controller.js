const {
  getEscritoriosFlexibles,
  findEscritorioFlexibleById,
  findEscritorioFlexibleByCodigo,
  getEscritoriosByEdificio,
  getEscritoriosByTipo,
  getEscritoriosByZona,
  getEscritoriosByAmenidades,
  getEscritoriosByPropietario,
  getEscritoriosByRangoPrecio,
  createEscritorioFlexible,
  updateEscritorioFlexible,
  deleteEscritorioFlexible,
  cambiarEstadoEscritorio,
  agregarAmenidad,
  eliminarAmenidad,
  actualizarPrecios,
  getEscritoriosDisponibles
} = require("../repositories/escritorioFlexible.repository");
const { 
  createEscritorioFlexibleSchema, 
  updateEscritorioFlexibleSchema,
  filtrarEscritoriosFlexiblesSchema
} = require("../routes/validations/escritorioFlexible.validation");

const getEscritoriosFlexiblesController = async (req, res) => {
  try {
    const escritorios = await getEscritoriosFlexibles();
    res.status(200).json(escritorios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener los escritorios flexibles", 
      details: error.message 
    });
  }
};

const getEscritorioFlexibleByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const escritorio = await findEscritorioFlexibleById(id);
    if (!escritorio) {
      return res.status(404).json({ 
        message: "Escritorio no encontrado", 
        details: `No se ha encontrado el escritorio flexible con id: ${id}` 
      });
    }
    res.status(200).json(escritorio);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de escritorio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    res.status(500).json({ 
      message: "Error al buscar el escritorio", 
      details: error.message 
    });
  }
};

const getEscritorioFlexibleByCodigoController = async (req, res) => {
  const { codigo } = req.params;
  try {
    const escritorio = await findEscritorioFlexibleByCodigo(codigo);
    if (!escritorio) {
      return res.status(404).json({ 
        message: "Escritorio no encontrado", 
        details: `No se ha encontrado el escritorio flexible con código: ${codigo}` 
      });
    }
    res.status(200).json(escritorio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al buscar el escritorio por código", 
      details: error.message 
    });
  }
};

const getEscritoriosByEdificioController = async (req, res) => {
  const { edificioId } = req.params;
  try {
    const escritorios = await getEscritoriosByEdificio(edificioId);
    res.status(200).json(escritorios);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID '${edificioId}' no es válido`
      });
    }
    
    if (error.message && (error.message.includes('edificio no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({ 
        message: "Edificio no encontrado", 
        details: `No existe un edificio con id: ${edificioId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener escritorios del edificio", 
      details: error.message 
    });
  }
};

const getEscritoriosByTipoController = async (req, res) => {
  const { tipo } = req.params;
  try {
    const escritorios = await getEscritoriosByTipo(tipo);
    res.status(200).json(escritorios);
  } catch (error) {
    console.error(error);
    
    if (error.message && error.message.includes('tipo no válido')) {
      return res.status(400).json({ 
        message: "Tipo no válido", 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener escritorios por tipo", 
      details: error.message 
    });
  }
};

const getEscritoriosByZonaController = async (req, res) => {
  const { edificioId, piso, zona } = req.query;
  
  if (!edificioId) {
    return res.status(400).json({ 
      message: "Parámetro faltante", 
      details: "Se requiere al menos un ID de edificio",
      field: "edificioId"
    });
  }
  
  try {
    const parsedPiso = piso ? parseInt(piso) : undefined;
    
    if (piso && isNaN(parsedPiso)) {
      return res.status(400).json({ 
        message: "Formato inválido", 
        details: "El piso debe ser un número entero",
        field: "piso"
      });
    }
    
    const escritorios = await getEscritoriosByZona(
      edificioId, 
      parsedPiso, 
      zona
    );
    res.status(200).json(escritorios);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID '${edificioId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('edificio no encontrado')) {
      return res.status(404).json({ 
        message: "Edificio no encontrado", 
        details: `No existe un edificio con id: ${edificioId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener escritorios por zona", 
      details: error.message 
    });
  }
};

const getEscritoriosByAmenidadesController = async (req, res) => {
  const { tipoAmenidad } = req.params;
  try {
    const escritorios = await getEscritoriosByAmenidades(tipoAmenidad);
    res.status(200).json(escritorios);
  } catch (error) {
    console.error(error);
    
    if (error.message && error.message.includes('tipo de amenidad no válido')) {
      return res.status(400).json({ 
        message: "Tipo de amenidad no válido", 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener escritorios por amenidades", 
      details: error.message 
    });
  }
};

const getEscritoriosByPropietarioController = async (req, res) => {
  const { propietarioId } = req.params;
  try {
    const escritorios = await getEscritoriosByPropietario(propietarioId);
    res.status(200).json(escritorios);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de propietario inválido", 
        details: `El formato del ID '${propietarioId}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('propietario no encontrado')) {
      return res.status(404).json({ 
        message: "Propietario no encontrado", 
        details: `No existe un propietario con id: ${propietarioId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener escritorios por propietario", 
      details: error.message 
    });
  }
};

const getEscritoriosByRangoPrecioController = async (req, res) => {
  const { precioMin, precioMax, tipoPrecio } = req.query;
  
  if (!precioMin || !precioMax || isNaN(precioMin) || isNaN(precioMax)) {
    return res.status(400).json({ 
      message: "Parámetros inválidos", 
      details: "Se requiere un rango de precios válido (valores numéricos)"
    });
  }
  
  const min = parseFloat(precioMin);
  const max = parseFloat(precioMax);
  
  if (min < 0 || max < 0) {
    return res.status(400).json({ 
      message: "Valores de precio inválidos", 
      details: "Los precios deben ser valores positivos"
    });
  }
  
  if (min > max) {
    return res.status(400).json({ 
      message: "Rango de precios inválido", 
      details: "El precio mínimo debe ser menor o igual al precio máximo"
    });
  }
  
  if (tipoPrecio && !['porDia', 'porSemana', 'porMes'].includes(tipoPrecio)) {
    return res.status(400).json({ 
      message: "Tipo de precio inválido", 
      details: "El tipo de precio debe ser 'porDia', 'porSemana' o 'porMes'"
    });
  }
  
  try {
    const escritorios = await getEscritoriosByRangoPrecio(
      min, 
      max, 
      tipoPrecio || 'porDia'
    );
    res.status(200).json(escritorios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener escritorios por rango de precio", 
      details: error.message 
    });
  }
};

const createEscritorioFlexibleController = async (req, res) => {
  const { error, value } = createEscritorioFlexibleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    const escritorio = await createEscritorioFlexible(value);
    res.status(201).json({ message: "Escritorio flexible creado correctamente", escritorio });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Código duplicado", 
        details: "El código de escritorio ya está en uso",
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
    
    if (error.message && error.message.includes('edificio no encontrado')) {
      return res.status(404).json({ 
        message: "Edificio no encontrado", 
        details: "El edificio especificado no existe",
        field: "ubicacion.edificioId"
      });
    }
    
    if (error.message && error.message.includes('propietario no encontrado')) {
      return res.status(404).json({ 
        message: "Propietario no encontrado", 
        details: "El propietario especificado no existe",
        field: "propietarioId"
      });
    }
    
    res.status(500).json({ 
      message: "Error al crear el escritorio flexible", 
      details: error.message 
    });
  }
};

const updateEscritorioFlexibleController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateEscritorioFlexibleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    const escritorio = await updateEscritorioFlexible(id, value);
    if (!escritorio) {
      return res.status(404).json({ 
        message: "Escritorio no encontrado", 
        details: `No se ha encontrado el escritorio flexible con id: ${id}` 
      });
    }
    res.status(200).json(escritorio);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de escritorio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Código duplicado", 
        details: "El código de escritorio ya está en uso",
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
    
    if (error.message && error.message.includes('edificio no encontrado')) {
      return res.status(404).json({ 
        message: "Edificio no encontrado", 
        details: "El edificio especificado no existe",
        field: "ubicacion.edificioId"
      });
    }
    
    if (error.message && error.message.includes('propietario no encontrado')) {
      return res.status(404).json({ 
        message: "Propietario no encontrado", 
        details: "El propietario especificado no existe",
        field: "propietarioId"
      });
    }
    
    res.status(500).json({ 
      message: "Error al actualizar el escritorio flexible", 
      details: error.message 
    });
  }
};

const deleteEscritorioFlexibleController = async (req, res) => {
  const { id } = req.params;
  try {
    const escritorio = await deleteEscritorioFlexible(id);
    if (!escritorio) {
      return res.status(404).json({ 
        message: "Escritorio no encontrado", 
        details: `No se ha encontrado el escritorio flexible con id: ${id}` 
      });
    }
    res.status(200).json({ message: "Escritorio flexible eliminado correctamente" });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de escritorio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('no eliminable') || error.message.includes('tiene reservas')) {
      return res.status(400).json({ 
        message: "Escritorio no eliminable", 
        details: "No se puede eliminar un escritorio que tiene reservas asociadas"
      });
    }
    
    res.status(500).json({ 
      message: "Error al eliminar el escritorio flexible", 
      details: error.message 
    });
  }
};

const cambiarEstadoEscritorioController = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado) {
    return res.status(400).json({ 
      message: "Dato requerido", 
      details: "Se requiere especificar un estado",
      field: "estado"
    });
  }
  
  if (!['disponible', 'ocupado', 'mantenimiento', 'reservado'].includes(estado)) {
    return res.status(400).json({ 
      message: "Estado no válido", 
      details: "El estado debe ser 'disponible', 'ocupado', 'mantenimiento' o 'reservado'",
      field: "estado"
    });
  }
  
  try {
    const escritorio = await cambiarEstadoEscritorio(id, estado);
    if (!escritorio) {
      return res.status(404).json({ 
        message: "Escritorio no encontrado", 
        details: `No se ha encontrado el escritorio flexible con id: ${id}` 
      });
    }
    res.status(200).json({ message: "Estado actualizado correctamente", escritorio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de escritorio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('transición no permitida')) {
      return res.status(400).json({ 
        message: "Cambio de estado no permitido", 
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: "Error al cambiar el estado del escritorio", 
      details: error.message 
    });
  }
};

const agregarAmenidadController = async (req, res) => {
  const { id } = req.params;
  const { amenidad } = req.body;
  
  if (!amenidad || !amenidad.tipo) {
    return res.status(400).json({ 
      message: "Datos incompletos", 
      details: "Se requieren datos de amenidad válidos con al menos un tipo",
      field: "amenidad"
    });
  }
  
  try {
    const escritorio = await agregarAmenidad(id, amenidad);
    if (!escritorio) {
      return res.status(404).json({ 
        message: "Escritorio no encontrado", 
        details: `No se ha encontrado el escritorio flexible con id: ${id}` 
      });
    }
    res.status(200).json({ message: "Amenidad agregada correctamente", escritorio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de escritorio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('ya existe')) {
      return res.status(400).json({ 
        message: "Amenidad duplicada", 
        details: "La amenidad ya existe en este escritorio"
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Formato de amenidad inválido", 
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: "Error al agregar la amenidad", 
      details: error.message 
    });
  }
};

const eliminarAmenidadController = async (req, res) => {
  const { id, amenidadId } = req.params;
  
  try {
    const escritorio = await eliminarAmenidad(id, amenidadId);
    if (!escritorio) {
      return res.status(404).json({ 
        message: "Escritorio no encontrado", 
        details: `No se ha encontrado el escritorio flexible con id: ${id}` 
      });
    }
    res.status(200).json({ message: "Amenidad eliminada correctamente", escritorio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID inválido", 
        details: `El formato de alguno de los IDs no es válido`
      });
    }
    
    if (error.message && error.message.includes('amenidad no encontrada')) {
      return res.status(404).json({ 
        message: "Amenidad no encontrada", 
        details: `No se ha encontrado la amenidad con id: ${amenidadId} en este escritorio`
      });
    }
    
    res.status(500).json({ 
      message: "Error al eliminar la amenidad", 
      details: error.message 
    });
  }
};

const actualizarPreciosController = async (req, res) => {
  const { id } = req.params;
  const { precios } = req.body;
  
  if (!precios || typeof precios !== 'object') {
    return res.status(400).json({ 
      message: "Formato inválido", 
      details: "Se requiere un objeto de precios válido",
      field: "precios"
    });
  }
  
  // Validar formato de precios
  const preciosPermitidos = ['porDia', 'porSemana', 'porMes', 'porHora'];
  const preciosInvalidos = Object.keys(precios).filter(key => !preciosPermitidos.includes(key));
  
  if (preciosInvalidos.length > 0) {
    return res.status(400).json({ 
      message: "Precios inválidos", 
      details: `Las claves de precio válidas son: ${preciosPermitidos.join(', ')}. Se encontraron claves inválidas: ${preciosInvalidos.join(', ')}`,
      field: "precios"
    });
  }
  
  // Validar valores numéricos positivos
  const valoresInvalidos = Object.entries(precios).filter(([_, valor]) => typeof valor !== 'number' || valor < 0);
  
  if (valoresInvalidos.length > 0) {
    return res.status(400).json({ 
      message: "Valores de precio inválidos", 
      details: "Todos los precios deben ser valores numéricos positivos",
      field: "precios"
    });
  }
  
  try {
    const escritorio = await actualizarPrecios(id, precios);
    if (!escritorio) {
      return res.status(404).json({ 
        message: "Escritorio no encontrado", 
        details: `No se ha encontrado el escritorio flexible con id: ${id}` 
      });
    }
    res.status(200).json({ message: "Precios actualizados correctamente", escritorio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de escritorio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Error de validación en precios", 
        details: error.message,
        field: "precios"
      });
    }
    
    res.status(500).json({ 
      message: "Error al actualizar los precios", 
      details: error.message 
    });
  }
};

const getEscritoriosDisponiblesController = async (req, res) => {
  const { fecha, edificioId, capacidadMinima } = req.query;
  
  if (!fecha) {
    return res.status(400).json({ 
      message: "Parámetro requerido", 
      details: "Se requiere una fecha para verificar disponibilidad",
      field: "fecha"
    });
  }
  
  try {
    // Validar formato de fecha
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({ 
        message: "Formato de fecha inválido", 
        details: "La fecha debe tener un formato válido (YYYY-MM-DD o ISO)",
        field: "fecha"
      });
    }
    
    // Validar capacidad mínima si se proporciona
    let capacidad = undefined;
    if (capacidadMinima) {
      capacidad = parseInt(capacidadMinima);
      if (isNaN(capacidad) || capacidad < 1) {
        return res.status(400).json({ 
          message: "Capacidad inválida", 
          details: "La capacidad mínima debe ser un número entero positivo",
          field: "capacidadMinima"
        });
      }
    }
    
    const escritorios = await getEscritoriosDisponibles(fechaObj, edificioId, capacidad);
    res.status(200).json(escritorios);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID no es válido`
      });
    }
    
    if (error.message && error.message.includes('edificio no encontrado')) {
      return res.status(404).json({ 
        message: "Edificio no encontrado", 
        details: "El edificio especificado no existe"
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener escritorios disponibles", 
      details: error.message 
    });
  }
};

const filtrarEscritoriosFlexiblesController = async (req, res) => {
  const { error, value } = filtrarEscritoriosFlexiblesSchema.validate(req.query);
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
    
    if (value.edificioId) filtros['ubicacion.edificioId'] = value.edificioId;
    if (value.piso) filtros['ubicacion.piso'] = parseInt(value.piso);
    if (value.zona) filtros['ubicacion.zona'] = value.zona;
    if (value.tipo) filtros.tipo = value.tipo;
    if (value.amenidades) filtros['amenidades.tipo'] = { $in: value.amenidades };
    if (value.precioMaximoPorDia) filtros['precios.porDia'] = { $lte: parseFloat(value.precioMaximoPorDia) };
    if (value.estado) filtros.estado = value.estado;
    
    const escritorios = await getEscritoriosFlexibles(filtros);
    res.status(200).json(escritorios);
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
      message: "Error al filtrar escritorios", 
      details: error.message 
    });
  }
};

module.exports = {
  getEscritoriosFlexiblesController,
  getEscritorioFlexibleByIdController,
  getEscritorioFlexibleByCodigoController,
  getEscritoriosByEdificioController,
  getEscritoriosByTipoController,
  getEscritoriosByZonaController,
  getEscritoriosByAmenidadesController,
  getEscritoriosByPropietarioController,
  getEscritoriosByRangoPrecioController,
  createEscritorioFlexibleController,
  updateEscritorioFlexibleController,
  deleteEscritorioFlexibleController,
  cambiarEstadoEscritorioController,
  agregarAmenidadController,
  eliminarAmenidadController,
  actualizarPreciosController,
  getEscritoriosDisponiblesController,
  filtrarEscritoriosFlexiblesController
};