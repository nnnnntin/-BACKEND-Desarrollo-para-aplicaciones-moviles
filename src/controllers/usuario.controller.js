const {
  getUsuarios,
  findUsuarioById,
  registerUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuariosByTipo,
  cambiarRolUsuario,
  updateMembresiaUsuario,
  addMetodoPago,
  updateMetodoPago,
  deleteMetodoPago,
  setDefaultMetodoPago,
  getMetodosPagoSeguros
} = require("../repositories/usuario.repository");

const { findMembresiaById } = require("../repositories/membresia.repository");
const { findEmpresaByUsuarioId } = require("../repositories/empresaInmobiliaria.repository");
const { findProveedorByUsuarioId } = require("../repositories/proveedor.repository");

const {
  createUsuarioSchema,
  updateUsuarioSchema,
  cambiarRolSchema,
  addMetodoPagoSchema,
  updateMetodoPagoSchema,
  deleteMetodoPagoSchema
} = require("../routes/validations/usuario.validation");

const getUsuariosController = async (req, res) => {
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
    const usuarios = await getUsuarios(filtros, skipNum, limitNum);
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("[Controller] Error al obtener usuarios", error);
    return res.status(500).json({
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
    
    const usuarioSeguro = {
      ...usuario,
      metodoPago: getMetodosPagoSeguros(usuario.metodoPago)
    };
    
    res.status(200).json(usuarioSeguro);
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

  if (!["usuario", "proveedor", "cliente", "administrador"].includes(tipo)) {
    return res.status(400).json({
      message: "Tipo de usuario inválido",
      details: "El tipo de usuario debe ser 'usuario', 'proveedor', 'cliente' o 'administrador'"
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
      imagen: usuario.imagen,
      datosPersonales: usuario.datosPersonales,
      direccion: usuario.direccion,
      datosEmpresa: usuario.datosEmpresa,
      preferencias: usuario.preferencias,
      membresia: usuario.membresia,
      metodoPago: getMetodosPagoSeguros(usuario.metodoPago),
      activo: usuario.activo,
      verificado: usuario.verificado,
      rol: usuario.rol,
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
    if (value.membresia && value.membresia.tipoMembresiaId) {
      const membresia = await findMembresiaById(value.membresia.tipoMembresiaId);
      if (!membresia) {
        return res.status(404).json({
          message: "Membresía no encontrada",
          details: `No se ha encontrado la membresía con id: ${value.membresia.tipoMembresiaId}`,
          field: "membresia.tipoMembresiaId"
        });
      }

      if (!membresia.activo) {
        return res.status(400).json({
          message: "Membresía inactiva",
          details: "No se puede asignar una membresía que no está activa",
          field: "membresia.tipoMembresiaId"
        });
      }
    }

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
      imagen: usuario.imagen,
      datosPersonales: usuario.datosPersonales,
      direccion: usuario.direccion,
      datosEmpresa: usuario.datosEmpresa,
      preferencias: usuario.preferencias,
      membresia: usuario.membresia,
      metodoPago: getMetodosPagoSeguros(usuario.metodoPago),
      activo: usuario.activo,
      verificado: usuario.verificado,
      rol: usuario.rol,
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
      rol: usuario.rol,
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
    const membresiaExistente = await findMembresiaById(membresia.tipoMembresiaId);
    if (!membresiaExistente) {
      return res.status(404).json({
        message: "Membresía no encontrada",
        details: `No se ha encontrado la membresía con id: ${membresia.tipoMembresiaId}`,
        field: "tipoMembresiaId"
      });
    }

    if (!membresiaExistente.activo) {
      return res.status(400).json({
        message: "Membresía inactiva",
        details: "No se puede asignar una membresía que no está activa",
        field: "tipoMembresiaId"
      });
    }

    const membresiaData = {
      tipoMembresiaId: membresia.tipoMembresiaId,
      fechaInicio: new Date(membresia.fechaInicio),
      fechaVencimiento: new Date(membresia.fechaVencimiento),
      renovacionAutomatica: Boolean(membresia.renovacionAutomatica)
    };

    const usuario = await updateMembresiaUsuario(id, membresiaData);
    if (!usuario) {
      return res.status(404).json({ 
        message: "Usuario no encontrado", 
        details: `No se ha encontrado el usuario con id: ${id}` 
      });
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
      const field = error.path === 'tipoMembresiaId' ? 'membresía' : 'usuario';
      return res.status(400).json({
        message: `ID de ${field} inválido`,
        details: `El formato del ID no es válido`
      });
    }

    if (error.message && error.message.includes('fecha')) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "Las fechas deben tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

    res.status(500).json({
      message: "Error al actualizar la membresía del usuario",
      details: error.message
    });
  }
};

const getPerfilCompletoUsuarioController = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await findUsuarioById(id);
    if (!usuario) {
      return res.status(404).json({ 
        message: `No se ha encontrado el usuario con id: ${id}` 
      });
    }

    const perfil = {
      usuario: {
        _id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        imagen: usuario.imagen,
        datosPersonales: usuario.datosPersonales,
        direccion: usuario.direccion,
        datosEmpresa: usuario.datosEmpresa,
        preferencias: usuario.preferencias,
        metodoPago: getMetodosPagoSeguros(usuario.metodoPago),
        activo: usuario.activo,
        verificado: usuario.verificado,
        rol: usuario.rol,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
      }
    };

    if (usuario.tipoUsuario === 'cliente') {
      const empresa = await findEmpresaByUsuarioId(id);
      perfil.empresaInmobiliaria = empresa;
    } else if (usuario.tipoUsuario === 'proveedor') {
      const proveedor = await findProveedorByUsuarioId(id);
      perfil.proveedor = proveedor;
    }

    res.status(200).json(perfil);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al obtener el perfil completo del usuario",
      details: error.message
    });
  }
};

