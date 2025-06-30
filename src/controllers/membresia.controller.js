const {
  getMembresias,
  findMembresiaById,
  findMembresiaByTipo,
  getMembresiasActivas,
  createMembresia,
  updateMembresia,
  deleteMembresia,
  activarMembresia,
  getMembresiasOrdenadas,
  findMembresiasWithBeneficio,
  getMembresiasParaEmpresa,
  getMembresiasPorRangoPrecio,
  actualizarBeneficios
} = require("../repositories/membresia.repository");
const { findUsuarioById } = require("../repositories/usuario.repository");
const { updateMembresiaUsuario } = require("../repositories/usuario.repository");

const {
  createMembresiaSchema,
  updateMembresiaSchema,
  suscribirMembresiaSchema,
  cancelarMembresiaSchema
} = require("../routes/validations/membresia.validation");

const getMembresiasController = async (req, res) => {
  const { skip = "0", limit = "10", ...filtros } = req.query;
  const skipNum = parseInt(skip, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(skipNum) || skipNum < 0) {
    return res.status(400).json({
      message: "Parámetro inválido",
      details: "`skip` debe ser un entero ≥ 0",
    });
  }
  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({
      message: "Parámetro inválido",
      details: "`limit` debe ser un entero ≥ 1",
    });
  }

  try {
    const membresias = await getMembresias(filtros, skipNum, limitNum);
    return res.status(200).json(membresias);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las membresías",
      details: error.message,
    });
  }
};

const getMembresiaByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const membresia = await findMembresiaById(id);
    if (!membresia) {
      return res.status(404).json({
        message: "Membresía no encontrada",
        details: `No se ha encontrado la membresía con id: ${id}`
      });
    }
    res.status(200).json(membresia);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de membresía inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar la membresía",
      details: error.message
    });
  }
};

const getMembresiaByTipoController = async (req, res) => {
  const { tipo } = req.params;
  try {
    const membresia = await findMembresiaByTipo(tipo);
    if (!membresia) {
      return res.status(404).json({
        message: "Membresía no encontrada",
        details: `No se ha encontrado la membresía de tipo: ${tipo}`
      });
    }
    res.status(200).json(membresia);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('tipo inválido')) {
      return res.status(400).json({
        message: "Tipo de membresía inválido",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al buscar la membresía por tipo",
      details: error.message
    });
  }
};

const getMembresiasActivasController = async (req, res) => {
  try {
    const membresias = await getMembresiasActivas();
    res.status(200).json(membresias);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener las membresías activas",
      details: error.message
    });
  }
};

const createMembresiaController = async (req, res) => {
  const { error, value } = createMembresiaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const membresia = await createMembresia(value);
    res.status(201).json({ message: "Membresía creada correctamente", membresia });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Datos duplicados",
        details: "Ya existe una membresía con el mismo nombre o código"
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    if (error.message && error.message.includes('beneficios')) {
      return res.status(400).json({
        message: "Error en los beneficios",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al crear la membresía",
      details: error.message
    });
  }
};

const updateMembresiaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateMembresiaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const membresia = await updateMembresia(id, value);
    if (!membresia) {
      return res.status(404).json({
        message: "Membresía no encontrada",
        details: `No se ha encontrado la membresía con id: ${id}`
      });
    }
    res.status(200).json(membresia);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de membresía inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Datos duplicados",
        details: "Ya existe una membresía con el mismo nombre o código"
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    if (error.message && error.message.includes('no modificable')) {
      return res.status(400).json({
        message: "Membresía no modificable",
        details: "No se puede modificar una membresía con usuarios activos"
      });
    }

    res.status(500).json({
      message: "Error al actualizar la membresía",
      details: error.message
    });
  }
};

