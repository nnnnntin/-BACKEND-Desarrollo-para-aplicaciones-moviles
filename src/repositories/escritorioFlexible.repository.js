const EscritorioFlexible = require("../models/escritorioFlexible.model");

const getEscritoriosFlexibles = async (filtros = {}) => {
  return await EscritorioFlexible.find(filtros)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const findEscritorioFlexibleById = async (id) => {
  return await EscritorioFlexible.findById(id)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const findEscritorioFlexibleByCodigo = async (codigo) => {
  return await EscritorioFlexible.findOne({ codigo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEscritoriosByEdificio = async (edificioId) => {
  return await EscritorioFlexible.find({ 'ubicacion.edificioId': edificioId })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEscritoriosByTipo = async (tipo) => {
  return await EscritorioFlexible.find({ tipo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEscritoriosByZona = async (edificioId, piso, zona) => {
  const filtros = {
    'ubicacion.edificioId': edificioId
  };
  
  if (piso !== undefined) {
    filtros['ubicacion.piso'] = piso;
  }
  
  if (zona) {
    filtros['ubicacion.zona'] = zona;
  }
  
  return await EscritorioFlexible.find(filtros)
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEscritoriosByAmenidades = async (tipoAmenidad) => {
  return await EscritorioFlexible.find({ 'amenidades.tipo': tipoAmenidad })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEscritoriosByPropietario = async (propietarioId) => {
  return await EscritorioFlexible.find({ propietarioId })
    .populate('ubicacion.edificioId')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEscritoriosByRangoPrecio = async (precioMin, precioMax, tipoPrecio = 'porDia') => {
  const query = {};
  query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };
  
  return await EscritorioFlexible.find(query)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const createEscritorioFlexible = async (escritorioData) => {
  const newEscritorio = new EscritorioFlexible(escritorioData);
  return await newEscritorio.save();
};

const updateEscritorioFlexible = async (id, payload) => {
  return await EscritorioFlexible.findByIdAndUpdate(id, payload, { new: true });
};

const deleteEscritorioFlexible = async (id) => {
  return await EscritorioFlexible.findByIdAndDelete(id);
};

const cambiarEstadoEscritorio = async (id, nuevoEstado) => {
  return await EscritorioFlexible.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
};

const agregarAmenidad = async (id, amenidad) => {
  return await EscritorioFlexible.findByIdAndUpdate(
    id,
    { $push: { amenidades: amenidad } },
    { new: true }
  );
};

const eliminarAmenidad = async (id, amenidadId) => {
  return await EscritorioFlexible.findByIdAndUpdate(
    id,
    { $pull: { amenidades: { _id: amenidadId } } },
    { new: true }
  );
};

const actualizarPrecios = async (id, precios) => {
  return await EscritorioFlexible.findByIdAndUpdate(
    id,
    { precios },
    { new: true }
  );
};

const getEscritoriosDisponibles = async (fecha) => {
  // Esta función es más compleja, necesitaría integrarse con el repository de Disponibilidad
  // para verificar las franjas horarias disponibles
  const filtrosBase = { 
    estado: 'disponible',
    activo: true
  };
  
  return await EscritorioFlexible.find(filtrosBase)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

module.exports = {
  getEscritoriosFlexibles,
  findEscritorioFlexibleById,
  findEscritorioFlexibleByCodigo,
  getEscritoriosByEdificio,
  getEscritoriosByTipo,
  getEscritoriosByZona,
  getEscritoriosByAmenidades,
  getEscritoriosByPropietario,
  getEscritoriosByRangoPrecio,
  createEscritorioFlexible,
  updateEscritorioFlexible,
  deleteEscritorioFlexible,
  cambiarEstadoEscritorio,
  agregarAmenidad,
  eliminarAmenidad,
  actualizarPrecios,
  getEscritoriosDisponibles
};