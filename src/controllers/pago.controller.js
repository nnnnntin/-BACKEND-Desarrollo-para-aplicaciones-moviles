const {
  getPagos,
  findPagoById,
  getPagosByUsuario,
  getPagosPorConcepto,
  getPagosPorEstado,
  getPagosPorEntidad,
  createPago,
  updatePago,
  deletePago,
  cambiarEstadoPago,
  completarPago,
  reembolsarPago,
  vincularFactura,
  getPagosPorRangoMontos
} = require("../repositories/pago.repository");
const {
  createPagoSchema,
  updatePagoSchema,
  filtrarPagosSchema,
  reembolsarPagoSchema
} = require("../routes/validations/pago.validation");

const { findUsuarioById } = require("../repositories/usuario.repository");
const { findReservaById } = require("../repositories/reserva.repository");
const { findMembresiaById } = require("../repositories/membresia.repository");
const { findFacturaById } = require("../repositories/factura.repository");

const ENTIDAD_RELACIONADA_MAP = {
  'reserva': findReservaById,
  'membresia': findMembresiaById
};

const ENTIDADES_RELACIONADAS_VALIDAS = ['reserva', 'membresia'];
const CONCEPTOS_PAGO_VALIDOS = ['reserva', 'membresia', 'servicio', 'multa', 'otro'];
const ESTADOS_PAGO_VALIDOS = ['pendiente', 'completado', 'fallido', 'reembolsado'];
const TIPOS_ENTIDAD_VALIDOS = ['reserva', 'membresia', 'oficina', 'factura', 'servicio'];

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
 * Valida que una entidad relacionada existe
 * @param {string} tipoEntidad - Tipo de entidad
 * @param {string} entidadId - ID de la entidad
 * @returns {Promise<Object>} - { valid: boolean, entity: Object|null, message: string }
 */
const validarEntidadRelacionadaExiste = async (tipoEntidad, entidadId) => {
  const findEntidadById = ENTIDAD_RELACIONADA_MAP[tipoEntidad];
  
  if (!findEntidadById) {
    return {
      valid: false,
      entity: null,
      message: `Tipo de entidad no válido: ${tipoEntidad}. Debe ser una de: ${ENTIDADES_RELACIONADAS_VALIDAS.join(', ')}`
    };
  }

  try {
    const entidad = await findEntidadById(entidadId);
    
    if (!entidad) {
      return {
        valid: false,
        entity: null,
        message: `No se encontró la ${tipoEntidad} con ID: ${entidadId}`
      };
    }

    return {
      valid: true,
      entity: entidad,
      message: 'Entidad válida'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        entity: null,
        message: `Formato de ID inválido para ${tipoEntidad}: ${entidadId}`
      };
    }
    throw error;
  }
};

/**
 * Valida que una factura existe
 * @param {string} facturaId - ID de la factura a validar
 * @returns {Promise<Object>} - { valid: boolean, factura: Object|null, message: string }
 */
const validarFacturaExiste = async (facturaId) => {
  try {
    const factura = await findFacturaById(facturaId);
    
    if (!factura) {
      return {
        valid: false,
        factura: null,
        message: `No se encontró la factura con ID: ${facturaId}`
      };
    }

    return {
      valid: true,
      factura: factura,
      message: 'Factura válida'
    };
  } catch (error) {
    if (error.name === 'CastError') {
      return {
        valid: false,
        factura: null,
        message: `Formato de ID de factura inválido: ${facturaId}`
      };
    }
    throw error;
  }
};

const getPagosController = async (req, res) => {
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
    const pagos = await getPagos(filtros, skipNum, limitNum);
    return res.status(200).json(pagos);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener los pagos",
      details: error.message
    });
  }
};

