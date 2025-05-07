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
    console.error("[Controller] Error al obtener pagos", error);
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
    const pagos = await getPagosByUsuario(usuarioId);
    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('usuario no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No existe un usuario con id: ${usuarioId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener pagos del usuario",
      details: error.message
    });
  }
};

const getPagosPorConceptoController = async (req, res) => {
  const { concepto } = req.params;
  try {
    const conceptosValidos = ['reserva', 'membresia', 'servicio', 'multa', 'otro'];
    if (!conceptosValidos.includes(concepto)) {
      return res.status(400).json({
        message: "Concepto de pago inválido",
        details: `Los conceptos válidos son: ${conceptosValidos.join(', ')}`,
        field: "concepto"
      });
    }

    const pagos = await getPagosPorConcepto(concepto);
    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('concepto no válido')) {
      return res.status(400).json({
        message: "Concepto no válido",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener pagos por concepto",
      details: error.message
    });
  }
};

const getPagosPorEstadoController = async (req, res) => {
  const { estado } = req.params;
  try {
    const estadosValidos = ['pendiente', 'completado', 'fallido', 'reembolsado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        message: "Estado de pago inválido",
        details: `Los estados válidos son: ${estadosValidos.join(', ')}`,
        field: "estado"
      });
    }

    const pagos = await getPagosPorEstado(estado);
    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);

    if (error.message && error.message.includes('estado no válido')) {
      return res.status(400).json({
        message: "Estado no válido",
        details: error.message
      });
    }

    res.status(500).json({
      message: "Error al obtener pagos por estado",
      details: error.message
    });
  }
};

const getPagosPorEntidadController = async (req, res) => {
  const { tipoEntidad, entidadId } = req.params;

  const tiposEntidadValidos = ['reserva', 'membresia', 'oficina', 'factura', 'servicio'];
  if (!tiposEntidadValidos.includes(tipoEntidad)) {
    return res.status(400).json({
      message: "Tipo de entidad inválido",
      details: `Los tipos de entidad válidos son: ${tiposEntidadValidos.join(', ')}`,
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

    if (error.message && error.message.includes('entidad no encontrada')) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: `No existe una entidad de tipo ${tipoEntidad} con id: ${entidadId}`
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
    const pago = await createPago(value);
    res.status(201).json({ message: "Pago creado correctamente", pago });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    if (error.message && error.message.includes('usuario no encontrado')) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: "El usuario especificado no existe",
        field: "usuarioId"
      });
    }

    if (error.message && error.message.includes('entidad no encontrada')) {
      return res.status(404).json({
        message: "Entidad no encontrada",
        details: "La entidad relacionada no existe",
        field: "entidadId"
      });
    }

    if (error.message && error.message.includes('método de pago no válido')) {
      return res.status(400).json({
        message: "Método de pago inválido",
        details: error.message,
        field: "metodoPago"
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
    const pago = await updatePago(id, value);
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

    if (error.message && error.message.includes('usuario no encontrado')) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: "El usuario especificado no existe",
        field: "usuarioId"
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

  if (!['pendiente', 'completado', 'fallido', 'reembolsado'].includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: "El estado debe ser 'pendiente', 'completado', 'fallido' o 'reembolsado'",
      field: "estado"
    });
  }

  try {
    const pago = await cambiarEstadoPago(id, estado);
    if (!pago) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${id}`
      });
    }
    res.status(200).json({ message: "Estado de pago actualizado correctamente", pago });
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
    const pago = await completarPago(id, comprobante);
    if (!pago) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${id}`
      });
    }
    res.status(200).json({ message: "Pago completado correctamente", pago });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de pago inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('no está en estado pendiente')) {
      return res.status(400).json({
        message: "Estado incorrecto",
        details: "Solo se pueden completar pagos en estado pendiente"
      });
    }

    if (error.message && error.message.includes('comprobante inválido')) {
      return res.status(400).json({
        message: "Comprobante inválido",
        details: error.message,
        field: "comprobante"
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

    if (error.message && error.message.includes('método de pago no soporta reembolsos')) {
      return res.status(400).json({
        message: "Método de pago no compatible",
        details: "El método de pago original no soporta reembolsos automáticos",
        field: "metodoPago"
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
    const pago = await vincularFactura(id, facturaId);
    if (!pago) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se ha encontrado el pago con id: ${id}`
      });
    }
    res.status(200).json({ message: "Factura vinculada correctamente", pago });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      const field = error.path === 'id' ? 'pago' : 'factura';
      return res.status(400).json({
        message: `ID de ${field} inválido`,
        details: `El formato del ID no es válido`,
        field: field === 'pago' ? 'id' : 'facturaId'
      });
    }

    if (error.message && error.message.includes('factura no encontrada')) {
      return res.status(404).json({
        message: "Factura no encontrada",
        details: `No se ha encontrado la factura con id: ${facturaId}`,
        field: "facturaId"
      });
    }

    if (error.message && error.message.includes('ya vinculado')) {
      return res.status(400).json({
        message: "Pago ya vinculado",
        details: "El pago ya está vinculado a una factura"
      });
    }

    if (error.message && error.message.includes('no completado')) {
      return res.status(400).json({
        message: "Estado incorrecto",
        details: "Solo se pueden vincular a facturas los pagos completados"
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

    if (value.usuarioId) filtros.usuarioId = value.usuarioId;

    if (value.conceptoPago) {
      const conceptosValidos = ['reserva', 'membresia', 'servicio', 'multa', 'otro'];
      if (!conceptosValidos.includes(value.conceptoPago)) {
        return res.status(400).json({
          message: "Concepto de pago inválido",
          details: `Los conceptos válidos son: ${conceptosValidos.join(', ')}`,
          field: "conceptoPago"
        });
      }
      filtros.conceptoPago = value.conceptoPago;
    }

    if (value.estado) {
      const estadosValidos = ['pendiente', 'completado', 'fallido', 'reembolsado'];
      if (!estadosValidos.includes(value.estado)) {
        return res.status(400).json({
          message: "Estado inválido",
          details: `Los estados válidos son: ${estadosValidos.join(', ')}`,
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