const {
  getEspacios,
  findEspacioById,
  getEspaciosByEdificio,
  getEspaciosByTipo,
  getEspaciosByPropietario,
  getEspaciosByEmpresa,
  createEspacio,
  updateEspacio,
  deleteEspacio,
  cambiarEstadoEspacio,
  getEspaciosDisponibles,
  getEspaciosByAmenidades
} = require("../repositories/espacio.repository");
const {
  createEspacioSchema,
  updateEspacioSchema,
  filtrarEspaciosSchema
} = require("../routes/validations/espacio.validation");

const getEspaciosController = async (req, res) => {
  try {
    const espacios = await getEspacios();
    res.status(200).json(espacios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los espacios",
      details: error.message
    });
  }
};

const getEspacioByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const espacio = await findEspacioById(id);
    if (!espacio) {
      return res.status(404).json({ message: `No se ha encontrado el espacio con id: ${id}` });
    }
    res.status(200).json(espacio);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de espacio inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar el espacio",
      details: error.message
    });
  }
};

const getEspaciosByEdificioController = async (req, res) => {
  const { edificioId } = req.params;
  try {
    const espacios = await getEspaciosByEdificio(edificioId);
    res.status(200).json(espacios);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de edificio inválido",
        details: `El formato del ID '${edificioId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Edificio no encontrado",
        details: `No existe un edificio con id: ${edificioId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener espacios por edificio",
      details: error.message
    });
  }
};

const getEspaciosByTipoController = async (req, res) => {
  const { tipo } = req.params;

  const tiposValidos = ['oficina', 'sala_reunion', 'escritorio_flexible', 'area_comun', 'otro'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      message: "Tipo de espacio inválido",
      details: `El tipo debe ser uno de los siguientes: ${tiposValidos.join(', ')}`
    });
  }

  try {
    const espacios = await getEspaciosByTipo(tipo);
    res.status(200).json(espacios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener espacios por tipo",
      details: error.message
    });
  }
};

const getEspaciosByPropietarioController = async (req, res) => {
  const { propietarioId } = req.params;
  try {
    const espacios = await getEspaciosByPropietario(propietarioId);
    res.status(200).json(espacios);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de propietario inválido",
        details: `El formato del ID '${propietarioId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Propietario no encontrado",
        details: `No existe un propietario con id: ${propietarioId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener espacios por propietario",
      details: error.message
    });
  }
};

const getEspaciosByEmpresaController = async (req, res) => {
  const { empresaId } = req.params;
  try {
    const espacios = await getEspaciosByEmpresa(empresaId);
    res.status(200).json(espacios);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de empresa inválido",
        details: `El formato del ID '${empresaId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrada') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Empresa no encontrada",
        details: `No existe una empresa inmobiliaria con id: ${empresaId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener espacios por empresa",
      details: error.message
    });
  }
};

const createEspacioController = async (req, res) => {
  const { error, value } = createEspacioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const espacio = await createEspacio(value);
    res.status(201).json({ message: "Espacio creado correctamente", espacio });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: "Error de duplicación",
        details: `Ya existe un espacio con el mismo valor en '${field}'`,
        field
      });
    }

    if (error.message && (error.message.includes('edificio no encontrado') || error.message.includes('building not found'))) {
      return res.status(404).json({
        message: "Edificio no encontrado",
        details: "El edificio especificado no existe"
      });
    }

    if (error.message && (error.message.includes('propietario no encontrado') || error.message.includes('owner not found'))) {
      return res.status(404).json({
        message: "Propietario no encontrado",
        details: "El propietario especificado no existe"
      });
    }

    if (error.message && (error.message.includes('empresa no encontrada') || error.message.includes('company not found'))) {
      return res.status(404).json({
        message: "Empresa no encontrada",
        details: "La empresa inmobiliaria especificada no existe"
      });
    }

    res.status(500).json({
      message: "Error al crear el espacio",
      details: error.message
    });
  }
};

const updateEspacioController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateEspacioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const espacio = await updateEspacio(id, value);
    if (!espacio) {
      return res.status(404).json({ message: `No se ha encontrado el espacio con id: ${id}` });
    }
    res.status(200).json(espacio);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de espacio inválido",
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

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: "Error de duplicación",
        details: `Ya existe un espacio con el mismo valor en '${field}'`,
        field
      });
    }

    if (error.message && error.message.includes('reservas activas') || error.message.includes('active bookings')) {
      return res.status(400).json({
        message: "Espacio con reservas",
        details: "No se pueden modificar ciertos campos porque el espacio tiene reservas activas"
      });
    }

    res.status(500).json({
      message: "Error al actualizar el espacio",
      details: error.message
    });
  }
};