const getPagoByIdController = async (req, res) => {
  const { id } = req.params;
  
  try {
    const pago = await findPagoById(id);
    if (!pago) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${id}`
      });
    }
    res.status(200).json(pago);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de pago inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al buscar el pago",
      details: error.message
    });
  }
};

const getPagosByUsuarioController = async (req, res) => {
  const { usuarioId } = req.params;
  
  try {
        const validacionUsuario = await validarUsuarioExiste(usuarioId);
    if (!validacionUsuario.valid) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: validacionUsuario.message
      });
    }

    const pagos = await getPagosByUsuario(usuarioId);
    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener pagos del usuario",
      details: error.message
    });
  }
};

const getPagosPorConceptoController = async (req, res) => {
  const { concepto } = req.params;
  
  try {
    if (!CONCEPTOS_PAGO_VALIDOS.includes(concepto)) {
      return res.status(400).json({
        message: "Concepto de pago inválido",
        details: `Los conceptos válidos son: ${CONCEPTOS_PAGO_VALIDOS.join(', ')}`,
        field: "concepto"
      });
    }

    const pagos = await getPagosPorConcepto(concepto);
    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener pagos por concepto",
      details: error.message
    });
  }
};

const getPagosPorEstadoController = async (req, res) => {
  const { estado } = req.params;
  
  try {
    if (!ESTADOS_PAGO_VALIDOS.includes(estado)) {
      return res.status(400).json({
        message: "Estado de pago inválido",
        details: `Los estados válidos son: ${ESTADOS_PAGO_VALIDOS.join(', ')}`,
        field: "estado"
      });
    }

    const pagos = await getPagosPorEstado(estado);
    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener pagos por estado",
      details: error.message
    });
  }
};

const getPagosPorEntidadController = async (req, res) => {
  const { tipoEntidad, entidadId } = req.params;

  if (!TIPOS_ENTIDAD_VALIDOS.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `Los tipos de entidad válidos son: ${TIPOS_ENTIDAD_VALIDOS.join(', ')}`,
      field: "tipoEntidad"
    });
  }

  try {
    const pagos = await getPagosPorEntidad(tipoEntidad, entidadId);
    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de entidad inválido",
        details: `El formato del ID '${entidadId}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al obtener pagos por entidad",
      details: error.message
    });
  }
};

const createPagoController = async (req, res) => {
  const { error, value } = createPagoSchema.validate(req.body);
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
        details: validacionUsuario.message,
        field: "usuarioId"
      });
    }

        if (value.entidadRelacionada && value.entidadRelacionada.tipo && value.entidadRelacionada.id) {
      const { tipo, id: entidadId } = value.entidadRelacionada;
      const validacionEntidad = await validarEntidadRelacionadaExiste(tipo, entidadId);
      if (!validacionEntidad.valid) {
        return res.status(404).json({
          message: "Entidad relacionada no encontrada",
          details: validacionEntidad.message,
          field: "entidadRelacionada"
        });
      }
    }

        if (value.facturaId) {
      const validacionFactura = await validarFacturaExiste(value.facturaId);
      if (!validacionFactura.valid) {
        return res.status(404).json({
          message: "Factura no encontrada",
          details: validacionFactura.message,
          field: "facturaId"
        });
      }
    }

        if (value.monto && (isNaN(value.monto) || value.monto <= 0)) {
      return res.status(400).json({
        message: "Monto inválido",
        details: "El monto debe ser un número positivo",
        field: "monto"
      });
    }

    if (value.conceptoPago && !CONCEPTOS_PAGO_VALIDOS.includes(value.conceptoPago)) {
      return res.status(400).json({
        message: "Concepto de pago inválido",
        details: `Los conceptos válidos son: ${CONCEPTOS_PAGO_VALIDOS.join(', ')}`,
        field: "conceptoPago"
      });
    }

    if (value.estado && !ESTADOS_PAGO_VALIDOS.includes(value.estado)) {
      return res.status(400).json({
        message: "Estado de pago inválido",
        details: `Los estados válidos son: ${ESTADOS_PAGO_VALIDOS.join(', ')}`,
        field: "estado"
      });
    }

    const pago = await createPago(value);
    res.status(201).json({ 
      message: "Pago creado correctamente", 
      pago,
      usuarioValidado: {
        id: validacionUsuario.user._id,
        nombre: validacionUsuario.user.nombre,
        email: validacionUsuario.user.email
      }
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    res.status(500).json({
      message: "Error al crear el pago",
      details: error.message
    });
  }
};

