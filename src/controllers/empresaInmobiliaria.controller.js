const {
  getEmpresasInmobiliarias,
  findEmpresaInmobiliariaById,
  findEmpresaByUsuarioId,
  getEmpresasByTipo,
  getEmpresasVerificadas,
  getEmpresasByCiudad,
  createEmpresaInmobiliaria,
  updateEmpresaInmobiliaria,
  deleteEmpresaInmobiliaria,
  activarEmpresaInmobiliaria,
  verificarEmpresa,
  actualizarCalificacion,
  agregarEspacio,
  eliminarEspacio,
  actualizarMetodoPago,
  actualizarContacto,
  getEmpresasConMasEspacios
} = require("../repositories/empresaInmobiliaria.repository");
const {
  createEmpresaInmobiliariaSchema,
  updateEmpresaInmobiliariaSchema,
  verificarEmpresaSchema
} = require("../routes/validations/empresaInmobiliaria.validation");
const { findEspacioById } = require("../repositories/espacio.repository");
const { findUsuarioById } = require("../repositories/usuario.repository");

const getEmpresasInmobiliariasController = async (req, res) => {
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
    const empresas = await getEmpresasInmobiliarias(filtros, skipNum, limitNum);
    return res.status(200).json(empresas);
  } catch (error) {
    console.error("[Error Controller] al obtener empresas inmobiliarias", error);
    return res.status(500).json({
      message: "Error al obtener las empresas inmobiliarias",
      details: error.message
    });
  }
};

const getEmpresaByUsuarioIdController = async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const empresa = await findEmpresaByUsuarioId(usuarioId);
    if (!empresa) {
      return res.status(404).json({
        message: `No se ha encontrado empresa inmobiliaria para el usuario con id: ${usuarioId}`
      });
    }
    res.status(200).json(empresa);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar la empresa inmobiliaria por usuario",
      details: error.message
    });
  }
};

const getEmpresaInmobiliariaByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const empresa = await findEmpresaInmobiliariaById(id);
    if (!empresa) {
      return res.status(404).json({ message: `No se ha encontrado la empresa inmobiliaria con id: ${id}` });
    }
    res.status(200).json(empresa);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de empresa inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar la empresa inmobiliaria",
      details: error.message
    });
  }
};

const getEmpresasByTipoController = async (req, res) => {
  const { tipo } = req.params;
  try {
    const empresas = await getEmpresasByTipo(tipo);
    res.status(200).json(empresas);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('tipo')) {
      return res.status(400).json({
        message: "Error con el tipo de empresa",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener empresas por tipo",
      details: error.message
    });
  }
};

const getEmpresasVerificadasController = async (req, res) => {
  try {
    const empresas = await getEmpresasVerificadas();
    res.status(200).json(empresas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener empresas verificadas",
      details: error.message
    });
  }
};

const getEmpresasByCiudadController = async (req, res) => {
  const { ciudad } = req.params;
  try {
    const empresas = await getEmpresasByCiudad(ciudad);
    res.status(200).json(empresas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener empresas por ciudad",
      details: error.message
    });
  }
};