const addMetodoPagoController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = addMetodoPagoSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    console.log('🔵 [Controller] Agregando método de pago para usuario:', id);
    console.log('🔵 [Controller] Datos recibidos:', {
      tipo: value.tipo,
      predeterminado: value.predeterminado
    });

    const usuario = await addMetodoPago(id, value);
    
    const usuarioResponse = {
      _id: usuario._id,
      username: usuario.username,
      metodoPago: getMetodosPagoSeguros(usuario.metodoPago),
      updatedAt: usuario.updatedAt
    };
    
    res.status(201).json({
      message: "Método de pago agregado correctamente",
      usuario: usuarioResponse
    });
  } catch (error) {
    console.error('🔴 [Controller] Error agregando método de pago:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${id}`
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
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

    res.status(500).json({
      message: "Error al agregar el método de pago",
      details: error.message
    });
  }
};

const updateMetodoPagoController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateMetodoPagoSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const { metodoPagoId, ...updateData } = value;
    
    const usuario = await updateMetodoPago(id, metodoPagoId, updateData);
    
    const usuarioResponse = {
      _id: usuario._id,
      username: usuario.username,
      metodoPago: getMetodosPagoSeguros(usuario.metodoPago),
      updatedAt: usuario.updatedAt
    };
    
    res.status(200).json({
      message: "Método de pago actualizado correctamente",
      usuario: usuarioResponse
    });
  } catch (error) {
    console.error('🔴 [Controller] Error actualizando método de pago:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${id}`
      });
    }

    if (error.message === 'Método de pago no encontrado') {
      return res.status(404).json({
        message: "Método de pago no encontrado",
        details: "El método de pago especificado no existe"
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: "El formato del ID no es válido"
      });
    }

    res.status(500).json({
      message: "Error al actualizar el método de pago",
      details: error.message
    });
  }
};

const deleteMetodoPagoController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = deleteMetodoPagoSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const { metodoPagoId } = value;
    
    const usuario = await deleteMetodoPago(id, metodoPagoId);
    
    const usuarioResponse = {
      _id: usuario._id,
      username: usuario.username,
      metodoPago: getMetodosPagoSeguros(usuario.metodoPago),
      updatedAt: usuario.updatedAt
    };
    
    res.status(200).json({
      message: "Método de pago eliminado correctamente",
      usuario: usuarioResponse
    });
  } catch (error) {
    console.error('🔴 [Controller] Error eliminando método de pago:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${id}`
      });
    }

    if (error.message === 'Método de pago no encontrado') {
      return res.status(404).json({
        message: "Método de pago no encontrado",
        details: "El método de pago especificado no existe"
      });
    }

    if (error.message.includes('único método de pago activo')) {
      return res.status(400).json({
        message: "No se puede eliminar",
        details: "No se puede eliminar el único método de pago activo"
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: "El formato del ID no es válido"
      });
    }

    res.status(500).json({
      message: "Error al eliminar el método de pago",
      details: error.message
    });
  }
};

const setDefaultMetodoPagoController = async (req, res) => {
  const { id } = req.params;
  const { metodoPagoId } = req.body;
  
  if (!metodoPagoId) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requiere el ID del método de pago (metodoPagoId)"
    });
  }

  try {
    const usuario = await setDefaultMetodoPago(id, metodoPagoId);
    
    const usuarioResponse = {
      _id: usuario._id,
      username: usuario.username,
      metodoPago: getMetodosPagoSeguros(usuario.metodoPago),
      updatedAt: usuario.updatedAt
    };
    
    res.status(200).json({
      message: "Método de pago establecido como predeterminado",
      usuario: usuarioResponse
    });
  } catch (error) {
    console.error('🔴 [Controller] Error estableciendo método predeterminado:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${id}`
      });
    }

    if (error.message === 'Método de pago no encontrado') {
      return res.status(404).json({
        message: "Método de pago no encontrado",
        details: "El método de pago especificado no existe"
      });
    }

    if (error.message.includes('método de pago inactivo')) {
      return res.status(400).json({
        message: "Método de pago inactivo",
        details: "No se puede establecer como predeterminado un método de pago inactivo"
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: "El formato del ID no es válido"
      });
    }

    res.status(500).json({
      message: "Error al establecer el método de pago como predeterminado",
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
  updateMembresiaUsuarioController,
  getPerfilCompletoUsuarioController,
  addMetodoPagoController,
  updateMetodoPagoController,
  deleteMetodoPagoController,
  setDefaultMetodoPagoController
};