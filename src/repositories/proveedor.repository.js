const Proveedor = require("../models/proveedor.model");

const getProveedores = async (filtros = {}) => {
  return await Proveedor.find(filtros)
    .populate('serviciosOfrecidos');
};

const findProveedorById = async (id) => {
  return await Proveedor.findById(id)
    .populate('serviciosOfrecidos');
};

const getProveedoresByTipo = async (tipo) => {
  return await Proveedor.find({ tipo, activo: true });
};

const getProveedoresVerificados = async () => {
  return await Proveedor.find({ verificado: true, activo: true });
};

const createProveedor = async (proveedorData) => {
  const newProveedor = new Proveedor(proveedorData);
  return await newProveedor.save();
};

const updateProveedor = async (id, payload) => {
  return await Proveedor.findByIdAndUpdate(id, payload, { new: true });
};

const deleteProveedor = async (id) => {
    return await Proveedor.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
};

const activarProveedor = async (id) => {
  return await Proveedor.findByIdAndUpdate(
    id,
    { activo: true },
    { new: true }
  );
};

const verificarProveedor = async (id) => {
  return await Proveedor.findByIdAndUpdate(
    id,
    { verificado: true },
    { new: true }
  );
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  return await Proveedor.findByIdAndUpdate(
    id,
    { calificacionPromedio: nuevaCalificacion },
    { new: true }
  );
};

const agregarServicio = async (id, servicioId) => {
  return await Proveedor.findByIdAndUpdate(
    id,
    { $addToSet: { serviciosOfrecidos: servicioId } },
    { new: true }
  );
};

const eliminarServicio = async (id, servicioId) => {
  return await Proveedor.findByIdAndUpdate(
    id,
    { $pull: { serviciosOfrecidos: servicioId } },
    { new: true }
  );
};

const actualizarContacto = async (id, contacto) => {
  return await Proveedor.findByIdAndUpdate(
    id,
    { contacto },
    { new: true }
  );
};

const actualizarMetodoPago = async (id, metodoPago) => {
  return await Proveedor.findByIdAndUpdate(
    id,
    { metodoPago },
    { new: true }
  );
};

const getProveedoresPorCalificacion = async (calificacionMinima = 4) => {
  return await Proveedor.find({
    calificacionPromedio: { $gte: calificacionMinima },
    activo: true
  })
    .populate('serviciosOfrecidos')
    .sort({ calificacionPromedio: -1 });
};

const getProveedoresConMasServicios = async (limite = 5) => {
  return await Proveedor.aggregate([
    { $match: { activo: true } },
    { $project: { nombre: 1, tipo: 1, numeroServicios: { $size: '$serviciosOfrecidos' } } },
    { $sort: { numeroServicios: -1 } },
    { $limit: limite }
  ]);
};

module.exports = {
  getProveedores,
  findProveedorById,
  getProveedoresByTipo,
  getProveedoresVerificados,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  activarProveedor,
  verificarProveedor,
  actualizarCalificacion,
  agregarServicio,
  eliminarServicio,
  actualizarContacto,
  actualizarMetodoPago,
  getProveedoresPorCalificacion,
  getProveedoresConMasServicios
};