const deleteMembresiaController = async (req, res) => {
  const { id } = req.params;
  try {
    const membresia = await deleteMembresia(id);
    if (!membresia) {
      return res.status(404).json({
        message: "Membresía no encontrada",
        details: `No se ha encontrado la membresía con id: ${id}`
      });
    }
    res.status(200).json({ message: "Membresía desactivada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de membresía inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('tiene usuarios') || error.message.includes('suscripciones activas')) {
      return res.status(400).json({
        message: "Membresía con usuarios activos",
        details: "No se puede eliminar una membresía que tiene usuarios suscritos actualmente"
      });
    }

    res.status(500).json({
      message: "Error al desactivar la membresía",
      details: error.message
    });
  }
};

const activarMembresiaController = async (req, res) => {
  const { id } = req.params;
  try {
    const membresia = await activarMembresia(id);
    if (!membresia) {
      return res.status(404).json({
        message: "Membresía no encontrada",
        details: `No se ha encontrado la membresía con id: ${id}`
      });
    }
    res.status(200).json({ message: "Membresía activada correctamente", membresia });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de membresía inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('ya activa')) {
      return res.status(400).json({
        message: "Membresía ya activa",
        details: "La membresía ya se encuentra activa"
      });
    }

    res.status(500).json({
      message: "Error al activar la membresía",
      details: error.message
    });
  }
};

const getMembresiasOrdenadasController = async (req, res) => {
  const { campo, orden } = req.query;

  const camposValidos = ['nombre', 'precio.valor', 'duracion', 'createdAt', 'updatedAt'];
  if (campo && !camposValidos.includes(campo)) {
    return res.status(400).json({
      message: "Campo de ordenamiento inválido",
      details: `Los campos válidos son: ${camposValidos.join(', ')}`,
      field: "campo"
    });
  }

  if (orden && !['asc', 'desc'].includes(orden)) {
    return res.status(400).json({
      message: "Orden inválido",
      details: "El orden debe ser 'asc' o 'desc'",
      field: "orden"
    });
  }

  try {
    const membresias = await getMembresiasOrdenadas(
      campo || 'precio.valor',
      orden === 'desc' ? -1 : 1
    );
    res.status(200).json(membresias);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('campo inválido')) {
      return res.status(400).json({
        message: "Campo de ordenamiento inválido",
        details: error.message,
        field: "campo"
      });
    }

    res.status(500).json({
      message: "Error al obtener las membresías ordenadas",
      details: error.message
    });
  }
};

const getMembresiasWithBeneficioController = async (req, res) => {
  const { tipoBeneficio } = req.params;

  if (!tipoBeneficio) {
    return res.status(400).json({
      message: "Parámetro requerido",
      details: "Se requiere especificar un tipo de beneficio",
      field: "tipoBeneficio"
    });
  }

  try {
    const membresias = await findMembresiasWithBeneficio(tipoBeneficio);
    res.status(200).json(membresias);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('tipo de beneficio no válido')) {
      return res.status(400).json({
        message: "Tipo de beneficio inválido",
        details: error.message,
        field: "tipoBeneficio"
      });
    }

    res.status(500).json({
      message: "Error al obtener membresías por beneficio",
      details: error.message
    });
  }
};

const getMembresiasPorRangoPrecioController = async (req, res) => {
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
    const membresias = await getMembresiasPorRangoPrecio(min, max);
    res.status(200).json(membresias);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener membresías por rango de precio",
      details: error.message
    });
  }
};

const actualizarBeneficiosController = async (req, res) => {
  const { id } = req.params;
  const { beneficios } = req.body;

  if (!beneficios || !Array.isArray(beneficios)) {
    return res.status(400).json({
      message: "Formato inválido",
      details: "Se requiere un array de beneficios",
      field: "beneficios"
    });
  }

  const beneficiosInvalidos = beneficios.filter(
    beneficio => !beneficio.tipo || !beneficio.descripcion
  );

  if (beneficiosInvalidos.length > 0) {
    return res.status(400).json({
      message: "Estructura de beneficios inválida",
      details: "Cada beneficio debe tener al menos un tipo y una descripción",
      field: "beneficios"
    });
  }

  try {
    const membresia = await actualizarBeneficios(id, beneficios);
    if (!membresia) {
      return res.status(404).json({
        message: "Membresía no encontrada",
        details: `No se ha encontrado la membresía con id: ${id}`
      });
    }
    res.status(200).json({ message: "Beneficios actualizados correctamente", membresia });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de membresía inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Error de validación en beneficios",
        details: error.message,
        field: "beneficios"
      });
    }

    res.status(500).json({
      message: "Error al actualizar los beneficios",
      details: error.message
    });
  }
};

