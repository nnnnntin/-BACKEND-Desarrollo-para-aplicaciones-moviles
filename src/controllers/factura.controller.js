const {
  getFacturas,
  findFacturaById,
  findFacturaByNumero,
  getFacturasByUsuario,
  getFacturasPorEstado,
  getFacturasVencidas,
  getFacturasPorRangoFechas,
  createFactura,
  updateFactura,
  deleteFactura,
  marcarFacturaComoCancelada,
  agregarPagoFactura,
  actualizarPdfUrl,
  getFacturasPorRangoMonto,
} = require("../repositories/factura.repository");
const {
  createFacturaSchema,
  updateFacturaSchema,
  filtrarFacturasSchema,
} = require("../routes/validations/factura.validation");

const { findUsuarioById } = require("../repositories/usuario.repository");
const { findEmpresaInmobiliariaById } = require("../repositories/empresaInmobiliaria.repository");
const { findProveedorById } = require("../repositories/proveedor.repository");
const { findPagoById } = require("../repositories/pago.repository");

const EMISOR_MAP = {
  'inmobiliaria': findEmpresaInmobiliariaById,
  'proveedor': findProveedorById,
  'plataforma': null };

const TIPOS_EMISOR_VALIDOS = ['plataforma', 'inmobiliaria', 'proveedor'];
const ESTADOS_FACTURA_VALIDOS = ['pendiente', 'pagada', 'vencida', 'cancelada'];

/**
 * Valida que un usuario existe
 * @param {string} usuarioId - ID del usuario a validar
 * @returns {Promise<Object>} - { valid: boolean, user: Object|null, message: string }
 */
const validarUsuarioExiste = async (usuarioId) => {
  try {
    const usuario = await findUsuarioById(usuarioId);
    
    if (!usuario) {
      return {
        valid: false,
        user: null,
        message: `No se encontró el usuario con ID: ${usuarioId}`
      };
    }

    return {
      valid: true,
      user: usuario,
      message: 'Usuario válido'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        user: null,
        message: `Formato de ID de usuario inválido: ${usuarioId}`
      };
    }
    throw error;
  }
};

/**
 * Valida que un emisor existe según su tipo
 * @param {string} tipoEmisor - Tipo de emisor
 * @param {string} emisorId - ID del emisor
 * @returns {Promise<Object>} - { valid: boolean, emisor: Object|null, message: string }
 */
const validarEmisorExiste = async (tipoEmisor, emisorId) => {
  if (!TIPOS_EMISOR_VALIDOS.includes(tipoEmisor)) {
    return {
      valid: false,
      emisor: null,
      message: `Tipo de emisor no válido: ${tipoEmisor}. Debe ser uno de: ${TIPOS_EMISOR_VALIDOS.join(', ')}`
    };
  }

    if (tipoEmisor === 'plataforma') {
    return {
      valid: true,
      emisor: { tipo: 'plataforma', id: emisorId },
      message: 'Emisor plataforma válido'
    };
  }

  const findEmisorById = EMISOR_MAP[tipoEmisor];
  
  try {
    const emisor = await findEmisorById(emisorId);
    
    if (!emisor) {
      return {
        valid: false,
        emisor: null,
        message: `No se encontró ${tipoEmisor === 'inmobiliaria' ? 'la empresa inmobiliaria' : 'el proveedor'} con ID: ${emisorId}`
      };
    }

    return {
      valid: true,
      emisor: emisor,
      message: 'Emisor válido'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        emisor: null,
        message: `Formato de ID inválido para ${tipoEmisor}: ${emisorId}`
      };
    }
    throw error;
  }
};

/**
 * Valida que todos los pagos existen
 * @param {Array} pagosIds - Array de IDs de pagos
 * @returns {Promise<Object>} - { valid: boolean, invalidIds: Array, pagos: Array, message: string }
 */