const updatePagoController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updatePagoSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  try {
        const pagoExistente = await findPagoById(id);
    if (!pagoExistente) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${id}`
      });
    }

        if (value.usuarioId) {
      const validacionUsuario = await validarUsuarioExiste(value.usuarioId);
      if (!validacionUsuario.valid) {
        return res.status(404).json({
          message: "Usuario no encontrado",
          details: validacionUsuario.message,
          field: "usuarioId"
        });
      }
    }

        if (value.entidadRelacionada && value.entidadRelacionada.tipo && value.entidadRelacionada.id) {
      const { tipo, id: entidadId } = value.entidadRelacionada;
      const validacionEntidad = await validarEntidadRelacionadaExiste(tipo, entidadId);
      if (!validacionEntidad.valid) {
        return res.status(404).json({
          message: "Entidad relacionada no encontrada",
          details: validacionEntidad.message,
          field: "entidadRelacionada"
        });
      }
    }

        if (value.facturaId) {
      const validacionFactura = await validarFacturaExiste(value.facturaId);
      if (!validacionFactura.valid) {
        return res.status(404).json({
          message: "Factura no encontrada",
          details: validacionFactura.message,
          field: "facturaId"
        });
      }
    }

        if (value.monto && (isNaN(value.monto) || value.monto <= 0)) {
      return res.status(400).json({
        message: "Monto inválido",
        details: "El monto debe ser un número positivo",
        field: "monto"
      });
    }

    if (value.conceptoPago && !CONCEPTOS_PAGO_VALIDOS.includes(value.conceptoPago)) {
      return res.status(400).json({
        message: "Concepto de pago inválido",
        details: `Los conceptos válidos son: ${CONCEPTOS_PAGO_VALIDOS.join(', ')}`,
        field: "conceptoPago"
      });
    }

    if (value.estado && !ESTADOS_PAGO_VALIDOS.includes(value.estado)) {
      return res.status(400).json({
        message: "Estado de pago inválido",
        details: `Los estados válidos son: ${ESTADOS_PAGO_VALIDOS.join(', ')}`,
        field: "estado"
      });
    }

    const pago = await updatePago(id, value);
    res.status(200).json(pago);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de pago inválido",
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

    if (error.message && error.message.includes('pago no modificable')) {
      return res.status(400).json({
        message: "Pago no modificable",
        details: "No se puede modificar un pago en su estado actual",
        field: "estado"
      });
    }

    res.status(500).json({
      message: "Error al actualizar el pago",
      details: error.message
    });
  }
};

const deletePagoController = async (req, res) => {
  const { id } = req.params;
  
  try {
    const pago = await deletePago(id);
    if (!pago) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${id}`
      });
    }
    res.status(200).json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de pago inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no eliminable') || error.message.includes('vinculado a factura'))) {
      return res.status(400).json({
        message: "Pago no eliminable",
        details: "No se puede eliminar un pago que ya está completado o vinculado a una factura"
      });
    }

    res.status(500).json({
      message: "Error al eliminar el pago",
      details: error.message
    });
  }
};

const cambiarEstadoPagoController = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({
      message: "Dato requerido",
      details: "Se requiere especificar un estado",
      field: "estado"
    });
  }

  if (!ESTADOS_PAGO_VALIDOS.includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: `El estado debe ser uno de: ${ESTADOS_PAGO_VALIDOS.join(', ')}`,
      field: "estado"
    });
  }

  try {
        const pagoExistente = await findPagoById(id);
    if (!pagoExistente) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${id}`
      });
    }

    const pago = await cambiarEstadoPago(id, estado);
    res.status(200).json({ 
      message: "Estado de pago actualizado correctamente", 
      pago 
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de pago inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('transición no permitida')) {
      return res.status(400).json({
        message: "Cambio de estado no permitido",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al cambiar el estado del pago",
      details: error.message
    });
  }
};

const completarPagoController = async (req, res) => {
  const { id } = req.params;
  const { comprobante } = req.body;

  if (!comprobante) {
    return res.status(400).json({
      message: "Dato requerido",
      details: "Se requiere un comprobante de pago",
      field: "comprobante"
    });
  }

  try {
        const pagoExistente = await findPagoById(id);
    if (!pagoExistente) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${id}`
      });
    }

    if (pagoExistente.estado !== 'pendiente') {
      return res.status(400).json({
        message: "Estado incorrecto",
        details: "Solo se pueden completar pagos en estado pendiente"
      });
    }

    const pago = await completarPago(id, comprobante);
    res.status(200).json({ 
      message: "Pago completado correctamente", 
      pago 
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de pago inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    res.status(500).json({
      message: "Error al completar el pago",
      details: error.message
    });
  }
};

