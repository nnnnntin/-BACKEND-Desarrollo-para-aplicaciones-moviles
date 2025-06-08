const {
  getServiciosAdicionales,
  findServicioAdicionalById,
  getServiciosByTipo,
  getServiciosByProveedor,
  getServiciosByEspacio,
  getServiciosByRangoPrecio,
  getServiciosByUnidadPrecio,
  getServiciosDisponiblesEnFecha,
  createServicioAdicional,
  updateServicioAdicional,
  deleteServicioAdicional,
  activarServicioAdicional,
  asignarEspacio,
  eliminarEspacio,
  getServiciosConAprobacion
} = require("../repositories/servicioAdicional.repository");
const {
  createServicioAdicionalSchema,
  updateServicioAdicionalSchema,
  filtrarServiciosAdicionalesSchema
} = require("../routes/validations/servicioAdicional.validation");

const Usuario = require("../models/usuario.model");
const Espacio = require("../models/espacio.model");

const getServiciosAdicionalesController = async (req, res) => {
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
    const servicios = await getServiciosAdicionales(filtros, skipNum, limitNum);
    return res.status(200).json(servicios);
  } catch (error) {
    console.error("[Controller] Error al obtener servicios adicionales", error);
    return res.status(500).json({
      message: "Error al obtener los servicios adicionales",
      details: error.message
    });
  }
};

const getServicioAdicionalByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const servicio = await findServicioAdicionalById(id);
    if (!servicio) {
      return res.status(404).json({ message: `No se ha encontrado el servicio adicional con id: ${id}` });
    }
    res.status(200).json(servicio);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de servicio inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar el servicio adicional",
      details: error.message
    });
  }
};

const getServiciosByTipoController = async (req, res) => {
  const { tipo } = req.params;
  try {
    const servicios = await getServiciosByTipo(tipo);
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('tipo')) {
      return res.status(400).json({
        message: "Tipo de servicio inválido",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener servicios por tipo",
      details: error.message
    });
  }
};

const getServiciosByProveedorController = async (req, res) => {
  const { proveedorId } = req.params;
  try {
    const servicios = await getServiciosByProveedor(proveedorId);
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        details: `El formato del ID '${proveedorId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Proveedor no encontrado",
        details: `No existe un proveedor con id: ${proveedorId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener servicios por proveedor",
      details: error.message
    });
  }
};

const getServiciosByEspacioController = async (req, res) => {
  const { espacioId } = req.params;
  try {
    const servicios = await getServiciosByEspacio(espacioId);
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de espacio inválido",
        details: `El formato del ID '${espacioId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Espacio no encontrado",
        details: `No existe un espacio con id: ${espacioId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener servicios por espacio",
      details: error.message
    });
  }
};

const getServiciosByRangoPrecioController = async (req, res) => {
  const { precioMin, precioMax } = req.query;

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

  try {
    const servicios = await getServiciosByRangoPrecio(min, max);
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener servicios por rango de precio",
      details: error.message
    });
  }
};

const getServiciosByUnidadPrecioController = async (req, res) => {
  const { unidadPrecio } = req.params;

  if (!['por_uso', 'por_hora', 'por_persona', 'por_dia'].includes(unidadPrecio)) {
    return res.status(400).json({
      message: "Unidad de precio no válida",
      details: "La unidad de precio debe ser 'por_uso', 'por_hora', 'por_persona' o 'por_dia'"
    });
  }

  try {
    const servicios = await getServiciosByUnidadPrecio(unidadPrecio);
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener servicios por unidad de precio",
      details: error.message
    });
  }
};

const getServiciosDisponiblesEnFechaController = async (req, res) => {
  const { fecha } = req.query;

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

    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaSemana = dias[fechaObj.getDay()];

    const servicios = await getServiciosDisponiblesEnFecha(fecha, diaSemana);
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);

    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({
        message: "Error en la fecha",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener servicios disponibles en fecha",
      details: error.message
    });
  }
};

