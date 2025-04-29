const Factura = require("../models/factura.model");

const getFacturas = async (filtros = {}) => {
  return await Factura.find(filtros)
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ fechaEmision: -1 });
};

const findFacturaById = async (id) => {
  return await Factura.findById(id)
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds');
};

const findFacturaByNumero = async (numeroFactura) => {
  return await Factura.findOne({ numeroFactura })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds');
};

const getFacturasByUsuario = async (usuarioId) => {
  return await Factura.find({ usuarioId })
    .populate('pagosIds')
    .sort({ fechaEmision: -1 });
};

const getFacturasPorEstado = async (estado) => {
  return await Factura.find({ estado })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ fechaEmision: -1 });
};

const getFacturasVencidas = async () => {
  const fechaActual = new Date();
  
  return await Factura.find({
    fechaVencimiento: { $lt: fechaActual },
    estado: 'pendiente'
  })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ fechaVencimiento: 1 });
};

const getFacturasPorRangoFechas = async (fechaInicio, fechaFin) => {
  return await Factura.find({
    fechaEmision: { $gte: fechaInicio, $lte: fechaFin }
  })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ fechaEmision: -1 });
};

const createFactura = async (facturaData) => {
  const newFactura = new Factura(facturaData);
  return await newFactura.save();
};

const updateFactura = async (id, payload) => {
  return await Factura.findByIdAndUpdate(id, payload, { new: true });
};

const deleteFactura = async (id) => {
  return await Factura.findByIdAndDelete(id);
};

const marcarFacturaComoCancelada = async (id, motivo = '') => {
  return await Factura.findByIdAndUpdate(
    id,
    {
      estado: 'cancelada',
      motivoCancelacion: motivo
    },
    { new: true }
  );
};

const agregarPagoFactura = async (id, pagoId) => {
  return await Factura.findByIdAndUpdate(
    id,
    { $addToSet: { pagosIds: pagoId } },
    { new: true }
  );
};

const actualizarPdfUrl = async (id, pdfUrl) => {
  return await Factura.findByIdAndUpdate(
    id,
    { pdfUrl },
    { new: true }
  );
};

const getFacturasPorRangoMonto = async (montoMin, montoMax) => {
  return await Factura.find({
    total: { $gte: montoMin, $lte: montoMax }
  })
    .populate('usuarioId', 'nombre email')
    .populate('pagosIds')
    .sort({ total: -1 });
};

module.exports = {
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
  getFacturasPorRangoMonto
};