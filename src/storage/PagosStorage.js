const pagos = [
    {
      id: 1,
      idUsuario: 1,
      monto: 150,
      fecha: "2025-04-01",
      metodo: "Tarjeta",
    },
  ];
  
  const getPagos = () => pagos;
  
  const createPago = (idUsuario, monto, fecha, metodo) => {
    const lastPago = pagos[pagos.length - 1];
    const newPago = {
      id: lastPago ? lastPago.id + 1 : 1,
      idUsuario,
      monto,
      fecha,
      metodo,
    };
    pagos.push(newPago);
  };
  
  const findPago = (id) => pagos.find((pago) => pago.id == id);
  
  const updatePago = (id, payload) => {
    const index = pagos.findIndex((pago) => pago.id == id);
    if (index >= 0) {
      pagos[index] = { ...pagos[index], ...payload };
      return pagos[index];
    }
    return null;
  };
  
  const deletePago = (id) => {
    const index = pagos.findIndex((pago) => pago.id == id);
    if (index >= 0) {
      return pagos.splice(index, 1);
    }
    return null;
  };
  
  module.exports = {
    getPagos,
    createPago,
    findPago,
    updatePago,
    deletePago,
  };
  