const validarPagosExisten = async (pagosIds) => {
  if (!pagosIds || !Array.isArray(pagosIds) || pagosIds.length === 0) {
    return {
      valid: true,
      invalidIds: [],
      pagos: [],
      message: 'No hay pagos para validar'
    };
  }

  const invalidIds = [];
  const pagos = [];
  
  for (const pagoId of pagosIds) {
    try {
      const pago = await findPagoById(pagoId);
      if (!pago) {
        invalidIds.push(pagoId);
      } else {
        pagos.push(pago);
      }
    } catch (error) {
      if (error.name === 'CastError') {
        invalidIds.push(pagoId);
      } else {
        throw error;
      }
    }
  }

  return {
    valid: invalidIds.length === 0,
    invalidIds,
    pagos,
    message: invalidIds.length > 0 
      ? `No se encontraron los siguientes pagos: ${invalidIds.join(', ')}`
      : 'Todos los pagos son válidos'
  };
};

/**
 * Valida que un pago existe
 * @param {string} pagoId - ID del pago a validar
 * @returns {Promise<Object>} - { valid: boolean, pago: Object|null, message: string }
 */
const validarPagoExiste = async (pagoId) => {
  try {
    const pago = await findPagoById(pagoId);
    
    if (!pago) {
      return {
        valid: false,
        pago: null,
        message: `No se encontró el pago con ID: ${pagoId}`
      };
    }

    return {
      valid: true,
      pago: pago,
      message: 'Pago válido'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        pago: null,
        message: `Formato de ID de pago inválido: ${pagoId}`
      };
    }
    throw error;
  }
};

const getFacturasController = async (req, res) => {
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
    const facturas = await getFacturas(filtros, skipNum, limitNum);
    return res.status(200).json(facturas);
  } catch (error) {
    console.error("[Error Controller] al obtener facturas", error);
    return res.status(500).json({
      message: "Error al obtener las facturas",
      details: error.message
    });
  }
};

const getFacturaByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const factura = await findFacturaById(id);
    if (!factura) {
      return res.status(404).json({ message: `No se ha encontrado la factura con id: ${id}` });
    }
    res.status(200).json(factura);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de factura inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar la factura",
      details: error.message
    });
  }
};

const getFacturaByNumeroController = async (req, res) => {
  const { numeroFactura } = req.params;
  try {
    const factura = await findFacturaByNumero(numeroFactura);
    if (!factura) {
      return res.status(404).json({ message: `No se ha encontrado la factura con número: ${numeroFactura}` });
    }
    res.status(200).json(factura);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al buscar la factura por número",
      details: error.message
    });
  }
};

const getFacturasByUsuarioController = async (req, res) => {
  const { usuarioId } = req.params;
  try {
        const validacionUsuario = await validarUsuarioExiste(usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

    const facturas = await getFacturasByUsuario(usuarioId);
    res.status(200).json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener facturas del usuario",
      details: error.message
    });
  }
};

const getFacturasPorEstadoController = async (req, res) => {
  const { estado } = req.params;

  if (!ESTADOS_FACTURA_VALIDOS.includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: `El estado debe ser uno de: ${ESTADOS_FACTURA_VALIDOS.join(', ')}`
    });
  }

  try {
    const facturas = await getFacturasPorEstado(estado);
    res.status(200).json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener facturas por estado",
      details: error.message
    });
  }
};

const getFacturasVencidasController = async (req, res) => {
  try {
    const facturas = await getFacturasVencidas();
    res.status(200).json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener facturas vencidas",
      details: error.message
    });
  }
};

const getFacturasPorRangoFechasController = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({
      message: "Parámetros incompletos",
      details: "Se requieren fechas de inicio y fin"
    });
  }

  try {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "Las fechas deben tener un formato válido (YYYY-MM-DD o ISO)"
      });
    }

    if (inicio > fin) {
      return res.status(400).json({
        message: "Rango de fechas inválido",
        details: "La fecha de inicio debe ser anterior a la fecha de fin"
      });
    }

    const facturas = await getFacturasPorRangoFechas(inicio, fin);
    res.status(200).json(facturas);
  } catch (error) {
    console.error(error);

    if (error instanceof RangeError || error.message.includes('fecha') || error.message.includes('date')) {
      return res.status(400).json({
        message: "Error en las fechas",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener facturas por rango de fechas",
      details: error.message
    });
  }
};