const reembolsarPagoController = async (req, res) => {
  const { error, value } = reembolsarPagoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }

  const { pagoId, motivo, montoReembolso, metodoPago } = value;

  try {
        const pagoExistente = await findPagoById(pagoId);
    if (!pagoExistente) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${pagoId}`,
        field: "pagoId"
      });
    }

    if (pagoExistente.estado !== 'completado') {
      return res.status(400).json({
        message: "Estado incorrecto",
        details: "Solo se pueden reembolsar pagos en estado completado",
        field: "pagoId"
      });
    }

    if (montoReembolso && (isNaN(montoReembolso) || montoReembolso <= 0 || montoReembolso > pagoExistente.monto)) {
      return res.status(400).json({
        message: "Monto inválido",
        details: "El monto de reembolso debe ser un número positivo y no superior al monto original del pago",
        field: "montoReembolso"
      });
    }

    const pago = await reembolsarPago(pagoId, motivo);

    const reembolso = {
      pagoOriginalId: pagoId,
      monto: montoReembolso || pagoExistente.monto,
      motivo,
      metodoPago: metodoPago || pagoExistente.metodoPago,
      fecha: new Date()
    };

    res.status(200).json({
      message: "Pago reembolsado correctamente",
      pago,
      reembolso
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de pago inválido",
        details: `El formato del ID '${pagoId}' no es válido`
      });
    }

    if (error.message && error.message.includes('vinculado a factura')) {
      return res.status(400).json({
        message: "Pago vinculado a factura",
        details: "No se puede reembolsar un pago que está vinculado a una factura"
      });
    }

    res.status(500).json({
      message: "Error al reembolsar el pago",
      details: error.message
    });
  }
};

const vincularFacturaController = async (req, res) => {
  const { id } = req.params;
  const { facturaId } = req.body;

  if (!facturaId) {
    return res.status(400).json({
      message: "Dato requerido",
      details: "Se requiere un ID de factura",
      field: "facturaId"
    });
  }

  try {
        const pagoExistente = await findPagoById(id);
    if (!pagoExistente) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${id}`
      });
    }

        const validacionFactura = await validarFacturaExiste(facturaId);
    if (!validacionFactura.valid) {
      return res.status(404).json({
        message: "Factura no encontrada",
        details: validacionFactura.message,
        field: "facturaId"
      });
    }

        if (pagoExistente.facturaId) {
      return res.status(400).json({
        message: "Pago ya vinculado",
        details: "El pago ya está vinculado a una factura"
      });
    }

    if (pagoExistente.estado !== 'completado') {
      return res.status(400).json({
        message: "Estado incorrecto",
        details: "Solo se pueden vincular a facturas los pagos completados"
      });
    }

    const pago = await vincularFactura(id, facturaId);
    res.status(200).json({ 
      message: "Factura vinculada correctamente", 
      pago,
      facturaValidada: {
        id: validacionFactura.factura._id,
        numeroFactura: validacionFactura.factura.numeroFactura,
        estado: validacionFactura.factura.estado
      }
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Formato de ID inválido",
        details: "El formato de uno de los IDs no es válido"
      });
    }

    res.status(500).json({
      message: "Error al vincular la factura",
      details: error.message
    });
  }
};

const getPagosPorRangoMontosController = async (req, res) => {
  const { montoMinimo, montoMaximo } = req.query;
  
  if (
    montoMinimo === undefined ||
    montoMaximo === undefined ||
    isNaN(montoMinimo) ||
    isNaN(montoMaximo)
  ) {
    return res.status(400).json({
      message: "Parámetros inválidos",
      details: "Se requieren montoMinimo y montoMaximo (números ≥ 0)"
    });
  }

  const min = parseFloat(montoMinimo);
  const max = parseFloat(montoMaximo);
  
  if (min < 0 || max < 0) {
    return res.status(400).json({
      message: "Valores de monto inválidos",
      details: "Los montos deben ser positivos"
    });
  }
  
  if (min > max) {
    return res.status(400).json({
      message: "Rango de montos inválido",
      details: "montoMinimo debe ser ≤ montoMaximo"
    });
  }

  try {
    const pagos = await getPagosPorRangoMontos(min, max);
    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener pagos por rango de montos",
      details: error.message
    });
  }
};

