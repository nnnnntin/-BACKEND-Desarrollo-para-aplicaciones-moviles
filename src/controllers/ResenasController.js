const { 
    getResenas, 
    createResena, 
    findResena, 
    updateResena, 
    deleteResena 
  } = require('../storage/ResenasStorage');
  
  exports.obtenerResenas = (req, res) => {
    res.status(200).json(getResenas());
  };
  
  exports.obtenerResenaPorId = (req, res) => {
    const { id } = req.params;
    const resena = findResena(id);
    if (resena) {
      res.status(200).json(resena);
    } else {
      res.status(404).json({ message: "Reseña no encontrada" });
    }
  };
  
  exports.crearResena = (req, res) => {
    const { idUsuario, comentario, calificacion } = req.body;
    createResena(idUsuario, comentario, calificacion);
    res.status(201).json({ message: "Reseña creada correctamente" });
  };
  
  exports.actualizarResena = (req, res) => {
    const { id } = req.params;
    const resena = updateResena(id, req.body);
    if (resena) {
      res.status(200).json(resena);
    } else {
      res.status(404).json({ message: "Reseña no encontrada" });
    }
  };
  
  exports.eliminarResena = (req, res) => {
    const { id } = req.params;
    const eliminado = deleteResena(id);
    if (eliminado) {
      res.status(200).json({ message: "Reseña eliminada" });
    } else {
      res.status(404).json({ message: "Reseña no encontrada" });
    }
  };
  