const {
  getOficinas,
  findOficinaById,
  findOficinaByCodigo,
  getOficinasByEdificio,
  getOficinasByTipo,
  getOficinasByPropietario,
  getOficinasByEmpresa,
  createOficina,
  updateOficina,
  deleteOficina,
  cambiarEstadoOficina,
  getOficinasByCapacidad,
  getOficinasByRangoPrecio,
  getOficinasDisponibles,
  actualizarCalificacion
} = require("../repositories/oficina.repository");
const {
  createOficinaSchema,
  updateOficinaSchema,
  filtrarOficinasSchema
} = require("../routes/validations/oficina.validation");

const getOficinasController = async (req, res) => {
  const { skip = "0", limit = "10", ...filtros } = req.query;
  const skipNum  = parseInt(skip, 10);
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
    const oficinas = await getOficinas(filtros, skipNum, limitNum);
    return res.status(200).json(oficinas);
  } catch (error) {
    console.error("[Controller] Error al obtener oficinas", error);
    return res.status(500).json({
      message: "Error al obtener las oficinas",
      details: error.message
    });
  }
};

const getOficinaByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const oficina = await findOficinaById(id);
    if (!oficina) {
      return res.status(404).json({
        message: "Oficina no encontrada",
        details: `No se ha encontrado la oficina con id: ${id}`
      });
    }
    res.status(200).json(oficina);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de oficina inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar la oficina",
      details: error.message
    });
  }
};

const getOficinaByCodigoController = async (req, res) => {
  const { codigo } = req.params;
  try {
    const oficina = await findOficinaByCodigo(codigo);
    if (!oficina) {
      return res.status(404).json({
        message: "Oficina no encontrada",
        details: `No se ha encontrado la oficina con código: ${codigo}`
      });
    }
    res.status(200).json(oficina);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al buscar la oficina por código",
      details: error.message
    });
  }
};

const getOficinasByEdificioController = async (req, res) => {
  const { edificioId } = req.params;
  try {
    const oficinas = await getOficinasByEdificio(edificioId);
    res.status(200).json(oficinas);
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
      message: "Error al obtener oficinas del edificio",
      details: error.message
    });
  }
};

const getOficinasByTipoController = async (req, res) => {
  const { tipo } = req.params;
  try {
    const tiposValidos = ['privada', 'compartida', 'coworking'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        message: "Tipo de oficina inválido",
        details: `Los tipos válidos son: ${tiposValidos.join(', ')}`,
        field: "tipo"
      });
    }

    const oficinas = await getOficinasByTipo(tipo);
    res.status(200).json(oficinas);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('tipo no válido')) {
      return res.status(400).json({
        message: "Tipo no válido",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener oficinas por tipo",
      details: error.message
    });
  }
};

const getOficinasByPropietarioController = async (req, res) => {
  const { propietarioId } = req.params;
  try {
    const oficinas = await getOficinasByPropietario(propietarioId);
    res.status(200).json(oficinas);
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
      message: "Error al obtener oficinas del propietario",
      details: error.message
    });
  }
};

