const Proveedor = require("../models/proveedor.model");
const ServicioAdicional = require("../models/servicioAdicional.model");

const {
  getProveedores,
  findProveedorById,
  getProveedoresByTipo,
  getProveedoresVerificados,
  getProveedoresByServicio,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  activarProveedor,
  verificarProveedor,
  actualizarCalificacion,
  agregarServicio,
  eliminarServicio,
  actualizarContacto,
  actualizarMetodoPago,
  getProveedoresPorCalificacion,
  getProveedoresConMasServicios
} = require("../repositories/proveedor.repository");
const {
  createProveedorSchema,
  updateProveedorSchema,
  verificarProveedorSchema,
  filtrarProveedoresSchema
} = require("../routes/validations/proveedor.validation");
const { findServicioAdicionalById } = require("../repositories/servicioAdicional.repository");


const getProveedoresController = async (req, res) => {
  try {
    const proveedores = await getProveedores();
    res.status(200).json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los proveedores",
      details: error.message
    });
  }
};

const getProveedorByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const proveedor = await findProveedorById(id);
    if (!proveedor) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${id}` });
    }
    res.status(200).json(proveedor);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar el proveedor",
      details: error.message
    });
  }
};

const getProveedoresByTipoController = async (req, res) => {
  const { tipo } = req.params;
  try {
    const proveedores = await getProveedoresByTipo(tipo);
    res.status(200).json(proveedores);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('tipo')) {
      return res.status(400).json({
        message: "Tipo de proveedor inválido",
        details: `El tipo '${tipo}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al obtener proveedores por tipo",
      details: error.message
    });
  }
};

const getProveedoresVerificadosController = async (req, res) => {
  try {
    const proveedores = await getProveedoresVerificados();
    res.status(200).json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener proveedores verificados",
      details: error.message
    });
  }
};

const createProveedorController = async (req, res) => {
  const { error, value } = createProveedorSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  // Verificar si los servicios ofrecidos existen
  const { serviciosOfrecidos } = value;
  if (serviciosOfrecidos && serviciosOfrecidos.length > 0) {
    try {
      for (const servicioId of serviciosOfrecidos) {
        const servicio = await findServicioAdicionalById(servicioId);
        if (!servicio) {
          return res.status(404).json({
            message: "Servicio no encontrado",
            details: `No se ha encontrado el servicio con id: ${servicioId}`
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        message: "Error al verificar servicios",
        details: error.message
      });
    }
  }

  try {
    const proveedor = await createProveedor(value);
    res.status(201).json({ message: "Proveedor creado correctamente", proveedor });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: "Error de duplicación",
        details: `Ya existe un proveedor con el mismo ${field}`,
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

    if (error.message && error.message.includes('servicios')) {
      return res.status(400).json({
        message: "Error con servicios ofrecidos",
        details: "Uno o más servicios especificados no existen"
      });
    }

    res.status(500).json({
      message: "Error al crear el proveedor",
      details: error.message
    });
  }
};

const updateProveedorController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateProveedorSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const proveedor = await updateProveedor(id, value);
    if (!proveedor) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${id}` });
    }
    res.status(200).json(proveedor);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: "Error de duplicación",
        details: `Ya existe un proveedor con el mismo ${field}`,
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
      message: "Error al actualizar el proveedor",
      details: error.message
    });
  }
};

const deleteProveedorController = async (req, res) => {
  const { id } = req.params;
  try {
    const proveedor = await deleteProveedor(id);
    if (!proveedor) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${id}` });
    }
    res.status(200).json({ message: "Proveedor desactivado correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('servicios activos') || error.message.includes('active services')) {
      return res.status(400).json({
        message: "No se puede desactivar el proveedor",
        details: "El proveedor tiene servicios activos asociados"
      });
    }

    res.status(500).json({
      message: "Error al desactivar el proveedor",
      details: error.message
    });
  }
};