const suscribirMembresiaController = async (req, res) => {
  const { error, value } = suscribirMembresiaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { usuarioId, membresiaId, fechaInicio, metodoPagoId, renovacionAutomatica, codigoPromocional } = value;

  try {
    const usuario = await findUsuarioById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${usuarioId}`,
        field: "usuarioId"
      });
    }

    const membresia = await findMembresiaById(membresiaId);
    if (!membresia) {
      return res.status(404).json({
        message: "Membresía no encontrada",
        details: `No se ha encontrado la membresía con id: ${membresiaId}`,
        field: "membresiaId"
      });
    }

    if (!membresia.activo) {
      return res.status(400).json({
        message: "Membresía inactiva",
        details: "No se puede suscribir a una membresía que no está activa",
        field: "membresiaId"
      });
    }

    let fechaInicioObj = null;
    if (fechaInicio) {
      fechaInicioObj = new Date(fechaInicio);
      if (isNaN(fechaInicioObj.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de inicio debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaInicio"
        });
      }
    }

    const inicio = fechaInicioObj || new Date();
    const vencimiento = new Date(inicio);
    vencimiento.setDate(vencimiento.getDate() + membresia.duracion);

    const membresiaData = {
      tipoMembresiaId: membresiaId, 
      fechaInicio: inicio,
      fechaVencimiento: vencimiento,
      renovacionAutomatica: renovacionAutomatica !== undefined ? renovacionAutomatica : true 
    };

    const usuarioActualizado = await updateMembresiaUsuario(usuarioId, membresiaData);
    if (!usuarioActualizado) {
      return res.status(500).json({
        message: "Error al actualizar membresía",
        details: "No se pudo actualizar la membresía del usuario"
      });
    }

    if (!usuarioActualizado.membresia || !usuarioActualizado.membresia.tipoMembresiaId) {
      return res.status(500).json({
        message: "Error al asignar membresía",
        details: "La membresía no se asignó correctamente al usuario"
      });
    }

    res.status(200).json({
      message: "Suscripción a membresía realizada correctamente",
      usuario: {
        _id: usuarioActualizado._id,
        username: usuarioActualizado.username,
        email: usuarioActualizado.email,
        tipoUsuario: usuarioActualizado.tipoUsuario,
        nombre: usuarioActualizado.nombre,
        apellidos: usuarioActualizado.apellidos,
        imagen: usuarioActualizado.imagen,
        membresia: usuarioActualizado.membresia, 
        metodoPago: usuarioActualizado.metodoPago,
        activo: usuarioActualizado.activo,
        verificado: usuarioActualizado.verificado,
        rol: usuarioActualizado.rol,
        updatedAt: usuarioActualizado.updatedAt
      },
      suscripcion: {
        usuarioId,
        membresiaId,
        nombreMembresia: membresia.nombre,
        tipoMembresia: membresia.tipo,
        fechaInicio: inicio,
        fechaVencimiento: vencimiento,
        renovacionAutomatica: renovacionAutomatica !== undefined ? renovacionAutomatica : true,
        codigoPromocional: codigoPromocional || null,
        duracion: membresia.duracion,
        precio: membresia.precio
      }
    });

  } catch (error) {

    if (error.name === 'CastError') {
      const field = error.path;
      return res.status(400).json({
        message: `ID de ${field} inválido`,
        details: `El formato del ID no es válido`,
        field
      });
    }

    if (error.message && error.message.includes('método de pago no encontrado')) {
      return res.status(404).json({
        message: "Método de pago no encontrado",
        details: `No existe un método de pago con id: ${metodoPagoId}`,
        field: "metodoPagoId"
      });
    }

    if (error.message && error.message.includes('ya tiene una suscripción activa')) {
      return res.status(400).json({
        message: "Usuario ya suscrito",
        details: "El usuario ya tiene una suscripción activa a esta membresía",
        field: "usuarioId"
      });
    }

    if (error.message && error.message.includes('código promocional')) {
      return res.status(400).json({
        message: "Código promocional inválido",
        details: error.message,
        field: "codigoPromocional"
      });
    }

    res.status(500).json({
      message: "Error al procesar la suscripción",
      details: error.message
    });
  }
};

const cancelarMembresiaController = async (req, res) => {
  const { error, value } = cancelarMembresiaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { usuarioId, membresiaId, motivo, fechaCancelacion, reembolsoParcial } = value;

  try {
    const usuario = await findUsuarioById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${usuarioId}`,
        field: "usuarioId"
      });
    }

    const membresia = await findMembresiaById(membresiaId);
    if (!membresia) {
      return res.status(404).json({
        message: "Membresía no encontrada",
        details: `No se ha encontrado la membresía con id: ${membresiaId}`,
        field: "membresiaId"
      });
    }

    if (!usuario.membresia ||
      !usuario.membresia.tipoMembresiaId ||
      usuario.membresia.tipoMembresiaId.toString() !== membresiaId) {
      return res.status(400).json({
        message: "Sin suscripción activa",
        details: "El usuario no tiene una suscripción activa a esta membresía",
        field: "usuarioId"
      });
    }

    let fechaCancelacionObj = null;
    if (fechaCancelacion) {
      fechaCancelacionObj = new Date(fechaCancelacion);
      if (isNaN(fechaCancelacionObj.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de cancelación debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaCancelacion"
        });
      }
    }

    const fechaCancelacionFinal = fechaCancelacionObj || new Date();
    const membresiaData = {
      ...usuario.membresia,
      renovacionAutomatica: false,
      fechaCancelacion: fechaCancelacionFinal,
      motivoCancelacion: motivo
    };

    const usuarioActualizado = await updateMembresiaUsuario(usuarioId, membresiaData);
    if (!usuarioActualizado) {
      return res.status(500).json({
        message: "Error al cancelar membresía",
        details: "No se pudo actualizar la membresía del usuario"
      });
    }

    res.status(200).json({
      message: "Membresía cancelada correctamente",
      usuario: {
        _id: usuarioActualizado._id,
        username: usuarioActualizado.username,
        email: usuarioActualizado.email,
        tipoUsuario: usuarioActualizado.tipoUsuario,
        membresia: usuarioActualizado.membresia
      },
      cancelacion: {
        usuarioId,
        membresiaId,
        nombreMembresia: membresia.nombre,
        fechaCancelacion: fechaCancelacionFinal,
        motivo,
        reembolsoParcial: reembolsoParcial || false,
        mantenerHasta: usuario.membresia.fechaVencimiento
      }
    });

  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      const field = error.path;
      return res.status(400).json({
        message: `ID de ${field} inválido`,
        details: `El formato del ID no es válido`,
        field
      });
    }

    if (error.message && error.message.includes('reembolso no permitido')) {
      return res.status(400).json({
        message: "Reembolso no permitido",
        details: error.message,
        field: "reembolsoParcial"
      });
    }

    res.status(500).json({
      message: "Error al cancelar la membresía",
      details: error.message
    });
  }
};

module.exports = {
  getMembresiasController,
  getMembresiaByIdController,
  getMembresiaByTipoController,
  getMembresiasActivasController,
  createMembresiaController,
  updateMembresiaController,
  deleteMembresiaController,
  activarMembresiaController,
  getMembresiasOrdenadasController,
  getMembresiasWithBeneficioController,
  getMembresiasPorRangoPrecioController,
  actualizarBeneficiosController,
  suscribirMembresiaController,
  cancelarMembresiaController
};