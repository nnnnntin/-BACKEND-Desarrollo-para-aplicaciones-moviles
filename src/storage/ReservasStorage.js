const reservas = [
    {
      id: 1,
      idUsuario: 1,
      idOficina: 1,
      fecha: "2025-04-01",
      estado: "pendiente",
    },
  ];
  
  const getReservas = () => reservas;
  
  const createReserva = (idUsuario, idOficina, fecha, estado) => {
    const lastReserva = reservas[reservas.length - 1];
    const newReserva = {
      id: lastReserva ? lastReserva.id + 1 : 1,
      idUsuario,
      idOficina,
      fecha,
      estado,
    };
    reservas.push(newReserva);
  };
  
  const findReserva = (id) => reservas.find((reserva) => reserva.id == id);
  
  const updateReserva = (id, payload) => {
    const index = reservas.findIndex((reserva) => reserva.id == id);
    if (index >= 0) {
      reservas[index] = { ...reservas[index], ...payload };
      return reservas[index];
    }
    return null;
  };
  
  const deleteReserva = (id) => {
    const index = reservas.findIndex((reserva) => reserva.id == id);
    if (index >= 0) {
      return reservas.splice(index, 1);
    }
    return null;
  };
  
  module.exports = {
    getReservas,
    createReserva,
    findReserva,
    updateReserva,
    deleteReserva,
  };
  