const createEmpresaInmobiliariaController = async (req, res) => {
  const { error, value } = createEmpresaInmobiliariaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los datos de la empresa",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { usuarioId, espacios } = value;

  try {
    const usuario = await findUsuarioById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se ha encontrado el usuario con id: ${usuarioId}`,
        field: "usuarioId"
      });
    }

    if (usuario.tipoUsuario !== 'cliente') {
      return res.status(400).json({
        message: "Tipo de usuario inválido",
        details: "Solo los usuarios de tipo 'cliente' pueden crear una empresa inmobiliaria",
        field: "usuarioId"
      });
    }

    if (!usuario.activo) {
      return res.status(400).json({
        message: "Usuario inactivo",
        details: "No se puede crear una empresa para un usuario inactivo",
        field: "usuarioId"
      });
    }

    const empresaExistente = await findEmpresaByUsuarioId(usuarioId);
    if (empresaExistente) {
      return res.status(400).json({
        message: "Usuario ya tiene empresa",
        details: "El usuario ya tiene una empresa inmobiliaria asociada",
        field: "usuarioId"
      });
    }

    if (espacios && espacios.length > 0) {
      try {
        for (const espacioId of espacios) {
          const espacio = await findEspacioById(espacioId);
          if (!espacio) {
            return res.status(404).json({
              message: "Espacio no encontrado",
              details: `No se ha encontrado el espacio con id: ${espacioId}`,
              field: "espacios"
            });
          }

          if (!espacio.activo) {
            return res.status(400).json({
              message: "Espacio inactivo",
              details: `El espacio con id: ${espacioId} no está activo`,
              field: "espacios"
            });
          }
        }
      } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
          return res.status(400).json({
            message: "ID de espacio inválido",
            details: "Uno o más IDs de espacios tienen formato inválido",
            field: "espacios"
          });
        }

        return res.status(400).json({
          message: "Error al verificar espacios",
          details: error.message
        });
      }
    }

    const empresa = await createEmpresaInmobiliaria(value);
    res.status(201).json({ message: "Empresa inmobiliaria creada correctamente", empresa });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'usuarioId') {
        return res.status(400).json({
          message: "Error de duplicación",
          details: "El usuario ya tiene una empresa inmobiliaria asociada",
          field: "usuarioId"
        });
      }
      return res.status(400).json({
        message: "Error de duplicación",
        details: `Ya existe una empresa con el mismo valor en '${field}'`,
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
      message: "Error al crear la empresa inmobiliaria",
      details: error.message
    });
  }
};

const updateEmpresaInmobiliariaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateEmpresaInmobiliariaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los datos de actualización",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { espacios } = value;
  if (espacios && espacios.length > 0) {
    try {
      for (const espacioId of espacios) {
        const espacio = await findEspacioById(espacioId);
        if (!espacio) {
          return res.status(404).json({
            message: "Espacio no encontrado",
            details: `No se ha encontrado el espacio con id: ${espacioId}`,
            field: "espacios"
          });
        }

        if (!espacio.activo) {
          return res.status(400).json({
            message: "Espacio inactivo",
            details: `El espacio con id: ${espacioId} no está activo`,
            field: "espacios"
          });
        }
      }
    } catch (error) {
      console.error(error);

      if (error.name === 'CastError') {
        return res.status(400).json({
          message: "ID de espacio inválido",
          details: "Uno o más IDs de espacios tienen formato inválido",
          field: "espacios"
        });
      }

      return res.status(400).json({
        message: "Error al verificar espacios",
        details: error.message
      });
    }
  }

  try {
    const empresa = await updateEmpresaInmobiliaria(id, value);
    if (!empresa) {
      return res.status(404).json({ message: `No se ha encontrado la empresa inmobiliaria con id: ${id}` });
    }
    res.status(200).json(empresa);
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: "Error de duplicación",
        details: `Ya existe una empresa con el mismo valor en '${field}'`,
        field
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Error de tipo de datos",
        details: `El valor '${error.value}' no es válido para el campo '${error.path}'`,
        field: error.path
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
      message: "Error al actualizar la empresa inmobiliaria",
      details: error.message
    });
  }
};

const deleteEmpresaInmobiliariaController = async (req, res) => {
  const { id } = req.params;
  try {
    const empresa = await deleteEmpresaInmobiliaria(id);
    if (!empresa) {
      return res.status(404).json({ message: `No se ha encontrado la empresa inmobiliaria con id: ${id}` });
    }
    res.status(200).json({ message: "Empresa inmobiliaria desactivada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de empresa inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('referencia') || error.message.includes('reference')) {
      return res.status(400).json({
        message: "Error de integridad referencial",
        details: "No se puede eliminar la empresa porque existen registros que dependen de ella"
      });
    }

    res.status(500).json({
      message: "Error al desactivar la empresa inmobiliaria",
      details: error.message
    });
  }
};

const activarEmpresaInmobiliariaController = async (req, res) => {
  const { id } = req.params;
  try {
    const empresa = await activarEmpresaInmobiliaria(id);
    if (!empresa) {
      return res.status(404).json({ message: `No se ha encontrado la empresa inmobiliaria con id: ${id}` });
    }
    res.status(200).json({ message: "Empresa inmobiliaria activada correctamente", empresa });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de empresa inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al activar la empresa inmobiliaria",
      details: error.message
    });
  }
};

const verificarEmpresaController = async (req, res) => {
  const { error, value } = verificarEmpresaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los datos de verificación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { empresaId, documentosVerificacion, notas } = value;

  try {
    const empresaExiste = await findEmpresaInmobiliariaById(empresaId);
    if (!empresaExiste) {
      return res.status(404).json({
        message: "Empresa no encontrada",
        details: `No se ha encontrado la empresa inmobiliaria con id: ${empresaId}`,
        field: "empresaId"
      });
    }

    if (empresaExiste.verificado) {
      return res.status(400).json({
        message: "Empresa ya verificada",
        details: "La empresa ya ha sido verificada anteriormente"
      });
    }

    const empresa = await verificarEmpresa(empresaId);

    res.status(200).json({
      message: "Empresa verificada correctamente",
      empresa,
      documentosVerificacion,
      notas
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de empresa inválido",
        details: `El formato del ID '${empresaId}' no es válido`
      });
    }

    if (error.message && error.message.includes('ya verificada')) {
      return res.status(400).json({
        message: "Error de verificación",
        details: "La empresa ya se encuentra verificada"
      });
    }

    res.status(500).json({
      message: "Error al verificar la empresa",
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
      details: "La calificación debe ser un número entre 0 y 5"
    });
  }

  try {
    const empresa = await actualizarCalificacion(id, calificacion);
    if (!empresa) {
      return res.status(404).json({ message: `No se ha encontrado la empresa inmobiliaria con id: ${id}` });
    }
    res.status(200).json({ message: "Calificación actualizada correctamente", empresa });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de empresa o formato de calificación inválido",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al actualizar la calificación",
      details: error.message
    });
  }
};

const agregarEspacioController = async (req, res) => {
  const { id } = req.params;
  const { espacioId } = req.body;

  if (!espacioId) {
    return res.status(400).json({
      message: "Datos incompletos",
      details: "Se requiere el ID del espacio"
    });
  }

  try {
    const espacio = await findEspacioById(espacioId);
    if (!espacio) {
      return res.status(404).json({
        message: "Espacio no encontrado",
        details: `No se ha encontrado el espacio con id: ${espacioId}`,
        field: "espacioId"
      });
    }

    if (!espacio.activo) {
      return res.status(400).json({
        message: "Espacio inactivo",
        details: `El espacio con id: ${espacioId} no está activo`,
        field: "espacioId"
      });
    }

    if (espacio.empresaInmobiliariaId && espacio.empresaInmobiliariaId.toString() !== id) {
      return res.status(400).json({
        message: "Espacio ya asignado",
        details: `El espacio ya está asignado a otra empresa inmobiliaria`,
        field: "espacioId"
      });
    }

    const empresa = await agregarEspacio(id, espacioId);
    if (!empresa) {
      return res.status(404).json({ message: `No se ha encontrado la empresa inmobiliaria con id: ${id}` });
    }
    res.status(200).json({ message: "Espacio agregado correctamente", empresa });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: "El formato del ID de empresa o espacio no es válido"
      });
    }

    if (error.message && error.message.includes('duplicado') || error.message.includes('already exists')) {
      return res.status(400).json({
        message: "Error de duplicación",
        details: "El espacio ya está asignado a esta empresa"
      });
    }

    res.status(500).json({
      message: "Error al agregar el espacio",
      details: error.message
    });
  }
};

const eliminarEspacioController = async (req, res) => {
  const { id, espacioId } = req.params;

  try {
    const empresa = await eliminarEspacio(id, espacioId);
    if (!empresa) {
      return res.status(404).json({ message: `No se ha encontrado la empresa inmobiliaria con id: ${id}` });
    }
    res.status(200).json({ message: "Espacio eliminado correctamente", empresa });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID inválido",
        details: "El formato del ID de empresa o espacio no es válido"
      });
    }

    if (error.message && error.message.includes('no existe') || error.message.includes('not found')) {
      return res.status(404).json({
        message: "Espacio no encontrado",
        details: `La empresa no tiene asignado el espacio con id: ${espacioId}`
      });
    }

    res.status(500).json({
      message: "Error al eliminar el espacio",
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
      details: "Se requiere información del método de pago"
    });
  }

  try {
    const empresa = await actualizarMetodoPago(id, metodoPago);
    if (!empresa) {
      return res.status(404).json({ message: `No se ha encontrado la empresa inmobiliaria con id: ${id}` });
    }
    res.status(200).json({ message: "Método de pago actualizado correctamente", empresa });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de empresa inválido",
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

const actualizarContactoController = async (req, res) => {
  const { id } = req.params;
  const { contacto } = req.body;

  if (!contacto || !contacto.nombreContacto || !contacto.email || !contacto.telefono) {
    return res.status(400).json({
      message: "Datos de contacto incompletos",
      details: "Se requieren nombre de contacto, email y teléfono"
    });
  }

  try {
    const empresa = await actualizarContacto(id, contacto);
    if (!empresa) {
      return res.status(404).json({ message: `No se ha encontrado la empresa inmobiliaria con id: ${id}` });
    }
    res.status(200).json({ message: "Información de contacto actualizada correctamente", empresa });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de empresa inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en datos de contacto",
        details: errors
      });
    }

    if (error.message && error.message.includes('email')) {
      return res.status(400).json({
        message: "Error en formato de email",
        details: "El formato del email proporcionado no es válido"
      });
    }

    res.status(500).json({
      message: "Error al actualizar la información de contacto",
      details: error.message
    });
  }
};

const getEmpresasConMasEspaciosController = async (req, res) => {
  const { limite } = req.query;

  try {
    const empresas = await getEmpresasConMasEspacios(limite ? parseInt(limite) : 5);
    res.status(200).json(empresas);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('límite')) {
      return res.status(400).json({
        message: "Error en parámetro límite",
        details: "El valor del límite debe ser un número entero positivo"
      });
    }

    res.status(500).json({
      message: "Error al obtener empresas con más espacios",
      details: error.message
    });
  }
};

module.exports = {
  getEmpresasInmobiliariasController,
  getEmpresaInmobiliariaByIdController,
  getEmpresaByUsuarioIdController,
  getEmpresasByTipoController,
  getEmpresasVerificadasController,
  getEmpresasByCiudadController,
  createEmpresaInmobiliariaController,
  updateEmpresaInmobiliariaController,
  deleteEmpresaInmobiliariaController,
  activarEmpresaInmobiliariaController,
  verificarEmpresaController,
  actualizarCalificacionController,
  agregarEspacioController,
  eliminarEspacioController,
  actualizarMetodoPagoController,
  actualizarContactoController,
  getEmpresasConMasEspaciosController
};