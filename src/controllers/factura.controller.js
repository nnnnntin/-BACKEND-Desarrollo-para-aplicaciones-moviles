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
    const facturas = await getFacturasByUsuario(usuarioId);
    res.status(200).json(facturas);
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de usuario inválido",
        details: `El formato del ID '${usuarioId}' no es válido`
      });
    }

    if (error.message && (error.message.includes('no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No existe un usuario con id: ${usuarioId}`
      });
    }

    res.status(500).json({
      message: "Error al obtener facturas del usuario",
      details: error.message
    });
  }
};

const getFacturasPorEstadoController = async (req, res) => {
  const { estado } = req.params;

  if (!['pendiente', 'pagada', 'vencida', 'cancelada'].includes(estado)) {
    return res.status(400).json({
      message: "Estado no válido",
      details: "El estado debe ser 'pendiente', 'pagada', 'vencida' o 'cancelada'"
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
    const factura = await createFactura(value);
    res.status(201).json({ message: "Factura creada correctamente", factura });
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

    if (error.message && (error.message.includes('usuario no encontrado') || error.message.includes('user not found'))) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: "El usuario especificado no existe"
      });
    }

    if (error.message && (error.message.includes('emisor no encontrado') || error.message.includes('issuer not found'))) {
      return res.status(404).json({
        message: "Emisor no encontrado",
        details: "El emisor especificado no existe"
      });
    }

    if (error.message && error.message.includes('items')) {
      return res.status(400).json({
        message: "Error en los items",
        details: error.message
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
    const factura = await updateFactura(id, value);
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

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación en modelo",
        details: errors
      });
    }

    if (error.message && error.message.includes('estado no modificable') || error.message.includes('status not modifiable')) {
      return res.status(400).json({
        message: "Estado no modificable",
        details: "No se puede modificar la factura en su estado actual"
      });
    }

    if (error.message && error.message.includes('items')) {
      return res.status(400).json({
        message: "Error en los items",
        details: error.message
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
    const factura = await deleteFactura(id);
    if (!factura) {
      return res.status(404).json({ message: `No se ha encontrado la factura con id: ${id}` });
    }
    res.status(200).json({ message: "Factura eliminada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de factura inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('no eliminable') || error.message.includes('cannot be deleted')) {
      return res.status(400).json({
        message: "Factura no eliminable",
        details: "No se puede eliminar una factura pagada o con pagos asociados"
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
    const factura = await marcarFacturaComoCancelada(id, motivo);
    if (!factura) {
      return res.status(404).json({ message: `No se ha encontrado la factura con id: ${id}` });
    }
    res.status(200).json({ message: "Factura marcada como cancelada", factura });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "ID de factura inválido",
        details: `El formato del ID '${id}' no es válido`
      });
    }

    if (error.message && error.message.includes('ya cancelada') || error.message.includes('already cancelled')) {
      return res.status(400).json({
        message: "Factura ya cancelada",
        details: "La factura ya se encuentra en estado cancelada"
      });
    }

    if (error.message && error.message.includes('pagada') || error.message.includes('paid')) {
      return res.status(400).json({
        message: "Factura pagada",
        details: "No se puede cancelar una factura pagada"
      });
    }

    if (error.message && error.message.includes('pagos asociados') || error.message.includes('associated payments')) {
      return res.status(400).json({
        message: "Factura con pagos",
        details: "No se puede cancelar una factura con pagos asociados"
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
    const factura = await agregarPagoFactura(id, pagoId);
    if (!factura) {
      return res.status(404).json({ message: `No se ha encontrado la factura con id: ${id}` });
    }
    res.status(200).json({ message: "Pago agregado a la factura", factura });
  } catch (error) {
    console.error(error);

    if (error.name === 'CastError') {
      const field = error.path === 'id' ? 'factura' : 'pago';
      return res.status(400).json({
        message: `ID de ${field} inválido`,
        details: `El formato del ID no es válido`
      });
    }

    if (error.message && error.message.includes('pago no encontrado') || error.message.includes('payment not found')) {
      return res.status(404).json({
        message: "Pago no encontrado",
        details: `No se encontró el pago con id: ${pagoId}`
      });
    }

    if (error.message && error.message.includes('ya vinculado') || error.message.includes('already linked')) {
      return res.status(400).json({
        message: "Pago ya vinculado",
        details: "El pago ya está vinculado a esta u otra factura"
      });
    }

    if (error.message && error.message.includes('cancelada') || error.message.includes('cancelled')) {
      return res.status(400).json({
        message: "Factura cancelada",
        details: "No se puede agregar un pago a una factura cancelada"
      });
    }

    if (error.message && error.message.includes('monto diferente') || error.message.includes('different amount')) {
      return res.status(400).json({
        message: "Monto de pago inválido",
        details: "El monto del pago no coincide con el saldo pendiente de la factura"
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

    const factura = await actualizarPdfUrl(id, pdfUrl);
    if (!factura) {
      return res.status(404).json({ message: `No se ha encontrado la factura con id: ${id}` });
    }
    res.status(200).json({ message: "URL de PDF actualizada", factura });
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

    if (value.usuarioId) filtros.usuarioId = value.usuarioId;
    if (value.emisorId) filtros.emisorId = value.emisorId;
    if (value.tipoEmisor) filtros.tipoEmisor = value.tipoEmisor;
    if (value.estado) filtros.estado = value.estado;

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