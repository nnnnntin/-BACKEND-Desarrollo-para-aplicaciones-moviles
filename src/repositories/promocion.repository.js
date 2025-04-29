const Promocion = require("../models/promocion.model");

const getPromociones = async (filtros = {}) => {
  return await Promocion.find(filtros)
    .sort({ fechaInicio: -1 });
};

const findPromocionById = async (id) => {
  return await Promocion.findById(id);
};

const findPromocionByCodigo = async (codigo) => {
  return await Promocion.findOne({ codigo });
};

const getPromocionesActivas = async () => {
  const fechaActual = new Date();
  
  return await Promocion.find({
    fechaInicio: { $lte: fechaActual },
    fechaFin: { $gte: fechaActual },
    activo: true
  })
    .sort({ fechaFin: 1 });
};

const getPromocionesPorTipo = async (tipo) => {
  return await Promocion.find({ tipo, activo: true })
    .sort({ fechaInicio: -1 });
};

const getPromocionesPorEntidad = async (entidad, entidadId = null) => {
  const query = {
    'aplicableA.entidad': entidad,
    activo: true
  };
  
  if (entidadId) {
    query['aplicableA.ids'] = entidadId;
  }
  
  return await Promocion.find(query)
    .sort({ fechaInicio: -1 });
};

const getPromocionesPorRangoDeFechas = async (fechaInicio, fechaFin) => {
  return await Promocion.find({
    $or: [
      { fechaInicio: { $gte: fechaInicio, $lte: fechaFin } },
      { fechaFin: { $gte: fechaInicio, $lte: fechaFin } },
      {
        $and: [
          { fechaInicio: { $lte: fechaInicio } },
          { fechaFin: { $gte: fechaFin } }
        ]
      }
    ],
    activo: true
  })
    .sort({ fechaInicio: -1 });
};

const createPromocion = async (promocionData) => {
  const newPromocion = new Promocion(promocionData);
  return await newPromocion.save();
};

const updatePromocion = async (id, payload) => {
  return await Promocion.findByIdAndUpdate(id, payload, { new: true });
};

const deletePromocion = async (id) => {
    return await Promocion.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
};

const activarPromocion = async (id) => {
  return await Promocion.findByIdAndUpdate(
    id,
    { activo: true },
    { new: true }
  );
};

const incrementarUsos = async (id) => {
  return await Promocion.findByIdAndUpdate(
    id,
    { $inc: { usosActuales: 1 } },
    { new: true }
  );
};

const validarPromocion = async (codigo, usuarioId, entidadTipo, entidadId) => {
  const fechaActual = new Date();
  
    const promocion = await Promocion.findOne({
    codigo,
    fechaInicio: { $lte: fechaActual },
    fechaFin: { $gte: fechaActual },
    activo: true
  });
  
  if (!promocion) {
    return { valido: false, mensaje: 'Código de promoción inválido o expirado' };
  }
  
    if (promocion.aplicableA && promocion.aplicableA.entidad) {
    if (promocion.aplicableA.entidad !== entidadTipo) {
      return { valido: false, mensaje: 'Esta promoción no aplica para este tipo de reserva' };
    }
    
    if (
      promocion.aplicableA.ids && 
      promocion.aplicableA.ids.length > 0 && 
      !promocion.aplicableA.ids.includes(entidadId)
    ) {
      return { valido: false, mensaje: 'Esta promoción no aplica para esta entidad específica' };
    }
  }
  
    if (promocion.limiteCupos && promocion.usosActuales >= promocion.limiteCupos) {
    return { valido: false, mensaje: 'Esta promoción ha alcanzado su límite de usos' };
  }
  
    
  return { 
    valido: true, 
    promocion,
    mensaje: 'Promoción válida' 
  };
};

const getPromocionesProximasAExpirar = async (diasRestantes = 7) => {
  const fechaActual = new Date();
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasRestantes);
  
  return await Promocion.find({
    fechaFin: { $gte: fechaActual, $lte: fechaLimite },
    activo: true
  })
    .sort({ fechaFin: 1 });
};

const actualizarAplicabilidad = async (id, entidad, ids) => {
  return await Promocion.findByIdAndUpdate(
    id,
    { 
      'aplicableA.entidad': entidad,
      'aplicableA.ids': ids
    },
    { new: true }
  );
};

module.exports = {
  getPromociones,
  findPromocionById,
  findPromocionByCodigo,
  getPromocionesActivas,
  getPromocionesPorTipo,
  getPromocionesPorEntidad,
  getPromocionesPorRangoDeFechas,
  createPromocion,
  updatePromocion,
  deletePromocion,
  activarPromocion,
  incrementarUsos,
  validarPromocion,
  getPromocionesProximasAExpirar,
  actualizarAplicabilidad
};