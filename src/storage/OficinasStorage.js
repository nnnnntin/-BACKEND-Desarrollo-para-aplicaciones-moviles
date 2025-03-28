const oficinas = [
    {
      id: 1,
      nombre: "Oficina Central",
      ubicacion: "Av. Principal 123",
      capacidad: 20,
    },
  ];
  
  const getOficinas = () => oficinas;
  
  const createOficina = (nombre, ubicacion, capacidad) => {
    const lastOficina = oficinas[oficinas.length - 1];
    const newOficina = {
      id: lastOficina ? lastOficina.id + 1 : 1,
      nombre,
      ubicacion,
      capacidad,
    };
    oficinas.push(newOficina);
  };
  
  const findOficina = (id) => oficinas.find((oficina) => oficina.id == id);
  
  const updateOficina = (id, payload) => {
    const index = oficinas.findIndex((oficina) => oficina.id == id);
    if (index >= 0) {
      oficinas[index] = { ...oficinas[index], ...payload };
      return oficinas[index];
    }
    return null;
  };
  
  const deleteOficina = (id) => {
    const index = oficinas.findIndex((oficina) => oficina.id == id);
    if (index >= 0) {
      return oficinas.splice(index, 1);
    }
    return null;
  };
  
  module.exports = {
    getOficinas,
    createOficina,
    findOficina,
    updateOficina,
    deleteOficina,
  };
  