const createServicioAdicionalController = async (req, res) => {
  const { error, value } = createServicioAdicionalSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        if (value.proveedorId) {
      const proveedorExiste = await Usuario.findById(value.proveedorId);
      if (!proveedorExiste) {
        return res.status(404).json({
          message: "Proveedor no encontrado",
          details: `No existe un usuario con id: ${value.proveedorId}`,
          field: "proveedorId"
        });
      }

            if (!proveedorExiste.activo) {
        return res.status(400).json({
          message: "Proveedor inactivo",
          details: "El proveedor especificado no está activo",
          field: "proveedorId"
        });
      }
    }

        if (value.espaciosDisponibles && Array.isArray(value.espaciosDisponibles)) {
      for (const espacioId of value.espaciosDisponibles) {
        const espacioExiste = await Espacio.findById(espacioId);
        if (!espacioExiste) {
          return res.status(404).json({
            message: "Espacio no encontrado",
            details: `No existe un espacio con id: ${espacioId}`,
            field: "espaciosDisponibles"
          });
        }

                if (!espacioExiste.activo) {
          return res.status(400).json({
            message: "Espacio inactivo",
            details: `El espacio con id ${espacioId} no está activo`,
            field: "espaciosDisponibles"
          });
        }
      }
    }

    const servicio = await createServicioAdicional(value);
    res.status(201).json({ message: "Servicio adicional creado correctamente", servicio });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: `El formato del ID no es válido`
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
        details: `Ya existe un servicio con el mismo ${field}`,
        field
      });
    }

    res.status(500).json({
      message: "Error al crear el servicio adicional",
      details: error.message
    });
  }
};

const updateServicioAdicionalController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateServicioAdicionalSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        if (value.proveedorId) {
      const proveedorExiste = await Usuario.findById(value.proveedorId);
      if (!proveedorExiste) {
        return res.status(404).json({
          message: "Proveedor no encontrado",
          details: `No existe un usuario con id: ${value.proveedorId}`,
          field: "proveedorId"
        });
      }

            if (!proveedorExiste.activo) {
        return res.status(400).json({
          message: "Proveedor inactivo",
          details: "El proveedor especificado no está activo",
          field: "proveedorId"
        });
      }
    }

        if (value.espaciosDisponibles && Array.isArray(value.espaciosDisponibles)) {
      for (const espacioId of value.espaciosDisponibles) {
        const espacioExiste = await Espacio.findById(espacioId);
        if (!espacioExiste) {
          return res.status(404).json({
            message: "Espacio no encontrado",
            details: `No existe un espacio con id: ${espacioId}`,
            field: "espaciosDisponibles"
          });
        }

                if (!espacioExiste.activo) {
          return res.status(400).json({
            message: "Espacio inactivo",
            details: `El espacio con id ${espacioId} no está activo`,
            field: "espaciosDisponibles"
          });
        }
      }
    }

    const servicio = await updateServicioAdicional(id, value);
    if (!servicio) {
      return res.status(404).json({ message: `No se ha encontrado el servicio adicional con id: ${id}` });
    }
    res.status(200).json(servicio);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: `El formato del ID no es válido`
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
        details: `Ya existe un servicio con el mismo ${field}`,
        field
      });
    }

    if (error.message && error.message.includes('no modificable') || error.message.includes('cannot be modified')) {
      return res.status(400).json({
        message: "Servicio no modificable",
        details: "No se puede modificar el servicio en su estado actual"
      });
    }

    res.status(500).json({
      message: "Error al actualizar el servicio adicional",
      details: error.message
    });
  }
};

const deleteServicioAdicionalController = async (req, res) => {
  const { id } = req.params;
  try {
    const servicio = await deleteServicioAdicional(id);
    if (!servicio) {
      return res.status(404).json({ message: `No se ha encontrado el servicio adicional con id: ${id}` });
    }
    res.status(200).json({ message: "Servicio adicional desactivado correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de servicio inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('reservas activas') || error.message.includes('active bookings')) {
      return res.status(400).json({
        message: "Servicio con reservas",
        details: "No se puede desactivar un servicio con reservas activas"
      });
    }

    res.status(500).json({
      message: "Error al desactivar el servicio adicional",
      details: error.message
    });
  }
};

const activarServicioAdicionalController = async (req, res) => {
  const { id } = req.params;
  try {
    const servicio = await activarServicioAdicional(id);
    if (!servicio) {
      return res.status(404).json({ message: `No se ha encontrado el servicio adicional con id: ${id}` });
    }
    res.status(200).json({ message: "Servicio adicional activado correctamente", servicio });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de servicio inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('proveedor inactivo') || error.message.includes('inactive provider')) {
      return res.status(400).json({
        message: "Proveedor inactivo",
        details: "No se puede activar un servicio cuyo proveedor está inactivo"
      });
    }

    res.status(500).json({
      message: "Error al activar el servicio adicional",
      details: error.message
    });
  }
};