const deleteEspacioController = async (req, res) => {
  const { id } = req.params;
  try {
    const espacio = await deleteEspacio(id);
    if (!espacio) {
      return res.status(404).json({ message: `No se ha encontrado el espacio con id: ${id}` });
    }
    res.status(200).json({ message: "Espacio eliminado correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de espacio inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('reservas asociadas') || error.message.includes('associated bookings')) {
      return res.status(400).json({
        message: "Espacio con reservas",
        details: "No se puede eliminar el espacio porque tiene reservas asociadas"
      });
    }

    if (error.message && error.message.includes('servicios asociados') || error.message.includes('associated services')) {
      return res.status(400).json({
        message: "Espacio con servicios",
        details: "No se puede eliminar el espacio porque tiene servicios asociados"
      });
    }

    res.status(500).json({
      message: "Error al eliminar el espacio",
      details: error.message
    });
  }
};

const cambiarEstadoEspacioController = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['disponible', 'ocupado', 'mantenimiento', 'reservado'].includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: "El estado debe ser 'disponible', 'ocupado', 'mantenimiento' o 'reservado'"
    });
  }

  try {
    const espacio = await cambiarEstadoEspacio(id, estado);
    if (!espacio) {
      return res.status(404).json({ message: `No se ha encontrado el espacio con id: ${id}` });
    }
    res.status(200).json({ message: "Estado actualizado correctamente", espacio });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de espacio inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('reservas activas') || error.message.includes('active bookings')) {
      return res.status(400).json({
        message: "Espacio con reservas",
        details: "No se puede cambiar el estado a 'mantenimiento' porque el espacio tiene reservas activas"
      });
    }

    if (error.message && error.message.includes('no permitido') || error.message.includes('not allowed')) {
      return res.status(400).json({
        message: "Cambio no permitido",
        details: `No se permite cambiar de estado '${error.estadoActual}' a '${estado}'`
      });
    }

    res.status(500).json({
      message: "Error al cambiar el estado del espacio",
      details: error.message
    });
  }
};

const getEspaciosDisponiblesController = async (req, res) => {
  const { tipo, fecha, horaInicio, horaFin } = req.query;

  if (tipo) {
    const tiposValidos = ['oficina', 'sala_reunion', 'escritorio_flexible', 'area_comun', 'otro'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        message: "Tipo de espacio inválido",
        details: `El tipo debe ser uno de los siguientes: ${tiposValidos.join(', ')}`
      });
    }
  }

  if (fecha) {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "La fecha debe tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }
  }

  if (horaInicio && horaFin) {
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
      return res.status(400).json({
        message: "Formato de hora inválido",
        details: "Las horas deben tener formato HH:MM (24h)"
      });
    }

    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [finHora, finMin] = horaFin.split(':').map(Number);

    if (inicioHora > finHora || (inicioHora === finHora && inicioMin >= finMin)) {
      return res.status(400).json({
        message: "Rango de horas inválido",
        details: "La hora de inicio debe ser anterior a la hora de fin"
      });
    }
  }

  try {
    const espacios = await getEspaciosDisponibles(tipo, fecha, horaInicio, horaFin);
    res.status(200).json(espacios);
  } catch (error) {
    console.error(error);

    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({
        message: "Error en la fecha",
        details: error.message
      });
    }

    if (error.message && error.message.includes('hora')) {
      return res.status(400).json({
        message: "Error en las horas",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener espacios disponibles",
      details: error.message
    });
  }
};

const filtrarEspaciosController = async (req, res) => {
  const { error, value } = filtrarEspaciosSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los filtros",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const filtros = {};

    if (value.tipo) filtros.tipo = value.tipo;
    if (value.edificioId) filtros['ubicacion.edificioId'] = value.edificioId;
    if (value.piso) filtros['ubicacion.piso'] = value.piso;

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

    if (value.estado) filtros.estado = value.estado;

    if (value.amenidades) {
      const amenidadesArray = Array.isArray(value.amenidades) ? value.amenidades : [value.amenidades];
      filtros.amenidades = { $all: amenidadesArray };
    }

    const espacios = await getEspacios(filtros);
    res.status(200).json(espacios);
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
      message: "Error al filtrar espacios",
      details: error.message
    });
  }
};

const getEspaciosByAmenidadesController = async (req, res) => {
  const { amenidades } = req.query;

  if (!amenidades) {
    return res.status(400).json({
      message: "Parámetro requerido",
      details: "Se requiere el parámetro 'amenidades'"
    });
  }

  try {
    const amenidadesArray = Array.isArray(amenidades) ? amenidades : [amenidades];

    const espacios = await getEspaciosByAmenidades(amenidadesArray);
    res.status(200).json(espacios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener espacios por amenidades",
      details: error.message
    });
  }
};

module.exports = {
  getEspaciosController,
  getEspacioByIdController,
  getEspaciosByEdificioController,
  getEspaciosByTipoController,
  getEspaciosByPropietarioController,
  getEspaciosByEmpresaController,
  createEspacioController,
  updateEspacioController,
  deleteEspacioController,
  cambiarEstadoEspacioController,
  getEspaciosDisponiblesController,
  filtrarEspaciosController,
  getEspaciosByAmenidadesController
};