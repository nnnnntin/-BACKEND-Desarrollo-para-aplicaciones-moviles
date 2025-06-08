const {
  getSalasReunion,
  findSalaReunionById,
  findSalaReunionByCodigo,
  getSalasByEdificio,
  getSalasByCapacidad,
  getSalasByConfiguracion,
  getSalasByEquipamiento,
  getSalasByPropietario,
  getSalasByRangoPrecio,
  createSalaReunion,
  updateSalaReunion,
  deleteSalaReunion,
  cambiarEstadoSala,
  agregarEquipamiento,
  eliminarEquipamiento,
  actualizarPrecios,
  getSalasDisponibles
} = require("../repositories/salaReunion.repository");
const {
  createSalaReunionSchema,
  updateSalaReunionSchema,
  filtrarSalasReunionSchema
} = require("../routes/validations/salaReunion.validation");

const Edificio = require("../models/edificio.model");
const Usuario = require("../models/usuario.model");
const EmpresaInmobiliaria = require("../models/empresaInmobiliaria.model");

const getSalasReunionController = async (req, res) => {
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
    const salas = await getSalasReunion(filtros, skipNum, limitNum);
    return res.status(200).json(salas);
  } catch (error) {
    console.error("[Controller] Error al obtener salas de reunión", error);
    return res.status(500).json({
      message: "Error al obtener las salas de reunión",
      details: error.message
    });
  }
};

const getSalaReunionByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const sala = await findSalaReunionById(id);
    if (!sala) {
      return res.status(404).json({ message: `No se ha encontrado la sala de reunión con id: ${id}` });
    }
    res.status(200).json(sala);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de sala inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar la sala de reunión",
      details: error.message
    });
  }
};

const getSalaReunionByCodigoController = async (req, res) => {
  const { codigo } = req.params;
  try {
    const sala = await findSalaReunionByCodigo(codigo);
    if (!sala) {
      return res.status(404).json({ message: `No se ha encontrado la sala de reunión con código: ${codigo}` });
    }
    res.status(200).json(sala);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al buscar la sala de reunión por código",
      details: error.message
    });
  }
};

const getSalasByEdificioController = async (req, res) => {
  const { edificioId } = req.params;
  try {
    const salas = await getSalasByEdificio(edificioId);
    res.status(200).json(salas);
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
      message: "Error al obtener salas por edificio",
      details: error.message
    });
  }
};

const getSalasByCapacidadController = async (req, res) => {
  const { capacidadMinima } = req.query;

  if (!capacidadMinima || isNaN(capacidadMinima)) {
    return res.status(400).json({
      message: "Parámetro inválido",
      details: "Se requiere una capacidad mínima válida (número entero positivo)"
    });
  }

  const capacidad = parseInt(capacidadMinima);
  if (capacidad < 1) {
    return res.status(400).json({
      message: "Capacidad inválida",
      details: "La capacidad mínima debe ser un número entero positivo"
    });
  }

  try {
    const salas = await getSalasByCapacidad(capacidad);
    res.status(200).json(salas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener salas por capacidad",
      details: error.message
    });
  }
};

const getSalasByConfiguracionController = async (req, res) => {
  const { configuracion } = req.params;

  const configuracionesValidas = ['conferencia', 'u', 'aula', 'junta', 'imperial', 'coctel', 'auditorio'];
  if (!configuracionesValidas.includes(configuracion)) {
    return res.status(400).json({
      message: "Configuración no válida",
      details: `La configuración debe ser una de las siguientes: ${configuracionesValidas.join(', ')}`
    });
  }

  try {
    const salas = await getSalasByConfiguracion(configuracion);
    res.status(200).json(salas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener salas por configuración",
      details: error.message
    });
  }
};

const getSalasByEquipamientoController = async (req, res) => {
  const { tipoEquipamiento } = req.params;
  try {
    const salas = await getSalasByEquipamiento(tipoEquipamiento);
    res.status(200).json(salas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener salas por equipamiento",
      details: error.message
    });
  }
};

const getSalasByPropietarioController = async (req, res) => {
  const { propietarioId } = req.params;
  try {
    const salas = await getSalasByPropietario(propietarioId);
    res.status(200).json(salas);
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
      message: "Error al obtener salas por propietario",
      details: error.message
    });
  }
};