const createFacturaController = async (req, res) => {
  const { error, value } = createFacturaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        const validacionUsuario = await validarUsuarioExiste(value.usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

        const validacionEmisor = await validarEmisorExiste(value.tipoEmisor, value.emisorId);
    if (!validacionEmisor.valid) {
      return res.status(404).json({
        message: "Emisor no encontrado",
        details: validacionEmisor.message
      });
    }

        if (value.pagosIds && value.pagosIds.length > 0) {
      const validacionPagos = await validarPagosExisten(value.pagosIds);
      if (!validacionPagos.valid) {
        return res.status(404).json({
          message: "Pagos no encontrados",
          details: validacionPagos.message,
          invalidIds: validacionPagos.invalidIds
        });
      }

            for (const pago of validacionPagos.pagos) {
        if (pago.facturaId) {
          return res.status(400).json({
            message: "Pago ya vinculado",
            details: `El pago ${pago._id} ya está vinculado a otra factura`
          });
        }
      }
    }

        const fechaEmision = new Date(value.fechaEmision);
    const fechaVencimiento = new Date(value.fechaVencimiento);

    if (isNaN(fechaEmision.getTime()) || isNaN(fechaVencimiento.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
        details: "Las fechas deben tener un formato válido"
      });
    }

    if (fechaEmision > fechaVencimiento) {
      return res.status(400).json({
        message: "Error en las fechas",
        details: "La fecha de emisión debe ser anterior o igual a la fecha de vencimiento"
      });
    }

        const subtotalCalculado = value.conceptos.reduce((sum, concepto) => sum + concepto.subtotal, 0);
    if (Math.abs(subtotalCalculado - value.subtotal) > 0.01) {
      return res.status(400).json({
        message: "Error en cálculo de subtotal",
        details: "El subtotal no coincide con la suma de los conceptos"
      });
    }

    const totalCalculado = value.subtotal + value.impuestosTotal - (value.descuentoTotal || 0);
    if (Math.abs(totalCalculado - value.total) > 0.01) {
      return res.status(400).json({
        message: "Error en cálculo de total",
        details: "El total no coincide con el cálculo (subtotal + impuestos - descuentos)"
      });
    }

    const factura = await createFactura(value);
    res.status(201).json({ 
      message: "Factura creada correctamente", 
      factura,
      usuarioValidado: {
        id: validacionUsuario.user._id,
        nombre: validacionUsuario.user.nombre,
        email: validacionUsuario.user.email
      },
      emisorValidado: {
        tipo: value.tipoEmisor,
        id: validacionEmisor.emisor._id || validacionEmisor.emisor.id,
        nombre: validacionEmisor.emisor.nombre || 'Plataforma'
      }
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Número de factura duplicado",
        details: "El número de factura ya está en uso",
        field: "numeroFactura"
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
      message: "Error al crear la factura",
      details: error.message
    });
  }
};

const updateFacturaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateFacturaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        const facturaExistente = await findFacturaById(id);
    if (!facturaExistente) {
      return res.status(404).json({ 
        message: `No se ha encontrado la factura con id: ${id}` 
      });
    }

        if (facturaExistente.estado === 'cancelada') {
      return res.status(400).json({
        message: "Factura no modificable",
        details: "No se puede modificar una factura cancelada"
      });
    }

    if (facturaExistente.estado === 'pagada' && value.estado !== 'pagada') {
      return res.status(400).json({
        message: "Factura no modificable",
        details: "No se puede cambiar el estado de una factura ya pagada"
      });
    }

        if (value.usuarioId && value.usuarioId !== facturaExistente.usuarioId.toString()) {
      const validacionUsuario = await validarUsuarioExiste(value.usuarioId);
      if (!validacionUsuario.valid) {
        return res.status(404).json({
          message: "Usuario no encontrado",
          details: validacionUsuario.message
        });
      }
    }

        if ((value.tipoEmisor && value.tipoEmisor !== facturaExistente.tipoEmisor) || 
        (value.emisorId && value.emisorId !== facturaExistente.emisorId.toString())) {
      const tipoEmisor = value.tipoEmisor || facturaExistente.tipoEmisor;
      const emisorId = value.emisorId || facturaExistente.emisorId;
      
      const validacionEmisor = await validarEmisorExiste(tipoEmisor, emisorId);
      if (!validacionEmisor.valid) {
        return res.status(404).json({
          message: "Emisor no encontrado",
          details: validacionEmisor.message
        });
      }
    }

        if (value.pagosIds && value.pagosIds.length > 0) {
      const validacionPagos = await validarPagosExisten(value.pagosIds);
      if (!validacionPagos.valid) {
        return res.status(404).json({
          message: "Pagos no encontrados",
          details: validacionPagos.message,
          invalidIds: validacionPagos.invalidIds
        });
      }

            for (const pago of validacionPagos.pagos) {
        if (pago.facturaId && pago.facturaId.toString() !== id) {
          return res.status(400).json({
            message: "Pago ya vinculado",
            details: `El pago ${pago._id} ya está vinculado a otra factura`
          });
        }
      }
    }

        if (value.fechaEmision || value.fechaVencimiento) {
      const fechaEmision = new Date(value.fechaEmision || facturaExistente.fechaEmision);
      const fechaVencimiento = new Date(value.fechaVencimiento || facturaExistente.fechaVencimiento);

      if (isNaN(fechaEmision.getTime()) || isNaN(fechaVencimiento.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "Las fechas deben tener un formato válido"
        });
      }

      if (fechaEmision > fechaVencimiento) {
        return res.status(400).json({
          message: "Error en las fechas",
          details: "La fecha de emisión debe ser anterior o igual a la fecha de vencimiento"
        });
      }
    }

        if (value.conceptos) {
      const subtotalCalculado = value.conceptos.reduce((sum, concepto) => sum + concepto.subtotal, 0);
      const subtotal = value.subtotal || subtotalCalculado;
      
      if (Math.abs(subtotalCalculado - subtotal) > 0.01) {
        return res.status(400).json({
          message: "Error en cálculo de subtotal",
          details: "El subtotal no coincide con la suma de los conceptos"
        });
      }

      if (value.total) {
        const impuestosTotal = value.impuestosTotal || facturaExistente.impuestosTotal;
        const descuentoTotal = value.descuentoTotal || facturaExistente.descuentoTotal || 0;
        const totalCalculado = subtotal + impuestosTotal - descuentoTotal;
        
        if (Math.abs(totalCalculado - value.total) > 0.01) {
          return res.status(400).json({
            message: "Error en cálculo de total",
            details: "El total no coincide con el cálculo (subtotal + impuestos - descuentos)"
          });
        }
      }
    }

    const factura = await updateFactura(id, value);
    res.status(200).json({
      message: "Factura actualizada correctamente",
      factura
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de factura inválido",
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
      message: "Error al actualizar la factura",
      details: error.message
    });
  }
};

const deleteFacturaController = async (req, res) => {
  const { id } = req.params;
  try {
        const facturaExistente = await findFacturaById(id);
    if (!facturaExistente) {
      return res.status(404).json({ 
        message: `No se ha encontrado la factura con id: ${id}` 
      });
    }

        if (facturaExistente.estado === 'pagada') {
      return res.status(400).json({
        message: "Factura no eliminable",
        details: "No se puede eliminar una factura pagada"
      });
    }

    if (facturaExistente.pagosIds && facturaExistente.pagosIds.length > 0) {
      return res.status(400).json({
        message: "Factura no eliminable",
        details: "No se puede eliminar una factura con pagos asociados"
      });
    }

    const factura = await deleteFactura(id);
    res.status(200).json({ message: "Factura eliminada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de factura inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al eliminar la factura",
      details: error.message
    });
  }
};

const marcarFacturaComoCanceladaController = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  if (!motivo) {
    return res.status(400).json({
      message: "Dato requerido",
      details: "Se requiere un motivo de cancelación"
    });
  }

  try {
        const facturaExistente = await findFacturaById(id);
    if (!facturaExistente) {
      return res.status(404).json({ 
        message: `No se ha encontrado la factura con id: ${id}` 
      });
    }

        if (facturaExistente.estado === 'cancelada') {
      return res.status(400).json({
        message: "Factura ya cancelada",
        details: "La factura ya se encuentra en estado cancelada"
      });
    }

    if (facturaExistente.estado === 'pagada') {
      return res.status(400).json({
        message: "Factura pagada",
        details: "No se puede cancelar una factura pagada"
      });
    }

    if (facturaExistente.pagosIds && facturaExistente.pagosIds.length > 0) {
      return res.status(400).json({
        message: "Factura con pagos",
        details: "No se puede cancelar una factura con pagos asociados"
      });
    }

    const factura = await marcarFacturaComoCancelada(id, motivo);
    res.status(200).json({ 
      message: "Factura marcada como cancelada", 
      factura 
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de factura inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al marcar la factura como cancelada",
      details: error.message
    });
  }
};