const activarProveedorController = async (req, res) => {
  const { id } = req.params;
  try {
    const proveedor = await activarProveedor(id);
    if (!proveedor) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${id}` });
    }
    res.status(200).json({ message: "Proveedor activado correctamente", proveedor });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al activar el proveedor",
      details: error.message
    });
  }
};

const verificarProveedorController = async (req, res) => {
  const { error, value } = verificarProveedorSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { proveedorId, documentosVerificacion, notas } = value;

  try {
    const proveedorExiste = await findProveedorById(proveedorId);
    if (!proveedorExiste) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${proveedorId}` });
    }

    if (proveedorExiste.verificado) {
      return res.status(400).json({
        message: "Proveedor ya verificado",
        details: "El proveedor ya ha sido verificado anteriormente"
      });
    }

    const proveedor = await verificarProveedor(proveedorId);

    res.status(200).json({
      message: "Proveedor verificado correctamente",
      proveedor,
      documentosVerificacion,
      notas
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        details: `El formato del ID '${proveedorId}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al verificar el proveedor",
      details: error.message
    });
  }
};

const actualizarCalificacionController = async (req, res) => {
  const { id } = req.params;
  const { calificacion } = req.body;

  if (isNaN(calificacion) || calificacion < 0 || calificacion > 5) {
    return res.status(400).json({
      message: "Calificación inválida",
      details: "Se requiere una calificación válida entre 0 y 5"
    });
  }

  try {
    const proveedor = await actualizarCalificacion(id, calificacion);
    if (!proveedor) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${id}` });
    }
    res.status(200).json({ message: "Calificación actualizada correctamente", proveedor });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al actualizar la calificación",
      details: error.message
    });
  }
};

const agregarServicioController = async (req, res) => {
  const { id } = req.params;
  const { servicioId } = req.body;

  if (!servicioId) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requiere un ID de servicio"
    });
  }

  try {
    const proveedor = await agregarServicio(id, servicioId);
    if (!proveedor) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${id}` });
    }
    res.status(200).json({ message: "Servicio agregado correctamente", proveedor });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      const errorField = error.path === 'servicioId' ? 'servicio' : 'proveedor';
      return res.status(400).json({
        message: `ID de ${errorField} inválido`,
        details: `El formato del ID no es válido`
      });
    }

    if (error.message && error.message.includes('servicio no encontrado') || error.message.includes('service not found')) {
      return res.status(404).json({
        message: "Servicio no encontrado",
        details: `No se encontró el servicio con id: ${servicioId}`
      });
    }

    if (error.message && error.message.includes('ya existe') || error.message.includes('already exists')) {
      return res.status(400).json({
        message: "Servicio ya agregado",
        details: "El proveedor ya tiene este servicio asociado"
      });
    }

    res.status(500).json({
      message: "Error al agregar el servicio",
      details: error.message
    });
  }
};

const eliminarServicioController = async (req, res) => {
  const { id, servicioId } = req.params;

  try {
    const proveedor = await eliminarServicio(id, servicioId);
    if (!proveedor) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${id}` });
    }
    res.status(200).json({ message: "Servicio eliminado correctamente", proveedor });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      const errorField = error.path === 'servicioId' ? 'servicio' : 'proveedor';
      return res.status(400).json({
        message: `ID de ${errorField} inválido`,
        details: `El formato del ID no es válido`
      });
    }

    if (error.message && error.message.includes('no asociado') || error.message.includes('not associated')) {
      return res.status(404).json({
        message: "Servicio no asociado",
        details: `El proveedor no tiene asociado el servicio con id: ${servicioId}`
      });
    }

    if (error.message && error.message.includes('reservas activas') || error.message.includes('active bookings')) {
      return res.status(400).json({
        message: "No se puede eliminar el servicio",
        details: "Existen reservas activas para este servicio"
      });
    }

    res.status(500).json({
      message: "Error al eliminar el servicio",
      details: error.message
    });
  }
};

