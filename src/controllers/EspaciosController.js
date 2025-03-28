const { 
    getEspacios, 
    createEspacio, 
    findEspacio, 
    updateEspacio, 
    deleteEspacio 
  } = require('../storage/EspaciosStorage');
  
  exports.obtenerEspacios = (req, res) => {
    const { nombre } = req.query;
    let resultado = getEspacios();
    if (nombre) {
      resultado = resultado.filter(espacio =>
        espacio.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
    }
    res.status(200).json(resultado);
  };
  
  exports.obtenerEspacioPorId = (req, res) => {
    const { id } = req.params;
    const espacio = findEspacio(id);
    if (espacio) {
      res.status(200).json(espacio);
    } else {
      res.status(404).json({ message: "Espacio no encontrado" });
    }
  };
  
  exports.crearEspacio = (req, res) => {
    const { nombre, ubicacion, capacidad } = req.body;
    createEspacio(nombre, ubicacion, capacidad);
    res.status(201).json({ message: "Espacio creado correctamente" });
  };
  
  exports.actualizarEspacio = (req, res) => {
    const { id } = req.params;
    const espacio = updateEspacio(id, req.body);
    if (espacio) {
      res.status(200).json(espacio);
    } else {
      res.status(404).json({ message: "Espacio no encontrado" });
    }
  };
  
  exports.eliminarEspacio = (req, res) => {
    const { id } = req.params;
    const eliminado = deleteEspacio(id);
    if (eliminado) {
      res.status(200).json({ message: "Espacio eliminado" });
    } else {
      res.status(404).json({ message: "Espacio no encontrado" });
    }
  };
  