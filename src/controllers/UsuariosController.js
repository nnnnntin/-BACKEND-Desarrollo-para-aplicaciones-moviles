const { 
    getUsuarios, 
    createUsuario, 
    findUsuario, 
    updateUsuario, 
    deleteUsuario 
  } = require('../storage/UsuariosStorage');
  
  exports.obtenerUsuarios = (req, res) => {
    res.status(200).json(getUsuarios());
  };
  
  exports.obtenerUsuarioPorId = (req, res) => {
    const { id } = req.params;
    const usuario = findUsuario(id);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  };
  
  exports.crearUsuario = (req, res) => {
    const { nombre, email, rol } = req.body;
    createUsuario(nombre, email, rol);
    res.status(201).json({ message: "Usuario creado correctamente" });
  };
  
  exports.actualizarUsuario = (req, res) => {
    const { id } = req.params;
    const usuario = updateUsuario(id, req.body);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  };
  
  exports.eliminarUsuario = (req, res) => {
    const { id } = req.params;
    const eliminado = deleteUsuario(id);
    if (eliminado) {
      res.status(200).json({ message: "Usuario eliminado" });
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  };
  