const actualizarContactoController = async (req, res) => {
  const { id } = req.params;
  const { contacto } = req.body;

  if (!contacto || !contacto.nombreContacto || !contacto.email || !contacto.telefono) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren todos los datos de contacto (nombreContacto, email y telefono)"
    });
  }

  try {
    const proveedor = await actualizarContacto(id, contacto);
    if (!proveedor) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${id}` });
    }
    res.status(200).json({ message: "Información de contacto actualizada correctamente", proveedor });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en los datos de contacto",
        details: errors
      });
    }

    if (error.message && error.message.includes('email')) {
      return res.status(400).json({
        message: "Email inválido",
        details: "El formato del email no es válido"
      });
    }

    res.status(500).json({
      message: "Error al actualizar la información de contacto",
      details: error.message
    });
  }
};

const actualizarMetodoPagoController = async (req, res) => {
  const { id } = req.params;
  const { metodoPago } = req.body;

  if (!metodoPago) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requieren los datos del método de pago"
    });
  }

  try {
    const proveedor = await actualizarMetodoPago(id, metodoPago);
    if (!proveedor) {
      return res.status(404).json({ message: `No se ha encontrado el proveedor con id: ${id}` });
    }
    res.status(200).json({ message: "Método de pago actualizado correctamente", proveedor });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en método de pago",
        details: errors
      });
    }

    res.status(500).json({
      message: "Error al actualizar el método de pago",
      details: error.message
    });
  }
};

const getProveedoresPorCalificacionController = async (req, res) => {
  const { calificacionMinima } = req.query;

  try {
    const calificacion = calificacionMinima ? parseFloat(calificacionMinima) : 4;

    if (isNaN(calificacion) || calificacion < 0 || calificacion > 5) {
      return res.status(400).json({
        message: "Calificación inválida",
        details: "La calificación debe ser un número entre 0 y 5"
      });
    }

    const proveedores = await getProveedoresPorCalificacion(calificacion);
    res.status(200).json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener proveedores por calificación",
      details: error.message
    });
  }
};

const getProveedoresConMasServiciosController = async (req, res) => {
  const { limite } = req.query;

  try {
    const limit = limite ? parseInt(limite) : 5;

    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({
        message: "Límite inválido",
        details: "El límite debe ser un número entero positivo"
      });
    }

    const proveedores = await getProveedoresConMasServicios(limit);
    res.status(200).json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener proveedores con más servicios",
      details: error.message
    });
  }
};

const filtrarProveedoresController = async (req, res) => {
  const { error, value } = filtrarProveedoresSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los parámetros de filtrado",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const filtros = {};
    if (value.tipo) filtros.tipo = value.tipo;
    if (value.verificado !== undefined) filtros.verificado = value.verificado;
    if (value.activo !== undefined) filtros.activo = value.activo;

    if (value.servicioOfrecido) {
      const servicio = await ServicioAdicional.findById(value.servicioOfrecido);
      if (!servicio) {
        return res.status(404).json({
          message: "Servicio no encontrado",
          details: `No se encontró el servicio con id: ${value.servicioOfrecido}`
        });
      }
      filtros.serviciosOfrecidos = { $in: [servicio._id] };
    }

    const proveedores = await Proveedor.find(filtros).populate('serviciosOfrecidos');
    return res.status(200).json(proveedores);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error al filtrar proveedores",
      details: err.message
    });
  }
};

module.exports = {
  getProveedoresController,
  getProveedorByIdController,
  getProveedoresByTipoController,
  getProveedoresVerificadosController,
  createProveedorController,
  updateProveedorController,
  deleteProveedorController,
  activarProveedorController,
  verificarProveedorController,
  actualizarCalificacionController,
  agregarServicioController,
  eliminarServicioController,
  actualizarContactoController,
  actualizarMetodoPagoController,
  getProveedoresPorCalificacionController,
  getProveedoresConMasServiciosController,
  filtrarProveedoresController
};
