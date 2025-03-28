const membresias = [
    {
      id: 1,
      tipo: "Premium",
      beneficios: "Acceso prioritario a reservas",
      precio: 100,
    },
  ];
  
  const getMembresias = () => membresias;
  
  const createMembresia = (tipo, beneficios, precio) => {
    const lastMembresia = membresias[membresias.length - 1];
    const newMembresia = {
      id: lastMembresia ? lastMembresia.id + 1 : 1,
      tipo,
      beneficios,
      precio,
    };
    membresias.push(newMembresia);
  };
  
  const findMembresia = (id) => membresias.find((membresia) => membresia.id == id);
  
  const updateMembresia = (id, payload) => {
    const index = membresias.findIndex((membresia) => membresia.id == id);
    if (index >= 0) {
      membresias[index] = { ...membresias[index], ...payload };
      return membresias[index];
    }
    return null;
  };
  
  const deleteMembresia = (id) => {
    const index = membresias.findIndex((membresia) => membresia.id == id);
    if (index >= 0) {
      return membresias.splice(index, 1);
    }
    return null;
  };
  
  module.exports = {
    getMembresias,
    createMembresia,
    findMembresia,
    updateMembresia,
    deleteMembresia,
  };
  