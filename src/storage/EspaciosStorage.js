const espacios = [
    {
      id: 1,
      nombre: "Sala de Reuniones",
      ubicacion: "Piso 2",
      capacidad: 10,
    },
  ];
  
  const getEspacios = () => espacios;
  
  const createEspacio = (nombre, ubicacion, capacidad) => {
    const lastEspacio = espacios[espacios.length - 1];
    const newEspacio = {
      id: lastEspacio ? lastEspacio.id + 1 : 1,
      nombre,
      ubicacion,
      capacidad,
    };
    espacios.push(newEspacio);
  };
  
  const findEspacio = (id) => espacios.find((espacio) => espacio.id == id);
  
  const updateEspacio = (id, payload) => {
    const index = espacios.findIndex((espacio) => espacio.id == id);
    if (index >= 0) {
      espacios[index] = { ...espacios[index], ...payload };
      return espacios[index];
    }
    return null;
  };
  
  const deleteEspacio = (id) => {
    const index = espacios.findIndex((espacio) => espacio.id == id);
    if (index >= 0) {
      return espacios.splice(index, 1);
    }
    return null;
  };
  
  module.exports = {
    getEspacios,
    createEspacio,
    findEspacio,
    updateEspacio,
    deleteEspacio,
  };
  