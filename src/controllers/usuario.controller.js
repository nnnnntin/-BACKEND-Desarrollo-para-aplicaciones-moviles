const {
  getUsuarios,
  findUsuarioById,
  registerUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuariosByTipo,
  cambiarRolUsuario,
  updateMembresiaUsuario
} = require("../repositories/usuario.repository");
const {
  createUsuarioSchema,
  updateUsuarioSchema,
  cambiarRolSchema
} = require("../routes/validations/usuario.validation");

const getUsuariosController = async (req, res) => {
  try {
    const usuarios = await getUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los usuarios",
      details: error.message
    });
  }
};

const getUsuarioByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await findUsuarioById(id);
    if (!usuario) {
      return res.status(404).json({ message: `No se ha encontrado el usuario con id: ${id}` });
    }
    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar el usuario",
      details: error.message
    });
  }
};

const getUsuariosByTipoController = async (req, res) => {
  const { tipo } = req.params;

  if (!["individual", "freelancer", "empresa", "administrador", "inmobiliaria"].includes(tipo)) {
    return res.status(400).json({
      message: "Tipo de usuario inválido",
      details: "El tipo de usuario debe ser 'individual', 'freelancer', 'empresa', 'administrador' o 'inmobiliaria'"
    });
  }

  try {
    const usuarios = await getUsuariosByTipo(tipo);
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener usuarios por tipo",
      details: error.message
    });
  }
};

const registerUsuarioController = async (req, res) => {
  const { error, value } = createUsuarioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const usuario = await registerUsuario(value);

    const usuarioResponse = {
      _id: usuario._id,
      username: usuario.username,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      activo: usuario.activo,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    };

    res.status(201).json({ message: "Usuario registrado correctamente", usuario: usuarioResponse });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'username' ? 'nombre de usuario' : 'correo electrónico';
      return res.status(400).json({
        message: "Error de duplicación",
        details: `El ${fieldName} ya está registrado`,
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

    if (error.message && error.message.includes('contraseña')) {
      return res.status(400).json({
        message: "Error en la contraseña",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al registrar el usuario",
      details: error.message
    });
  }
};

const updateUsuarioController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateUsuarioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const usuario = await updateUsuario(id, value);
    if (!usuario) {
      return res.status(404).json({ message: `No se ha encontrado el usuario con id: ${id}` });
    }

    const usuarioResponse = {
      _id: usuario._id,
      username: usuario.username,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      activo: usuario.activo,
      updatedAt: usuario.updatedAt
    };

    res.status(200).json(usuarioResponse);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'username' ? 'nombre de usuario' : 'correo electrónico';
      return res.status(400).json({
        message: "Error de duplicación",
        details: `El ${fieldName} ya está registrado`,
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

    if (error.message && error.message.includes('contraseña')) {
      return res.status(400).json({
        message: "Error en la contraseña",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al actualizar el usuario",
      details: error.message
    });
  }
};

const deleteUsuarioController = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await deleteUsuario(id);
    if (!usuario) {
      return res.status(404).json({ message: `No se ha encontrado el usuario con id: ${id}` });
    }
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && (error.message.includes('reservas activas') || error.message.includes('active bookings'))) {
      return res.status(400).json({
        message: "No se puede eliminar el usuario",
        details: "El usuario tiene reservas activas"
      });
    }

    if (error.message && (error.message.includes('pagos pendientes') || error.message.includes('pending payments'))) {
      return res.status(400).json({
        message: "No se puede eliminar el usuario",
        details: "El usuario tiene pagos pendientes"
      });
    }

    if (error.message && (error.message.includes('membresía activa') || error.message.includes('active membership'))) {
      return res.status(400).json({
        message: "No se puede eliminar el usuario",
        details: "El usuario tiene una membresía activa"
      });
    }

    res.status(500).json({
      message: "Error al eliminar el usuario",
      details: error.message
    });
  }
};

const cambiarRolUsuarioController = async (req, res) => {
  const { error, value } = cambiarRolSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { usuarioId, nuevoRol } = value;

  if (!['cliente', 'administrador', 'proveedor', 'empleado'].includes(nuevoRol)) {
    return res.status(400).json({
      message: "Rol inválido",
      details: "El rol debe ser 'cliente', 'administrador', 'proveedor' o 'empleado'"
    });
  }

  try {
    const usuario = await cambiarRolUsuario(usuarioId, nuevoRol);
    if (!usuario) {
      return res.status(404).json({ message: `No se ha encontrado el usuario con id: ${usuarioId}` });
    }

    const usuarioResponse = {
      _id: usuario._id,
      username: usuario.username,
      tipoUsuario: usuario.tipoUsuario,
      updatedAt: usuario.updatedAt
    };

    res.status(200).json({ message: "Rol actualizado correctamente", usuario: usuarioResponse });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }

    if (error.message && error.message.includes('no permitido') || error.message.includes('not allowed')) {
      return res.status(403).json({
        message: "Cambio de rol no permitido",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al cambiar el rol del usuario",
      details: error.message
    });
  }
};

const updateMembresiaUsuarioController = async (req, res) => {
  const { id } = req.params;
  const { membresia } = req.body;

  if (!membresia) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requiere información de la membresía"
    });
  }

  if (!membresia.tipoMembresiaId) {
    return res.status(400).json({
      message: "ID de membresía requerido",
      details: "Se requiere el ID de la membresía (tipoMembresiaId)"
    });
  }

  try {
    const membresiaData = {
      tipoMembresiaId: membresia.tipoMembresiaId,
      fechaInicio: new Date(membresia.fechaInicio),
      fechaVencimiento: new Date(membresia.fechaVencimiento),
      renovacionAutomatica: Boolean(membresia.renovacionAutomatica)
    };

    const usuario = await updateMembresiaUsuario(id, membresiaData);
    if (!usuario) {
      return res.status(404).json({ message: `No se ha encontrado el usuario con id: ${id}` });
    }

    const usuarioResponse = {
      _id: usuario._id,
      username: usuario.username,
      membresia: usuario.membresia,
      updatedAt: usuario.updatedAt
    };

    res.status(200).json({ message: "Membresía actualizada correctamente", usuario: usuarioResponse });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: `El formato del ID no es válido`
      });
    }
    res.status(500).json({
      message: "Error al actualizar la membresía del usuario",
      details: error.message
    });
  }
};


module.exports = {
  getUsuariosController,
  getUsuarioByIdController,
  getUsuariosByTipoController,
  registerUsuarioController,
  updateUsuarioController,
  deleteUsuarioController,
  cambiarRolUsuarioController,
  updateMembresiaUsuarioController
};