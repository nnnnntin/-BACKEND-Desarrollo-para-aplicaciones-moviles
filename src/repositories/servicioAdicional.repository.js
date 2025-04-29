const ServicioAdicional = require("../models/servicioAdicional.model");

const getServiciosAdicionales = async (filtros = {}) => {
  return await ServicioAdicional.find(filtros)
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
};

const findServicioAdicionalById = async (id) => {
  return await ServicioAdicional.findById(id)
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
};

const getServiciosByTipo = async (tipo) => {
  return await ServicioAdicional.find({ tipo, activo: true })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
};

const getServiciosByProveedor = async (proveedorId) => {
  return await ServicioAdicional.find({ proveedorId, activo: true })
    .populate('espaciosDisponibles');
};

const getServiciosByEspacio = async (espacioId) => {
  return await ServicioAdicional.find({ 
    espaciosDisponibles: espacioId,
    activo: true
  })
    .populate('proveedorId', 'nombre contacto');
};

const getServiciosByRangoPrecio = async (precioMin, precioMax) => {
  return await ServicioAdicional.find({
    precio: { $gte: precioMin, $lte: precioMax },
    activo: true
  })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
};

const getServiciosByUnidadPrecio = async (unidadPrecio) => {
  return await ServicioAdicional.find({ unidadPrecio, activo: true })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
};

const getServiciosDisponiblesEnFecha = async (fecha, diaDeSemanaNombre) => {
    return await ServicioAdicional.find({
    'disponibilidad.diasDisponibles': diaDeSemanaNombre,
    activo: true
  })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
};

const createServicioAdicional = async (servicioData) => {
  const newServicio = new ServicioAdicional(servicioData);
  return await newServicio.save();
};

const updateServicioAdicional = async (id, payload) => {
  return await ServicioAdicional.findByIdAndUpdate(id, payload, { new: true });
};

const deleteServicioAdicional = async (id) => {
    return await ServicioAdicional.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
};

const activarServicioAdicional = async (id) => {
  return await ServicioAdicional.findByIdAndUpdate(
    id,
    { activo: true },
    { new: true }
  );
};

const asignarEspacio = async (id, espacioId) => {
  return await ServicioAdicional.findByIdAndUpdate(
    id,
    { $addToSet: { espaciosDisponibles: espacioId } },
    { new: true }
  );
};

const eliminarEspacio = async (id, espacioId) => {
  return await ServicioAdicional.findByIdAndUpdate(
    id,
    { $pull: { espaciosDisponibles: espacioId } },
    { new: true }
  );
};

const getServiciosConAprobacion = async () => {
  return await ServicioAdicional.find({ 
    requiereAprobacion: true,
    activo: true
  })
    .populate('proveedorId', 'nombre contacto')
    .populate('espaciosDisponibles');
};

module.exports = {
  getServiciosAdicionales,
  findServicioAdicionalById,
  getServiciosByTipo,
  getServiciosByProveedor,
  getServiciosByEspacio,
  getServiciosByRangoPrecio,
  getServiciosByUnidadPrecio,
  getServiciosDisponiblesEnFecha,
  createServicioAdicional,
  updateServicioAdicional,
  deleteServicioAdicional,
  activarServicioAdicional,
  asignarEspacio,
  eliminarEspacio,
  getServiciosConAprobacion
};