const getSalasByRangoPrecioController = async (req, res) => {
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

  const tiposPrecioValidos = ['porHora', 'porDia', 'porMes'];
  const tipo = tipoPrecio || 'porHora';
  if (!tiposPrecioValidos.includes(tipo)) {
    return res.status(400).json({
      message: "Tipo de precio no válido",
      details: `El tipo de precio debe ser uno de los siguientes: ${tiposPrecioValidos.join(', ')}`
    });
  }

  try {
    const salas = await getSalasByRangoPrecio(min, max, tipo);
    res.status(200).json(salas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener salas por rango de precio",
      details: error.message
    });
  }
};

const createSalaReunionController = async (req, res) => {
  const { error, value } = createSalaReunionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        if (value.ubicacion && value.ubicacion.edificioId) {
      const edificioExiste = await Edificio.findById(value.ubicacion.edificioId);
      if (!edificioExiste) {
        return res.status(404).json({
          message: "Edificio no encontrado",
          details: `No existe un edificio con id: ${value.ubicacion.edificioId}`,
          field: "ubicacion.edificioId"
        });
      }

            if (!edificioExiste.activo) {
        return res.status(400).json({
          message: "Edificio inactivo",
          details: "El edificio especificado no está activo",
          field: "ubicacion.edificioId"
        });
      }
    }

        if (value.propietarioId) {
      const propietarioExiste = await Usuario.findById(value.propietarioId);
      if (!propietarioExiste) {
        return res.status(404).json({
          message: "Propietario no encontrado",
          details: `No existe un usuario con id: ${value.propietarioId}`,
          field: "propietarioId"
        });
      }

            if (!propietarioExiste.activo) {
        return res.status(400).json({
          message: "Propietario inactivo",
          details: "El propietario especificado no está activo",
          field: "propietarioId"
        });
      }
    }

        if (value.empresaInmobiliariaId) {
      const empresaExiste = await EmpresaInmobiliaria.findById(value.empresaInmobiliariaId);
      if (!empresaExiste) {
        return res.status(404).json({
          message: "Empresa inmobiliaria no encontrada",
          details: `No existe una empresa inmobiliaria con id: ${value.empresaInmobiliariaId}`,
          field: "empresaInmobiliariaId"
        });
      }

            if (!empresaExiste.activo) {
        return res.status(400).json({
          message: "Empresa inmobiliaria inactiva",
          details: "La empresa inmobiliaria especificada no está activa",
          field: "empresaInmobiliariaId"
        });
      }
    }

    const sala = await createSalaReunion(value);
    res.status(201).json({ message: "Sala de reunión creada correctamente", sala });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: `El formato del ID no es válido`
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: "Error de duplicación",
        details: `El ${field} de sala ya está en uso`,
        field
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
      message: "Error al crear la sala de reunión",
      details: error.message
    });
  }
};

const updateSalaReunionController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateSalaReunionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        if (value.ubicacion && value.ubicacion.edificioId) {
      const edificioExiste = await Edificio.findById(value.ubicacion.edificioId);
      if (!edificioExiste) {
        return res.status(404).json({
          message: "Edificio no encontrado",
          details: `No existe un edificio con id: ${value.ubicacion.edificioId}`,
          field: "ubicacion.edificioId"
        });
      }

            if (!edificioExiste.activo) {
        return res.status(400).json({
          message: "Edificio inactivo",
          details: "El edificio especificado no está activo",
          field: "ubicacion.edificioId"
        });
      }
    }

        if (value.propietarioId) {
      const propietarioExiste = await Usuario.findById(value.propietarioId);
      if (!propietarioExiste) {
        return res.status(404).json({
          message: "Propietario no encontrado",
          details: `No existe un usuario con id: ${value.propietarioId}`,
          field: "propietarioId"
        });
      }

            if (!propietarioExiste.activo) {
        return res.status(400).json({
          message: "Propietario inactivo",
          details: "El propietario especificado no está activo",
          field: "propietarioId"
        });
      }
    }

        if (value.empresaInmobiliariaId) {
      const empresaExiste = await EmpresaInmobiliaria.findById(value.empresaInmobiliariaId);
      if (!empresaExiste) {
        return res.status(404).json({
          message: "Empresa inmobiliaria no encontrada",
          details: `No existe una empresa inmobiliaria con id: ${value.empresaInmobiliariaId}`,
          field: "empresaInmobiliariaId"
        });
      }

            if (!empresaExiste.activo) {
        return res.status(400).json({
          message: "Empresa inmobiliaria inactiva",
          details: "La empresa inmobiliaria especificada no está activa",
          field: "empresaInmobiliariaId"
        });
      }
    }

    const sala = await updateSalaReunion(id, value);
    if (!sala) {
      return res.status(404).json({ message: `No se ha encontrado la sala de reunión con id: ${id}` });
    }
    res.status(200).json(sala);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: `El formato del ID no es válido`
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: "Error de duplicación",
        details: `El ${field} de sala ya está en uso`,
        field
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    if (error.message && error.message.includes('reservas activas') || error.message.includes('active bookings')) {
      return res.status(400).json({
        message: "Sala con reservas",
        details: "No se pueden modificar ciertos campos porque la sala tiene reservas activas"
      });
    }

    res.status(500).json({
      message: "Error al actualizar la sala de reunión",
      details: error.message
    });
  }
};

