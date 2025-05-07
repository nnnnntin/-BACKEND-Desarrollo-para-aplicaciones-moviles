const {
  getEscritoriosFlexibles,
  findEscritorioFlexibleById,
  findEscritorioFlexibleByCodigo,
  getEscritoriosByEdificio,
  getEscritoriosByTipo,
  getEscritoriosByAmenidades,
  getEscritoriosByPropietario,
  getEscritoriosByRangoPrecio,
  createEscritorioFlexible,
  updateEscritorioFlexible,
  deleteEscritorioFlexible,
  cambiarEstadoEscritorio,
  agregarAmenidad,
  eliminarAmenidad,
  getEscritoriosDisponibles
} = require("../repositories/escritorioFlexible.repository");
const {
  createEscritorioFlexibleSchema,
  updateEscritorioFlexibleSchema,
  filtrarEscritoriosFlexiblesSchema
} = require("../routes/validations/escritorioFlexible.validation");

const getEscritoriosFlexiblesController = async (req, res) => {
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
    const escritorios = await getEscritoriosFlexibles(filtros, skipNum, limitNum);
    return res.status(200).json(escritorios);
  } catch (error) {
    console.error("[Error Controller] al obtener escritorios flexibles", error);
    return res.status(500).json({
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
  const { precioMinimo, precioMaximo, tipoPrecio } = req.query;

  if (!precioMinimo || !precioMaximo || isNaN(precioMinimo) || isNaN(precioMaximo)) {
    return res.status(400).json({ message: "Parámetros inválidos", details: "Se requiere un rango de precios válido (valores numéricos)" });
  }

  const min = parseFloat(precioMinimo);
  const max = parseFloat(precioMaximo);

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
  const { tipo, descripcion } = req.body;

  if (!tipo) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren datos de amenidad válidos con al menos un tipo",
      field: "tipo"
    });
  }

  const amenidad = { tipo, descripcion };

  try {
    const escritorio = await agregarAmenidad(req.params.id, amenidad);
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
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "La fecha debe tener un formato válido (YYYY-MM-DD o ISO)",
        field: "fecha"
      });
    }

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
  const query = { ...req.query };
  if (query.amenidades && typeof query.amenidades === "string") {
    query.amenidades = query.amenidades
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }

  const { error, value } = filtrarEscritoriosFlexiblesSchema.validate(query);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los filtros",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const filtros = {};
    if (value.edificioId) filtros["ubicacion.edificioId"] = value.edificioId;
    if (value.piso !== undefined) filtros["ubicacion.piso"] = parseInt(value.piso, 10);
    if (value.zona) filtros["ubicacion.zona"] = value.zona;
    if (value.tipo) filtros.tipo = value.tipo;
    if (value.amenidades) filtros["amenidades.tipo"] = { $in: value.amenidades };
    if (value.precioMaximoPorDia !== undefined) filtros["precios.porDia"] = { $lte: parseFloat(value.precioMaximoPorDia) };
    if (value.estado) filtros.estado = value.estado;

    const escritorios = await getEscritoriosFlexibles(filtros);
    res.status(200).json(escritorios);
  } catch (err) {
    console.error(err);
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Error en formato de ID",
        details: `El valor '${err.value}' no es válido para el campo '${err.path}'`,
        field: err.path
      });
    }
    res.status(500).json({
      message: "Error al filtrar escritorios",
      details: err.message
    });
  }
};

module.exports = {
  getEscritoriosFlexiblesController,
  getEscritorioFlexibleByIdController,
  getEscritorioFlexibleByCodigoController,
  getEscritoriosByEdificioController,
  getEscritoriosByTipoController,
  getEscritoriosByAmenidadesController,
  getEscritoriosByPropietarioController,
  getEscritoriosByRangoPrecioController,
  createEscritorioFlexibleController,
  updateEscritorioFlexibleController,
  deleteEscritorioFlexibleController,
  cambiarEstadoEscritorioController,
  agregarAmenidadController,
  eliminarAmenidadController,
  getEscritoriosDisponiblesController,
  filtrarEscritoriosFlexiblesController
};