const { 
    getReservas, 
    createReserva, 
    findReserva, 
    updateReserva, 
    deleteReserva 
  } = require('../storage/ReservasStorage');
  
  exports.obtenerReservas = (req, res) => {
    const { estado, fecha } = req.query;
    let resultado = getReservas();
    if (estado) {
      resultado = resultado.filter(reserva =>
        reserva.estado.toLowerCase() === estado.toLowerCase()
      );
    }
    if (fecha) {
      resultado = resultado.filter(reserva => reserva.fecha === fecha);
    }
    res.status(200).json(resultado);
  };
  
  exports.obtenerReservaPorId = (req, res) => {
    const { id } = req.params;
    const reserva = findReserva(id);
    if (reserva) {
      res.status(200).json(reserva);
    } else {
      res.status(404).json({ message: "Reserva no encontrada" });
    }
  };
  
  exports.crearReserva = (req, res) => {
    const { idUsuario, idOficina, fecha, estado } = req.body;
    createReserva(idUsuario, idOficina, fecha, estado);
    res.status(201).json({ message: "Reserva creada correctamente" });
  };
  
  exports.actualizarReserva = (req, res) => {
    const { id } = req.params;
    const reserva = updateReserva(id, req.body);
    if (reserva) {
      res.status(200).json(reserva);
    } else {
      res.status(404).json({ message: "Reserva no encontrada" });
    }
  };
  
  exports.eliminarReserva = (req, res) => {
    const { id } = req.params;
    const eliminado = deleteReserva(id);
    if (eliminado) {
      res.status(200).json({ message: "Reserva eliminada" });
    } else {
      res.status(404).json({ message: "Reserva no encontrada" });
    }
  };
  