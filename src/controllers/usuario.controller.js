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

const { findMembresiaById } = require("../repositories/membresia.repository");

const {
  createUsuarioSchema,
  updateUsuarioSchema,
  cambiarRolSchema,
  agregarMetodoPagoSchema,
  actualizarMetodoPredeterminadoSchema,
  eliminarMetodoPagoSchema,
  validarUsuarioTieneMetodoPago,
  validarMetodoPredeterminado
} = require("../routes/validations/usuario.validation");

// ========== CONTROLADORES EXISTENTES ==========

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
      metodoPago: usuario.metodoPago,
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
      metodoPago: usuario.metodoPago,
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

// ========== NUEVOS CONTROLADORES PARA MÉTODOS DE PAGO ==========

const agregarMetodoPagoController = async (req, res) => {
  const { id: usuarioId } = req.params;
  const { error, value } = agregarMetodoPagoSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    console.log('🏦 Agregando método de pago:', {
      usuarioId,
      metodoPago: value
    });

    // Obtener usuario actual
    const usuario = await findUsuarioById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${usuarioId}`
      });
    }

    // Verificar duplicados
    const metodoExistente = usuario.metodoPago?.find(mp => 
      mp.tipo === value.tipo && mp.ultimosDigitos === value.ultimosDigitos
    );

    if (metodoExistente) {
      return res.status(400).json({
        message: "Método de pago duplicado",
        details: `Ya existe un ${value.tipo} con los últimos dígitos ${value.ultimosDigitos}`
      });
    }

    // Preparar nuevo método de pago
    const nuevoMetodo = {
      ...value,
      id: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activo: true,
      fechaCreacion: new Date()
    };

    // Si es el primer método o se marca como predeterminado
    const metodosPagoActuales = usuario.metodoPago || [];
    if (nuevoMetodo.predeterminado || metodosPagoActuales.length === 0) {
      // Desmarcar otros como predeterminados
      metodosPagoActuales.forEach(mp => {
        mp.predeterminado = false;
      });
      nuevoMetodo.predeterminado = true;
    }

    // Agregar el nuevo método
    const nuevosMetodosPago = [...metodosPagoActuales, nuevoMetodo];

    // Actualizar usuario
    const usuarioActualizado = await updateUsuario(usuarioId, {
      metodoPago: nuevosMetodosPago
    });

    if (!usuarioActualizado) {
      return res.status(500).json({
        message: "Error al actualizar usuario",
        details: "No se pudo guardar el método de pago"
      });
    }

    console.log('✅ Método de pago agregado exitosamente');

    res.status(201).json({
      message: "Método de pago agregado correctamente",
      metodoPago: nuevoMetodo,
      metodosPago: usuarioActualizado.metodoPago
    });

  } catch (error) {
    console.error('💥 Error agregando método de pago:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al agregar método de pago",
      details: error.message
    });
  }
};

const eliminarMetodoPagoController = async (req, res) => {
  const { id: usuarioId, metodoId } = req.params;

  try {
    console.log('🗑️ Eliminando método de pago:', {
      usuarioId,
      metodoId
    });

    // Obtener usuario actual
    const usuario = await findUsuarioById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${usuarioId}`
      });
    }

    // Verificar que el método existe
    const metodosPagoActuales = usuario.metodoPago || [];
    const metodoAEliminar = metodosPagoActuales.find(mp => mp.id === metodoId);

    if (!metodoAEliminar) {
      return res.status(404).json({
        message: "Método de pago no encontrado",
        details: `No se ha encontrado el método de pago con id: ${metodoId}`
      });
    }

    // Verificar que no sea el último método de pago activo
    const metodosActivos = metodosPagoActuales.filter(mp => mp.activo);
    if (metodosActivos.length === 1 && metodoAEliminar.activo) {
      return res.status(400).json({
        message: "No se puede eliminar el último método de pago",
        details: "Debe tener al menos un método de pago activo"
      });
    }

    // Filtrar el método a eliminar
    const nuevosMetodosPago = metodosPagoActuales.filter(mp => mp.id !== metodoId);

    // Si eliminamos el método predeterminado y hay otros, hacer el primero predeterminado
    if (metodoAEliminar.predeterminado && nuevosMetodosPago.length > 0) {
      nuevosMetodosPago[0].predeterminado = true;
    }

    // Actualizar usuario
    const usuarioActualizado = await updateUsuario(usuarioId, {
      metodoPago: nuevosMetodosPago
    });

    if (!usuarioActualizado) {
      return res.status(500).json({
        message: "Error al actualizar usuario",
        details: "No se pudo eliminar el método de pago"
      });
    }

    console.log('✅ Método de pago eliminado exitosamente');

    res.status(200).json({
      message: "Método de pago eliminado correctamente",
      metodosPago: usuarioActualizado.metodoPago
    });

  } catch (error) {
    console.error('💥 Error eliminando método de pago:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: "El formato del ID no es válido"
      });
    }

    res.status(500).json({
      message: "Error al eliminar método de pago",
      details: error.message
    });
  }
};