const deleteSalaReunionController = async (req, res) => {
  const { id } = req.params;
  try {
    const sala = await deleteSalaReunion(id);
    if (!sala) {
      return res.status(404).json({ message: `No se ha encontrado la sala de reunión con id: ${id}` });
    }
    res.status(200).json({ message: "Sala de reunión eliminada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de sala inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('reservas asociadas') || error.message.includes('associated bookings')) {
      return res.status(400).json({
        message: "Sala con reservas",
        details: "No se puede eliminar la sala porque tiene reservas asociadas"
      });
    }

    res.status(500).json({
      message: "Error al eliminar la sala de reunión",
      details: error.message
    });
  }
};

const cambiarEstadoSalaController = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['disponible', 'ocupada', 'mantenimiento', 'reservada'].includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: "El estado debe ser 'disponible', 'ocupada', 'mantenimiento' o 'reservada'"
    });
  }

  try {
    const sala = await cambiarEstadoSala(id, estado);
    if (!sala) {
      return res.status(404).json({ message: `No se ha encontrado la sala de reunión con id: ${id}` });
    }
    res.status(200).json({ message: "Estado actualizado correctamente", sala });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de sala inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('reservas activas') || error.message.includes('active bookings')) {
      return res.status(400).json({
        message: "Sala con reservas",
        details: "No se puede cambiar el estado a 'mantenimiento' porque la sala tiene reservas activas"
      });
    }

    res.status(500).json({
      message: "Error al cambiar el estado de la sala",
      details: error.message
    });
  }
};

const agregarEquipamientoController = async (req, res) => {
  const { id } = req.params;
  const { tipo, descripcion } = req.body;

  if (!tipo) {
    return res.status(400).json({
      message: "Datos inválidos",
      details: "Se requiere un campo 'tipo' para el equipamiento",
      field: "tipo"
    });
  }

  const nuevoEquipamiento = { tipo, descripcion };

  try {
    const sala = await agregarEquipamiento(id, nuevoEquipamiento);
    if (!sala) {
      return res.status(404).json({
        message: "Sala de reunión no encontrada",
        details: `No existe una sala con id: ${id}`
      });
    }

    return res.status(200).json({
      message: "Equipamiento agregado correctamente",
      sala
    });

  } catch (error) {
    console.error("Error en agregarEquipamientoController:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID de sala inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.name === "ValidationError") {
      const detalles = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        message: "Error de validación en datos de equipamiento",
        details: detalles
      });
    }

    if (error.message && (error.message.includes("duplicate key") || error.message.includes("already exists"))) {
      return res.status(400).json({
        message: "Equipamiento duplicado",
        details: "La sala ya tiene registrado este tipo de equipamiento"
      });
    }

    return res.status(500).json({
      message: "Error al agregar equipamiento",
      details: error.message
    });
  }
};

const eliminarEquipamientoController = async (req, res) => {
  const { id, equipamientoId } = req.params;

  try {
    const sala = await eliminarEquipamiento(id, equipamientoId);
    if (!sala) {
      return res.status(404).json({ message: `No se ha encontrado la sala de reunión con id: ${id}` });
    }
    res.status(200).json({ message: "Equipamiento eliminado correctamente", sala });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      const field = error.path === 'id' ? 'sala' : 'equipamiento';
      return res.status(400).json({
        message: `ID de ${field} inválido`,
        details: `El formato del ID no es válido`
      });
    }

    if (error.message && error.message.includes('no encontrado') || error.message.includes('not found')) {
      return res.status(404).json({
        message: "Equipamiento no encontrado",
        details: `No se encontró el equipamiento con id: ${equipamientoId} en esta sala`
      });
    }

    if (error.message && error.message.includes('reservas activas') || error.message.includes('active bookings')) {
      return res.status(400).json({
        message: "Sala con reservas",
        details: "No se puede eliminar equipamiento porque existen reservas que lo requieren"
      });
    }

    res.status(500).json({
      message: "Error al eliminar equipamiento",
      details: error.message
    });
  }
};