const filtrarPagosController = async (req, res) => {
  const { error, value } = filtrarPagosSchema.validate(req.query);
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

    if (value.conceptoPago) {
      if (!CONCEPTOS_PAGO_VALIDOS.includes(value.conceptoPago)) {
        return res.status(400).json({
          message: "Concepto de pago inválido",
          details: `Los conceptos válidos son: ${CONCEPTOS_PAGO_VALIDOS.join(', ')}`,
          field: "conceptoPago"
        });
      }
      filtros.conceptoPago = value.conceptoPago;
    }

    if (value.estado) {
      if (!ESTADOS_PAGO_VALIDOS.includes(value.estado)) {
        return res.status(400).json({
          message: "Estado inválido",
          details: `Los estados válidos son: ${ESTADOS_PAGO_VALIDOS.join(', ')}`,
          field: "estado"
        });
      }
      filtros.estado = value.estado;
    }

    if (value.fechaDesde) {
      const fechaDesde = new Date(value.fechaDesde);
      if (isNaN(fechaDesde.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha 'desde' debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaDesde"
        });
      }
      filtros.fecha = { $gte: fechaDesde };
    }

    if (value.fechaHasta) {
      const fechaHasta = new Date(value.fechaHasta);
      if (isNaN(fechaHasta.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido",
          details: "La fecha 'hasta' debe tener un formato válido (YYYY-MM-DD o ISO)",
          field: "fechaHasta"
        });
      }

      if (filtros.fecha) {
        filtros.fecha.$lte = fechaHasta;
      } else {
        filtros.fecha = { $lte: fechaHasta };
      }
    }

    if (value.fechaDesde && value.fechaHasta) {
      const fechaDesde = new Date(value.fechaDesde);
      const fechaHasta = new Date(value.fechaHasta);

      if (fechaDesde > fechaHasta) {
        return res.status(400).json({
          message: "Rango de fechas inválido",
          details: "La fecha 'desde' debe ser anterior o igual a la fecha 'hasta'"
        });
      }
    }

    if (value.montoMinimo) {
      const montoMin = parseFloat(value.montoMinimo);
      if (isNaN(montoMin) || montoMin < 0) {
        return res.status(400).json({
          message: "Monto mínimo inválido",
          details: "El monto mínimo debe ser un número positivo",
          field: "montoMinimo"
        });
      }
      filtros.monto = { $gte: montoMin };
    }

    if (value.montoMaximo) {
      const montoMax = parseFloat(value.montoMaximo);
      if (isNaN(montoMax) || montoMax < 0) {
        return res.status(400).json({
          message: "Monto máximo inválido",
          details: "El monto máximo debe ser un número positivo",
          field: "montoMaximo"
        });
      }

      if (filtros.monto) {
        filtros.monto.$lte = montoMax;
      } else {
        filtros.monto = { $lte: montoMax };
      }
    }

    if (value.montoMinimo && value.montoMaximo) {
      const montoMin = parseFloat(value.montoMinimo);
      const montoMax = parseFloat(value.montoMaximo);

      if (montoMin > montoMax) {
        return res.status(400).json({
          message: "Rango de montos inválido",
          details: "El monto mínimo debe ser menor o igual al monto máximo"
        });
      }
    }

    const pagos = await getPagos(filtros);
    res.status(200).json(pagos);
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
      message: "Error al filtrar pagos",
      details: error.message
    });
  }
};

module.exports = {
  getPagosController,
  getPagoByIdController,
  getPagosByUsuarioController,
  getPagosPorConceptoController,
  getPagosPorEstadoController,
  getPagosPorEntidadController,
  createPagoController,
  updatePagoController,
  deletePagoController,
  cambiarEstadoPagoController,
  completarPagoController,
  reembolsarPagoController,
  vincularFacturaController,
  getPagosPorRangoMontosController,
  filtrarPagosController
};