const asignarEspacioController = async (req, res) => {
  const { id } = req.params;
  const { espacioId } = req.body;

  if (!espacioId) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requiere un ID de espacio",
      field: "espacioId"
    });
  }

  try {
        const espacioExiste = await Espacio.findById(espacioId);
    if (!espacioExiste) {
      return res.status(404).json({
        message: "Espacio no encontrado",
        details: `No existe un espacio con id: ${espacioId}`,
        field: "espacioId"
      });
    }

        if (!espacioExiste.activo) {
      return res.status(400).json({
        message: "Espacio inactivo",
        details: "El espacio especificado no está activo",
        field: "espacioId"
      });
    }

    const servicio = await asignarEspacio(id, espacioId);
    if (!servicio) {
      return res.status(404).json({ message: `No se ha encontrado el servicio adicional con id: ${id}` });
    }
    res.status(200).json({ message: "Espacio asignado correctamente", servicio });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: `El formato del ID no es válido`
      });
    }

    if (error.message && error.message.includes('ya asignado') || error.message.includes('already assigned')) {
      return res.status(400).json({
        message: "Espacio ya asignado",
        details: "El espacio ya está asignado a este servicio"
      });
    }

    res.status(500).json({
      message: "Error al asignar espacio",
      details: error.message
    });
  }
};

const eliminarEspacioController = async (req, res) => {
  const { id, espacioId } = req.params;

  try {
    const servicio = await eliminarEspacio(id, espacioId);
    if (!servicio) {
      return res.status(404).json({ message: `No se ha encontrado el servicio adicional con id: ${id}` });
    }
    res.status(200).json({ message: "Espacio eliminado correctamente", servicio });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      const field = error.path === 'id' ? 'servicio' : 'espacio';
      return res.status(400).json({
        message: `ID de ${field} inválido`,
        details: `El formato del ID no es válido`
      });
    }

    if (error.message && error.message.includes('no asignado') || error.message.includes('not assigned')) {
      return res.status(404).json({
        message: "Espacio no asignado",
        details: `El servicio no tiene asignado el espacio con id: ${espacioId}`
      });
    }

    if (error.message && error.message.includes('reservas activas') || error.message.includes('active bookings')) {
      return res.status(400).json({
        message: "Reservas activas",
        details: "No se puede eliminar un espacio que tiene reservas activas"
      });
    }

    res.status(500).json({
      message: "Error al eliminar espacio",
      details: error.message
    });
  }
};

const getServiciosConAprobacionController = async (req, res) => {
  try {
    const servicios = await getServiciosConAprobacion();
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener servicios con aprobación",
      details: error.message
    });
  }
};

const filtrarServiciosAdicionalesController = async (req, res) => {
  const { error, value } = filtrarServiciosAdicionalesSchema.validate(req.query);
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
    if (value.precioMaximo) filtros.precio = { $lte: value.precioMaximo };
    if (value.unidadPrecio) filtros.unidadPrecio = value.unidadPrecio;
    if (value.diaDisponible) filtros['disponibilidad.diasDisponibles'] = value.diaDisponible;
    if (value.proveedorId) filtros.proveedorId = value.proveedorId;
    if (value.espacioId) filtros.espaciosDisponibles = value.espacioId;
    if (value.requiereAprobacion !== undefined) filtros.requiereAprobacion = value.requiereAprobacion;

    const servicios = await getServiciosAdicionales(filtros);
    res.status(200).json(servicios);
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
      message: "Error al filtrar servicios adicionales",
      details: error.message
    });
  }
};

module.exports = {
  getServiciosAdicionalesController,
  getServicioAdicionalByIdController,
  getServiciosByTipoController,
  getServiciosByProveedorController,
  getServiciosByEspacioController,
  getServiciosByRangoPrecioController,
  getServiciosByUnidadPrecioController,
  getServiciosDisponiblesEnFechaController,
  createServicioAdicionalController,
  updateServicioAdicionalController,
  deleteServicioAdicionalController,
  activarServicioAdicionalController,
  asignarEspacioController,
  eliminarEspacioController,
  getServiciosConAprobacionController,
  filtrarServiciosAdicionalesController
};