const agregarPagoFacturaController = async (req, res) => {
  const { id } = req.params;
  const { pagoId } = req.body;

  if (!pagoId) {
    return res.status(400).json({
      message: "Dato requerido",
      details: "Se requiere un ID de pago"
    });
  }

  try {
        const facturaExistente = await findFacturaById(id);
    if (!facturaExistente) {
      return res.status(404).json({ 
        message: `No se ha encontrado la factura con id: ${id}` 
      });
    }

        if (facturaExistente.estado === 'cancelada') {
      return res.status(400).json({
        message: "Factura cancelada",
        details: "No se puede agregar un pago a una factura cancelada"
      });
    }

    if (facturaExistente.estado === 'pagada') {
      return res.status(400).json({
        message: "Factura ya pagada",
        details: "La factura ya está completamente pagada"
      });
    }

        const validacionPago = await validarPagoExiste(pagoId);
    if (!validacionPago.valid) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: validacionPago.message
      });
    }

        if (validacionPago.pago.facturaId && validacionPago.pago.facturaId.toString() !== id) {
      return res.status(400).json({
        message: "Pago ya vinculado",
        details: "El pago ya está vinculado a otra factura"
      });
    }

        if (validacionPago.pago.estado !== 'completado') {
      return res.status(400).json({
        message: "Pago no completado",
        details: "Solo se pueden vincular pagos en estado 'completado'"
      });
    }

        if (validacionPago.pago.usuarioId.toString() !== facturaExistente.usuarioId.toString()) {
      return res.status(400).json({
        message: "Usuario incorrecto",
        details: "El pago debe corresponder al mismo usuario de la factura"
      });
    }

        let totalPagado = 0;
    if (facturaExistente.pagosIds && facturaExistente.pagosIds.length > 0) {
      for (const existingPagoId of facturaExistente.pagosIds) {
        const pagoExistente = await findPagoById(existingPagoId);
        if (pagoExistente) {
          totalPagado += pagoExistente.monto;
        }
      }
    }

    const saldoPendiente = facturaExistente.total - totalPagado;

        if (validacionPago.pago.monto > saldoPendiente + 0.01) {       return res.status(400).json({
        message: "Monto de pago excede saldo",
        details: `El monto del pago (${validacionPago.pago.monto}) excede el saldo pendiente (${saldoPendiente})`
      });
    }

    const factura = await agregarPagoFactura(id, pagoId);
    
        const nuevoTotalPagado = totalPagado + validacionPago.pago.monto;
    if (Math.abs(nuevoTotalPagado - facturaExistente.total) < 0.01) {
      await updateFactura(id, { estado: 'pagada' });
    }

    res.status(200).json({ 
      message: "Pago agregado a la factura", 
      factura,
      pagoVinculado: {
        id: validacionPago.pago._id,
        monto: validacionPago.pago.monto,
        fecha: validacionPago.pago.fecha,
        metodoPago: validacionPago.pago.metodoPago
      },
      saldoAnterior: saldoPendiente,
      saldoActual: saldoPendiente - validacionPago.pago.monto
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      const field = error.path === '_id' ? 'factura' : 'pago';
      return res.status(400).json({
        message: `ID de ${field} inválido`,
        details: `El formato del ID no es válido`
      });
    }

    if (error.code === 'INVALID_PAYMENT_ID') {
      return res.status(400).json({
        message: "ID de pago inválido",
        details: error.message
      });
    }

    if (error.code === 'PAYMENT_NOT_FOUND') {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: error.message
      });
    }

    if (error.code === 'INVALID_FACTURA_ID') {
      return res.status(400).json({
        message: "ID de factura inválido",
        details: error.message
      });
    }

    if (error.code === 'FACTURA_NOT_FOUND') {
      return res.status(404).json({
        message: "Factura no encontrada",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al agregar el pago a la factura",
      details: error.message
    });
  }
};

