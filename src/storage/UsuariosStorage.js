const usuarios = [
    {
      id: 1,
      nombre: "Juan Pérez",
      email: "juan@example.com",
      rol: "empleado",
    },
  ];
  
  const getUsuarios = () => usuarios;
  
  const createUsuario = (nombre, email, rol) => {
    const lastUsuario = usuarios[usuarios.length - 1];
    const newUsuario = {
      id: lastUsuario ? lastUsuario.id + 1 : 1,
      nombre,
      email,
      rol,
    };
    usuarios.push(newUsuario);
  };
  
  const findUsuario = (id) => usuarios.find((usuario) => usuario.id == id);
  
  const updateUsuario = (id, payload) => {
    const index = usuarios.findIndex((usuario) => usuario.id == id);
    if (index >= 0) {
      usuarios[index] = { ...usuarios[index], ...payload };
      return usuarios[index];
    }
    return null;
  };
  
  const deleteUsuario = (id) => {
    const index = usuarios.findIndex((usuario) => usuario.id == id);
    if (index >= 0) {
      return usuarios.splice(index, 1);
    }
    return null;
  };
  
  module.exports = {
    getUsuarios,
    createUsuario,
    findUsuario,
    updateUsuario,
    deleteUsuario,
  };
  