const actualizarPreciosController = async (req, res) => {
  const { id } = req.params;
  let precios = {};

  if (req.body.precios && typeof req.body.precios === "object") {
    precios = req.body.precios;
  } else if (Object.keys(req.body).length > 0) {
    precios = req.body;
  } else {
    return res.status(400).json({
      message: "Datos inválidos",
      details: "Se requiere un objeto de precios válido"
    });
  }

  const camposPermitidos = ["porHora", "mediaDia", "diaDompleto"];
  for (const key of Object.keys(precios)) {
    if (!camposPermitidos.includes(key)) {
      return res.status(400).json({
        message: "Campo no permitido",
        details: `El campo '${key}' no es válido para precios`,
        field: key
      });
    }
    const value = precios[key];
    if (typeof value !== "number" || value < 0) {
      return res.status(400).json({
        message: "Precio inválido",
        details: `El precio '${key}' debe ser un número positivo`,
        field: key
      });
    }
  }

  try {
    const sala = await actualizarPrecios(id, precios);
    if (!sala) {
      return res.status(404).json({
        message: "Sala de reunión no encontrada",
        details: `No existe una sala con id: ${id}`
      });
    }

    return res.status(200).json({
      message: "Precios actualizados correctamente",
      sala
    });

  } catch (error) {
    console.error("Error en actualizarPreciosController:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID de sala inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.name === "ValidationError") {
      const detalles = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        message: "Error de validación en datos de precios",
        details: detalles
      });
    }

    if (error.message && /reservas.*pendientes/i.test(error.message)) {
      return res.status(400).json({
        message: "Sala con reservas",
        details: "No se pueden cambiar los precios porque existen reservas pendientes"
      });
    }

    return res.status(500).json({
      message: "Error al actualizar precios",
      details: error.message
    });
  }
};

const getSalasDisponiblesController = async (req, res) => {
  const { fecha, horaInicio, horaFin } = req.query;

  if (!fecha) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requiere una fecha"
    });
  }

  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "La fecha debe tener un formato válido (YYYY-MM-DD o ISO)"
      });
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

    const salas = await getSalasDisponibles(fecha, horaInicio, horaFin);
    res.status(200).json(salas);
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
      message: "Error al obtener salas disponibles",
      details: error.message
    });
  }
};

const filtrarSalasReunionController = async (req, res) => {
  const { error, value } = filtrarSalasReunionSchema.validate(req.query);
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

    if (value.equipamiento && Array.isArray(value.equipamiento)) {
      filtros['equipamiento.tipo'] = { $in: value.equipamiento };
    } else if (value.equipamiento) {
      filtros['equipamiento.tipo'] = value.equipamiento;
    }

    if (value.configuracion) filtros.configuracion = value.configuracion;

    if (value.precioMaximoPorHora) {
      const precio = parseFloat(value.precioMaximoPorHora);
      if (isNaN(precio) || precio < 0) {
        return res.status(400).json({
          message: "Precio inválido",
          details: "El precio máximo por hora debe ser un número positivo",
          field: "precioMaximoPorHora"
        });
      }
      filtros['precios.porHora'] = { $lte: precio };
    }

    if (value.estado) filtros.estado = value.estado;

    const salas = await getSalasReunion(filtros);
    res.status(200).json(salas);
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
      message: "Error al filtrar salas de reunión",
      details: error.message
    });
  }
};

module.exports = {
  getSalasReunionController,
  getSalaReunionByIdController,
  getSalaReunionByCodigoController,
  getSalasByEdificioController,
  getSalasByCapacidadController,
  getSalasByConfiguracionController,
  getSalasByEquipamientoController,
  getSalasByPropietarioController,
  getSalasByRangoPrecioController,
  createSalaReunionController,
  updateSalaReunionController,
  deleteSalaReunionController,
  cambiarEstadoSalaController,
  agregarEquipamientoController,
  eliminarEquipamientoController,
  actualizarPreciosController,
  getSalasDisponiblesController,
  filtrarSalasReunionController
};