const actualizarPdfUrlController = async (req, res) => {
  const { id } = req.params;
  const { pdfUrl } = req.body;

  if (!pdfUrl) {
    return res.status(400).json({
      message: "Dato requerido",
      details: "Se requiere una URL de PDF"
    });
  }

  try {
        try {
      new URL(pdfUrl);
    } catch (urlError) {
      return res.status(400).json({
        message: "URL inválida",
        details: "El formato de la URL no es válido"
      });
    }

        const facturaExistente = await findFacturaById(id);
    if (!facturaExistente) {
      return res.status(404).json({ 
        message: `No se ha encontrado la factura con id: ${id}` 
      });
    }

    const factura = await actualizarPdfUrl(id, pdfUrl);
    res.status(200).json({ 
      message: "URL de PDF actualizada", 
      factura 
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de factura inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al actualizar la URL de PDF",
      details: error.message
    });
  }
};

const getFacturasPorRangoMontoController = async (req, res) => {
  const { montoMinimo, montoMaximo } = req.query;

  if (
    montoMinimo == null ||
    montoMaximo == null ||
    isNaN(montoMinimo) ||
    isNaN(montoMaximo)
  ) {
    return res.status(400).json({
      message: "Parámetros inválidos",
      details: "Se requiere un rango de montos válido (valores numéricos)"
    });
  }

  const min = parseFloat(montoMinimo);
  const max = parseFloat(montoMaximo);

  if (min < 0 || max < 0) {
    return res.status(400).json({
      message: "Valores de monto inválidos",
      details: "Los montos deben ser valores positivos"
    });
  }

  if (min > max) {
    return res.status(400).json({
      message: "Rango de montos inválido",
      details: "El monto mínimo debe ser menor o igual al monto máximo"
    });
  }

  try {
    const facturas = await getFacturasPorRangoMonto(min, max);
    res.status(200).json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener facturas por rango de monto",
      details: error.message
    });
  }
};