const getOficinasByEmpresaController = async (req, res) => {
  const { empresaId } = req.params;
  try {
    const oficinas = await getOficinasByEmpresa(empresaId);
    res.status(200).json(oficinas);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de empresa inválido",
        details: `El formato del ID '${empresaId}' no es válido`
      });
    }

    if (error.message && error.message.includes('empresa no encontrada')) {
      return res.status(404).json({
        message: "Empresa no encontrada",
        details: `No existe una empresa con id: ${empresaId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener oficinas de la empresa",
      details: error.message
    });
  }
};

const createOficinaController = async (req, res) => {
  const { error, value } = createOficinaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const oficina = await createOficina(value);
    res.status(201).json({ message: "Oficina creada correctamente", oficina });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Código de oficina duplicado",
        details: "El código de oficina ya está en uso",
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
      message: "Error al crear la oficina",
      details: error.message
    });
  }
};

const updateOficinaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateOficinaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const oficina = await updateOficina(id, value);
    if (!oficina) {
      return res.status(404).json({
        message: "Oficina no encontrada",
        details: `No se ha encontrado la oficina con id: ${id}`
      });
    }
    res.status(200).json(oficina);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de oficina inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Código de oficina duplicado",
        details: "El código de oficina ya está en uso",
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

    if (error.message && error.message.includes('empresa no encontrada')) {
      return res.status(404).json({
        message: "Empresa no encontrada",
        details: "La empresa especificada no existe",
        field: "empresaId"
      });
    }

    res.status(500).json({
      message: "Error al actualizar la oficina",
      details: error.message
    });
  }
};

const deleteOficinaController = async (req, res) => {
  const { id } = req.params;
  try {
    const oficina = await deleteOficina(id);
    if (!oficina) {
      return res.status(404).json({
        message: "Oficina no encontrada",
        details: `No se ha encontrado la oficina con id: ${id}`
      });
    }
    res.status(200).json({ message: "Oficina eliminada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de oficina inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('tiene reservas') || error.message.includes('no eliminable')) {
      return res.status(400).json({
        message: "Oficina no eliminable",
        details: "No se puede eliminar una oficina que tiene reservas asociadas"
      });
    }

    res.status(500).json({
      message: "Error al eliminar la oficina",
      details: error.message
    });
  }
};

const cambiarEstadoOficinaController = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({
      message: "Dato requerido",
      details: "Se requiere especificar un estado",
      field: "estado"
    });
  }

  if (!['disponible', 'ocupada', 'mantenimiento', 'reservada'].includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: "El estado debe ser 'disponible', 'ocupada', 'mantenimiento' o 'reservada'",
      field: "estado"
    });
  }

  try {
    const oficina = await cambiarEstadoOficina(id, estado);
    if (!oficina) {
      return res.status(404).json({
        message: "Oficina no encontrada",
        details: `No se ha encontrado la oficina con id: ${id}`
      });
    }
    res.status(200).json({ message: "Estado actualizado correctamente", oficina });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de oficina inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('transición no permitida')) {
      return res.status(400).json({
        message: "Cambio de estado no permitido",
        details: error.message
      });
    }

    if (error.message && error.message.includes('tiene reservas activas')) {
      return res.status(400).json({
        message: "Oficina con reservas",
        details: "No se puede cambiar el estado a 'mantenimiento' si la oficina tiene reservas activas"
      });
    }

    res.status(500).json({
      message: "Error al cambiar el estado de la oficina",
      details: error.message
    });
  }
};

const getOficinasByCapacidadController = async (req, res) => {
  const { capacidadMinima } = req.query;

  if (!capacidadMinima || isNaN(capacidadMinima)) {
    return res.status(400).json({
      message: "Parámetro inválido",
      details: "Se requiere una capacidad mínima válida (valor numérico)",
      field: "capacidadMinima"
    });
  }

  const capacidad = parseInt(capacidadMinima);

  if (capacidad < 1) {
    return res.status(400).json({
      message: "Valor de capacidad inválido",
      details: "La capacidad mínima debe ser un número entero positivo",
      field: "capacidadMinima"
    });
  }

  try {
    const oficinas = await getOficinasByCapacidad(capacidad);
    res.status(200).json(oficinas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener oficinas por capacidad",
      details: error.message
    });
  }
};

const getOficinasByRangoPrecioController = async (req, res) => {
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

  if (tipoPrecio && !['porDia', 'porSemana', 'porMes', 'porHora'].includes(tipoPrecio)) {
    return res.status(400).json({
      message: "Tipo de precio inválido",
      details: "El tipo de precio debe ser 'porDia', 'porSemana', 'porMes' o 'porHora'",
      field: "tipoPrecio"
    });
  }

  try {
    const oficinas = await getOficinasByRangoPrecio(
      min,
      max,
      tipoPrecio || 'porDia'
    );
    res.status(200).json(oficinas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener oficinas por rango de precio",
      details: error.message
    });
  }
};

const getOficinasDisponiblesController = async (req, res) => {
  const { fecha, horaInicio, horaFin } = req.query;

  if (!fecha) {
    return res.status(400).json({
      message: "Parámetro requerido",
      details: "Se requiere especificar una fecha (YYYY-MM-DD)",
      field: "fecha"
    });
  }
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    return res.status(400).json({
      message: "Formato de fecha inválido",
      details: "La fecha debe tener formato YYYY-MM-DD",
      field: "fecha"
    });
  }

  const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (horaInicio && !horaRegex.test(horaInicio)) {
    return res.status(400).json({
      message: "Formato de hora inválido",
      details: "La hora de inicio debe tener formato HH:MM (24h)",
      field: "horaInicio"
    });
  }
  if (horaFin && !horaRegex.test(horaFin)) {
    return res.status(400).json({
      message: "Formato de hora inválido",
      details: "La hora de fin debe tener formato HH:MM (24h)",
      field: "horaFin"
    });
  }

  if (horaInicio && horaFin) {
    const [hiH, hiM] = horaInicio.split(':').map(Number);
    const [hfH, hfM] = horaFin.split(':').map(Number);
    const minutosInicio = hiH * 60 + hiM;
    const minutosFin = hfH * 60 + hfM;
    if (minutosInicio >= minutosFin) {
      return res.status(400).json({
        message: "Rango de horas inválido",
        details: "La hora de inicio debe ser anterior a la hora de fin"
      });
    }
  }

  try {
    const oficinas = await getOficinasDisponibles(fecha, horaInicio, horaFin);
    return res.status(200).json(oficinas);
  } catch (error) {
    console.error("Error en getOficinasDisponiblesController:", error);
    return res.status(500).json({
      message: "Error al obtener oficinas disponibles",
      details: error.message
    });
  }
};

const actualizarCalificacionController = async (req, res) => {
  const { id } = req.params;
  const { calificacion } = req.body;

  if (calificacion === undefined || calificacion === null) {
    return res.status(400).json({
      message: "Dato requerido",
      details: "Se requiere especificar una calificación",
      field: "calificacion"
    });
  }

  const calificacionNum = parseFloat(calificacion);

  if (isNaN(calificacionNum) || calificacionNum < 0 || calificacionNum > 5) {
    return res.status(400).json({
      message: "Calificación inválida",
      details: "Se requiere una calificación válida entre 0 y 5",
      field: "calificacion"
    });
  }

  try {
    const oficina = await actualizarCalificacion(id, calificacionNum);
    if (!oficina) {
      return res.status(404).json({
        message: "Oficina no encontrada",
        details: `No se ha encontrado la oficina con id: ${id}`
      });
    }
    res.status(200).json({ message: "Calificación actualizada correctamente", oficina });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de oficina inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al actualizar la calificación",
      details: error.message
    });
  }
};

const filtrarOficinasController = async (req, res) => {
  const { error, value } = filtrarOficinasSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los filtros",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const filtros = {};

    if (value.edificioId) filtros['ubicacion.edificioId'] = value.edificioId;

    if (value.tipo) {
      const tiposValidos = ['individual', 'compartida', 'ejecutiva', 'sala de reuniones', 'sala de conferencias'];
      if (!tiposValidos.includes(value.tipo)) {
        return res.status(400).json({
          message: "Tipo de oficina inválido",
          details: `Los tipos válidos son: ${tiposValidos.join(', ')}`,
          field: "tipo"
        });
      }
      filtros.tipo = value.tipo;
    }

    if (value.capacidadMinima) {
      const capacidad = parseInt(value.capacidadMinima);
      if (isNaN(capacidad) || capacidad < 1) {
        return res.status(400).json({
          message: "Capacidad inválida",
          details: "La capacidad mínima debe ser un número entero positivo",
          field: "capacidadMinima"
        });
      }
      filtros.capacidad = { $gte: capacidad };
    }

    if (value.precioMaximo) {
      const precioMax = parseFloat(value.precioMaximo);
      if (isNaN(precioMax) || precioMax < 0) {
        return res.status(400).json({
          message: "Precio inválido",
          details: "El precio máximo debe ser un número positivo",
          field: "precioMaximo"
        });
      }
      filtros['precios.porDia'] = { $lte: precioMax };
    }

    if (value.estado) {
      const estadosValidos = ['disponible', 'ocupada', 'mantenimiento', 'reservada'];
      if (!estadosValidos.includes(value.estado)) {
        return res.status(400).json({
          message: "Estado inválido",
          details: `Los estados válidos son: ${estadosValidos.join(', ')}`,
          field: "estado"
        });
      }
      filtros.estado = value.estado;
    }

    if (value.amenidades) {
      if (!Array.isArray(value.amenidades)) {
        try {
          const amenidades = JSON.parse(value.amenidades);
          if (!Array.isArray(amenidades)) {
            throw new Error("No es un array");
          }
          filtros.amenidades = { $all: amenidades };
        } catch (e) {
          return res.status(400).json({
            message: "Formato inválido",
            details: "El parámetro 'amenidades' debe ser un array",
            field: "amenidades"
          });
        }
      } else {
        filtros.amenidades = { $all: value.amenidades };
      }
    }

    const oficinas = await getOficinas(filtros);
    res.status(200).json(oficinas);
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
      message: "Error al filtrar oficinas",
      details: error.message
    });
  }
};

module.exports = {
  getOficinasController,
  getOficinaByIdController,
  getOficinaByCodigoController,
  getOficinasByEdificioController,
  getOficinasByTipoController,
  getOficinasByPropietarioController,
  getOficinasByEmpresaController,
  createOficinaController,
  updateOficinaController,
  deleteOficinaController,
  cambiarEstadoOficinaController,
  getOficinasByCapacidadController,
  getOficinasByRangoPrecioController,
  getOficinasDisponiblesController,
  actualizarCalificacionController,
  filtrarOficinasController
};