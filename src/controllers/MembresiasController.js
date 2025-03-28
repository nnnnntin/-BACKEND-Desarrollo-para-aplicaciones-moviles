const { 
    getMembresias, 
    createMembresia, 
    findMembresia, 
    updateMembresia, 
    deleteMembresia 
  } = require('../storage/MembresiasStorage');
  
  exports.obtenerMembresias = (req, res) => {
    res.status(200).json(getMembresias());
  };
  
  exports.obtenerMembresiaPorId = (req, res) => {
    const { id } = req.params;
    const membresia = findMembresia(id);
    if (membresia) {
      res.status(200).json(membresia);
    } else {
      res.status(404).json({ message: "Membresía no encontrada" });
    }
  };
  
  exports.crearMembresia = (req, res) => {
    const { tipo, beneficios, precio } = req.body;
    createMembresia(tipo, beneficios, precio);
    res.status(201).json({ message: "Membresía creada correctamente" });
  };
  
  exports.actualizarMembresia = (req, res) => {
    const { id } = req.params;
    const membresia = updateMembresia(id, req.body);
    if (membresia) {
      res.status(200).json(membresia);
    } else {
      res.status(404).json({ message: "Membresía no encontrada" });
    }
  };
  
  exports.eliminarMembresia = (req, res) => {
    const { id } = req.params;
    const eliminado = deleteMembresia(id);
    if (eliminado) {
      res.status(200).json({ message: "Membresía eliminada" });
    } else {
      res.status(404).json({ message: "Membresía no encontrada" });
    }
  };
  