const filtrarFacturasController = async (req, res) => {
  const { error, value } = filtrarFacturasSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: "Error de validación en los filtros",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
    const filtros = {};

        if (value.usuarioId) {
      const validacionUsuario = await validarUsuarioExiste(value.usuarioId);
      if (!validacionUsuario.valid) {
        return res.status(404).json({
          message: "Usuario no encontrado en filtros",
          details: validacionUsuario.message
        });
      }
      filtros.usuarioId = value.usuarioId;
    }

        if (value.tipoEmisor) {
      if (!TIPOS_EMISOR_VALIDOS.includes(value.tipoEmisor)) {
        return res.status(400).json({
          message: "Tipo de emisor inválido en filtros",
          details: `El tipo de emisor debe ser uno de: ${TIPOS_EMISOR_VALIDOS.join(', ')}`
        });
      }
      filtros.tipoEmisor = value.tipoEmisor;
      
      if (value.emisorId) {
        const validacionEmisor = await validarEmisorExiste(value.tipoEmisor, value.emisorId);
        if (!validacionEmisor.valid) {
          return res.status(404).json({
            message: "Emisor no encontrado en filtros",
            details: validacionEmisor.message
          });
        }
        filtros.emisorId = value.emisorId;
      }
    } else if (value.emisorId) {
      return res.status(400).json({
        message: "Filtro incompleto",
        details: "Se requiere tipoEmisor cuando se especifica emisorId"
      });
    }

    if (value.estado) {
      if (!ESTADOS_FACTURA_VALIDOS.includes(value.estado)) {
        return res.status(400).json({
          message: "Estado inválido en filtros",
          details: `El estado debe ser uno de: ${ESTADOS_FACTURA_VALIDOS.join(', ')}`
        });
      }
      filtros.estado = value.estado;
    }

    if (value.fechaEmisionDesde) {
      const fechaEmisionDesde = new Date(value.fechaEmisionDesde);

      if (isNaN(fechaEmisionDesde.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de emisión desde debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaEmisionDesde"
        });
      }

      filtros.fechaEmision = { $gte: fechaEmisionDesde };
    }

    if (value.fechaEmisionHasta) {
      const fechaEmisionHasta = new Date(value.fechaEmisionHasta);

      if (isNaN(fechaEmisionHasta.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de emisión hasta debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaEmisionHasta"
        });
      }

      if (filtros.fechaEmision) {
        filtros.fechaEmision.$lte = fechaEmisionHasta;
      } else {
        filtros.fechaEmision = { $lte: fechaEmisionHasta };
      }
    }

    if (value.fechaVencimientoDesde) {
      const fechaVencimientoDesde = new Date(value.fechaVencimientoDesde);

      if (isNaN(fechaVencimientoDesde.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de vencimiento desde debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaVencimientoDesde"
        });
      }

      filtros.fechaVencimiento = { $gte: fechaVencimientoDesde };
    }

    if (value.fechaVencimientoHasta) {
      const fechaVencimientoHasta = new Date(value.fechaVencimientoHasta);

      if (isNaN(fechaVencimientoHasta.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha de vencimiento hasta debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaVencimientoHasta"
        });
      }

      if (filtros.fechaVencimiento) {
        filtros.fechaVencimiento.$lte = fechaVencimientoHasta;
      } else {
        filtros.fechaVencimiento = { $lte: fechaVencimientoHasta };
      }
    }

    if (value.montoMinimo) {
      const montoMinimo = parseFloat(value.montoMinimo);

      if (isNaN(montoMinimo) || montoMinimo < 0) {
        return res.status(400).json({
          message: "Monto mínimo inválido",
          details: "El monto mínimo debe ser un número positivo",
          field: "montoMinimo"
        });
      }

      filtros.total = { $gte: montoMinimo };
    }

    if (value.montoMaximo) {
      const montoMaximo = parseFloat(value.montoMaximo);

      if (isNaN(montoMaximo) || montoMaximo < 0) {
        return res.status(400).json({
          message: "Monto máximo inválido",
          details: "El monto máximo debe ser un número positivo",
          field: "montoMaximo"
        });
      }

      if (filtros.total) {
        filtros.total.$lte = montoMaximo;
      } else {
        filtros.total = { $lte: montoMaximo };
      }
    }

        if (value.fechaEmisionDesde && value.fechaEmisionHasta) {
      const desde = new Date(value.fechaEmisionDesde);
      const hasta = new Date(value.fechaEmisionHasta);
      if (desde > hasta) {
        return res.status(400).json({
          message: "Rango de fechas inválido",
          details: "La fecha de emisión desde debe ser anterior a la fecha hasta"
        });
      }
    }

    if (value.fechaVencimientoDesde && value.fechaVencimientoHasta) {
      const desde = new Date(value.fechaVencimientoDesde);
      const hasta = new Date(value.fechaVencimientoHasta);
      if (desde > hasta) {
        return res.status(400).json({
          message: "Rango de fechas inválido",
          details: "La fecha de vencimiento desde debe ser anterior a la fecha hasta"
        });
      }
    }

    if (value.montoMinimo && value.montoMaximo) {
      const min = parseFloat(value.montoMinimo);
      const max = parseFloat(value.montoMaximo);
      if (min > max) {
        return res.status(400).json({
          message: "Rango de montos inválido",
          details: "El monto mínimo debe ser menor o igual al monto máximo"
        });
      }
    }

    const facturas = await getFacturas(filtros);
    res.status(200).json(facturas);
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
      message: "Error al filtrar facturas",
      details: error.message
    });
  }
};

module.exports = {
  getFacturasController,
  getFacturaByIdController,
  getFacturaByNumeroController,
  getFacturasByUsuarioController,
  getFacturasPorEstadoController,
  getFacturasVencidasController,
  getFacturasPorRangoFechasController,
  createFacturaController,
  updateFacturaController,
  deleteFacturaController,
  marcarFacturaComoCanceladaController,
  agregarPagoFacturaController,
  actualizarPdfUrlController,
  getFacturasPorRangoMontoController,
  filtrarFacturasController
};