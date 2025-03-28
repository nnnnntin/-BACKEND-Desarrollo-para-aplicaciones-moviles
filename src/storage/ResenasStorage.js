const resenas = [
    {
      id: 1,
      idUsuario: 1,
      comentario: "Excelente servicio",
      calificacion: 5,
    },
  ];
  
  const getResenas = () => resenas;
  
  const createResena = (idUsuario, comentario, calificacion) => {
    const lastResena = resenas[resenas.length - 1];
    const newResena = {
      id: lastResena ? lastResena.id + 1 : 1,
      idUsuario,
      comentario,
      calificacion,
    };
    resenas.push(newResena);
  };
  
  const findResena = (id) => resenas.find((resena) => resena.id == id);
  
  const updateResena = (id, payload) => {
    const index = resenas.findIndex((resena) => resena.id == id);
    if (index >= 0) {
      resenas[index] = { ...resenas[index], ...payload };
      return resenas[index];
    }
    return null;
  };
  
  const deleteResena = (id) => {
    const index = resenas.findIndex((resena) => resena.id == id);
    if (index >= 0) {
      return resenas.splice(index, 1);
    }
    return null;
  };
  
  module.exports = {
    getResenas,
    createResena,
    findResena,
    updateResena,
    deleteResena,
  };
  