const actualizarMetodoPredeterminadoController = async (req, res) => {
  const { id: usuarioId, metodoId } = req.params;

  try {
    console.log('⭐ Actualizando método predeterminado:', {
      usuarioId,
      metodoId
    });

    // Obtener usuario actual
    const usuario = await findUsuarioById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${usuarioId}`
      });
    }

    // Verificar que el método existe y está activo
    const metodosPagoActuales = usuario.metodoPago || [];
    const metodoAActivar = metodosPagoActuales.find(mp => mp.id === metodoId);

    if (!metodoAActivar) {
      return res.status(404).json({
        message: "Método de pago no encontrado",
        details: `No se ha encontrado el método de pago con id: ${metodoId}`
      });
    }

    if (!metodoAActivar.activo) {
      return res.status(400).json({
        message: "Método de pago inactivo",
        details: "No se puede establecer como predeterminado un método inactivo"
      });
    }

    // Actualizar predeterminados
    const nuevosMetodosPago = metodosPagoActuales.map(mp => ({
      ...mp,
      predeterminado: mp.id === metodoId
    }));

    // Actualizar usuario
    const usuarioActualizado = await updateUsuario(usuarioId, {
      metodoPago: nuevosMetodosPago
    });

    if (!usuarioActualizado) {
      return res.status(500).json({
        message: "Error al actualizar usuario",
        details: "No se pudo actualizar el método predeterminado"
      });
    }

    console.log('✅ Método predeterminado actualizado exitosamente');

    res.status(200).json({
      message: "Método predeterminado actualizado correctamente",
      metodosPago: usuarioActualizado.metodoPago
    });

  } catch (error) {
    console.error('💥 Error actualizando método predeterminado:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: "El formato del ID no es válido"
      });
    }

    res.status(500).json({
      message: "Error al actualizar método predeterminado",
      details: error.message
    });
  }
};

const obtenerMetodosPagoController = async (req, res) => {
  const { id: usuarioId } = req.params;

  try {
    console.log('📋 Obteniendo métodos de pago para usuario:', usuarioId);

    const usuario = await findUsuarioById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${usuarioId}`
      });
    }

    const metodosPago = usuario.metodoPago || [];
    const metodosActivos = metodosPago.filter(mp => mp.activo);

    res.status(200).json({
      metodosPago: metodosActivos,
      total: metodosActivos.length,
      predeterminado: metodosActivos.find(mp => mp.predeterminado) || null
    });

  } catch (error) {
    console.error('💥 Error obteniendo métodos de pago:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al obtener métodos de pago",
      details: error.message
    });
  }
};

module.exports = {
  // Controladores existentes
  getUsuariosController,
  getUsuarioByIdController,
  getUsuariosByTipoController,
  registerUsuarioController,
  updateUsuarioController,
  deleteUsuarioController,
  cambiarRolUsuarioController,
  updateMembresiaUsuarioController,
  // Nuevos controladores para métodos de pago
  agregarMetodoPagoController,
  eliminarMetodoPagoController,
  actualizarMetodoPredeterminadoController,
  obtenerMetodosPagoController
};