const SalaReunion = require("../models/salaReunion.model");

const getSalasReunion = async (filtros = {}) => {
  return await SalaReunion.find(filtros)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const findSalaReunionById = async (id) => {
  return await SalaReunion.findById(id)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const findSalaReunionByCodigo = async (codigo) => {
  return await SalaReunion.findOne({ codigo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getSalasByEdificio = async (edificioId) => {
  return await SalaReunion.find({ 'ubicacion.edificioId': edificioId })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getSalasByCapacidad = async (capacidadMinima) => {
  return await SalaReunion.find({ capacidad: { $gte: capacidadMinima } })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getSalasByConfiguracion = async (configuracion) => {
  return await SalaReunion.find({ configuracion })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getSalasByEquipamiento = async (tipoEquipamiento) => {
  return await SalaReunion.find({ 'equipamiento.tipo': tipoEquipamiento })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getSalasByPropietario = async (propietarioId) => {
  return await SalaReunion.find({ propietarioId })
    .populate('ubicacion.edificioId')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getSalasByRangoPrecio = async (precioMin, precioMax, tipoPrecio = 'porHora') => {
  const query = {};
  query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };
  
  return await SalaReunion.find(query)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const createSalaReunion = async (salaData) => {
  const newSala = new SalaReunion(salaData);
  return await newSala.save();
};

const updateSalaReunion = async (id, payload) => {
  return await SalaReunion.findByIdAndUpdate(id, payload, { new: true });
};

const deleteSalaReunion = async (id) => {
  return await SalaReunion.findByIdAndDelete(id);
};

const cambiarEstadoSala = async (id, nuevoEstado) => {
  return await SalaReunion.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
};

const agregarEquipamiento = async (id, equipamiento) => {
  return await SalaReunion.findByIdAndUpdate(
    id,
    { $push: { equipamiento } },
    { new: true }
  );
};

const eliminarEquipamiento = async (id, equipamientoId) => {
  return await SalaReunion.findByIdAndUpdate(
    id,
    { $pull: { equipamiento: { _id: equipamientoId } } },
    { new: true }
  );
};

const actualizarPrecios = async (id, precios) => {
  return await SalaReunion.findByIdAndUpdate(
    id,
    { precios },
    { new: true }
  );
};

const getSalasDisponibles = async (fecha, horaInicio, horaFin) => {
  // Esta función es más compleja, necesitaría integrarse con el repository de Disponibilidad
  // para verificar las franjas horarias disponibles
  const filtrosBase = { 
    estado: 'disponible',
    activo: true
  };
  
  return await SalaReunion.find(filtrosBase)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

module.exports = {
  getSalasReunion,
  findSalaReunionById,
  findSalaReunionByCodigo,
  getSalasByEdificio,
  getSalasByCapacidad,
  getSalasByConfiguracion,
  getSalasByEquipamiento,
  getSalasByPropietario,
  getSalasByRangoPrecio,
  createSalaReunion,
  updateSalaReunion,
  deleteSalaReunion,
  cambiarEstadoSala,
  agregarEquipamiento,
  eliminarEquipamiento,
  actualizarPrecios,
  getSalasDisponibles
};