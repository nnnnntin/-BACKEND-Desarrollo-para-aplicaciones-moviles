const { 
    getPagos, 
    createPago, 
    findPago, 
    updatePago, 
    deletePago 
  } = require('../storage/PagosStorage');
  
  exports.obtenerPagos = (req, res) => {
    res.status(200).json(getPagos());
  };
  
  exports.obtenerPagoPorId = (req, res) => {
    const { id } = req.params;
    const pago = findPago(id);
    if (pago) {
      res.status(200).json(pago);
    } else {
      res.status(404).json({ message: "Pago no encontrado" });
    }
  };
  
  exports.crearPago = (req, res) => {
    const { idUsuario, monto, fecha, metodo } = req.body;
    createPago(idUsuario, monto, fecha, metodo);
    res.status(201).json({ message: "Pago creado correctamente" });
  };
  
  exports.actualizarPago = (req, res) => {
    const { id } = req.params;
    const pago = updatePago(id, req.body);
    if (pago) {
      res.status(200).json(pago);
    } else {
      res.status(404).json({ message: "Pago no encontrado" });
    }
  };
  
  exports.eliminarPago = (req, res) => {
    const { id } = req.params;
    const eliminado = deletePago(id);
    if (eliminado) {
      res.status(200).json({ message: "Pago eliminado" });
    } else {
      res.status(404).json({ message: "Pago no encontrado" });
    }
  };
  