const jwt = require("jsonwebtoken");
const {
  findUsuarioByUsername,
  isValidPassword,
  registerUsuario,
} = require("../repositories/usuario.repository");

const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

const postAuthLogin = async (req, res) => {
  const { body } = req;
  const { username, password } = body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      message: "Credenciales incompletas", 
      details: "Se requiere nombre de usuario y contraseña"
    });
  }
  
  try {
    const user = await findUsuarioByUsername(username);
  
    if (!user) {
      return res.status(401).json({ 
        message: "Credenciales inválidas", 
        details: "El nombre de usuario o la contraseña son incorrectos"
      });
    }
    
    const isValidPass = await isValidPassword(password, user.password);
    if (!isValidPass) {
      return res.status(401).json({ 
        message: "Credenciales inválidas", 
        details: "El nombre de usuario o la contraseña son incorrectos"
      });
    }
    
    if (user.activo === false) {
      return res.status(403).json({ 
        message: "Usuario inactivo", 
        details: "La cuenta ha sido desactivada. Contacte al administrador."
      });
    }
    
    const userId = user._id.toString();
  
    if (!AUTH_SECRET_KEY) {
      console.error("ERROR: AUTH_SECRET_KEY no está configurada en variables de entorno");
      return res.status(500).json({ 
        message: "Error de configuración del servidor", 
        details: "No se pudo completar la autenticación debido a un error de configuración"
      });
    }
    
    try {
      const token = jwt.sign(
        { 
          id: userId, 
          username: user.username, 
          tipoUsuario: user.tipoUsuario,
          rol: user.rol
        },
        AUTH_SECRET_KEY,
        { expiresIn: "1h" }
      );
    
      res.json({ 
        token: token,
        usuario: {
          id: userId,
          username: user.username,
          tipoUsuario: user.tipoUsuario,
          rol: user.rol,
          nombre: user.nombre,
          apellidos: user.apellidos,
          email: user.email,
          imagen: user.imagen, // ← CAMBIO: Incluir imagen en la respuesta de login
          datosPersonales: user.datosPersonales,
          direccion: user.direccion,
          datosEmpresa: user.datosEmpresa,
          preferencias: user.preferencias,
          membresia: user.membresia,
          verificado: user.verificado,
          activo: user.activo
        }
      });
    } catch (jwtError) {
      console.error("Error al generar el token JWT:", jwtError);
      return res.status(500).json({ 
        message: "Error al generar el token de autenticación", 
        details: "Ocurrió un problema al crear la sesión"
      });
    }
  } catch (error) {
    console.error("Error en postAuthLogin:", error);
    
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({ 
        message: "Error de base de datos", 
        details: "Ocurrió un problema al acceder a la base de datos"
      });
    }
    
    return res.status(500).json({ 
      message: "Error en la autenticación", 
      details: "Ha ocurrido un error inesperado durante el proceso de inicio de sesión"
    });
  }
};

const postAuthSignup = async (req, res) => {
  const {
    tipoUsuario,
    username,
    email,
    password,
    nombre = "",
    apellidos = "",
    imagen // ← CAMBIO: Agregar imagen a los campos del signup
  } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ 
      message: "Datos incompletos", 
      details: "Se requiere nombre de usuario, correo electrónico y contraseña"
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: "Email inválido", 
      details: "El formato del correo electrónico no es válido"
    });
  }
  
  if (tipoUsuario && !['usuario', 'proveedor', 'cliente', 'administrador'].includes(tipoUsuario)) {
    return res.status(400).json({ 
      message: "Tipo de usuario inválido", 
      details: "El tipo de usuario debe ser 'usuario', 'proveedor', 'cliente' o 'administrador'"
    });
  }
  
  try {
    const existing = await findUsuarioByUsername(username);
    if (existing) {
      return res.status(400).json({ 
        message: "Usuario ya existe", 
        details: "El nombre de usuario ya está en uso"
      });
    }
    
    const Usuario = require("../models/usuario.model");
    const existingEmail = await Usuario.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        message: "Email ya registrado", 
        details: "Ya existe una cuenta con este correo electrónico"
      });
    }
  
    // CAMBIO: Incluir imagen en los datos del nuevo usuario
    const newUserData = {
      tipoUsuario: tipoUsuario || 'usuario',
      username,
      email,
      password,
      nombre,
      apellidos,
      activo: true
    };

    // Solo agregar imagen si se proporciona
    if (imagen) {
      newUserData.imagen = imagen;
    }

    const newUser = await registerUsuario(newUserData);
  
    return res.status(201).json({ 
      message: "Usuario creado exitosamente", 
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
      tipoUsuario: newUser.tipoUsuario,
      imagen: newUser.imagen // ← CAMBIO: Incluir imagen en la respuesta del signup
    });
  } catch (error) {
    console.error("Error en postAuthSignup:", error);
  
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación", 
        details: errors
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: "Valor duplicado", 
        details: `El ${field} ya está registrado en el sistema`,
        field
      });
    }
    
    if (error.message && error.message.includes('contraseña')) {
      return res.status(400).json({ 
        message: "Contraseña inválida", 
        details: error.message
      });
    }
  
    return res.status(500).json({ 
      message: "Error al crear usuario", 
      details: "Ha ocurrido un error inesperado durante el registro"
    });
  }
};

const validateToken = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      message: "Token no proporcionado", 
      details: "Se requiere un token de autenticación"
    });
  }
  
  try {
    if (!AUTH_SECRET_KEY) {
      console.error("ERROR: AUTH_SECRET_KEY no está configurada en variables de entorno");
      return res.status(500).json({ 
        message: "Error de configuración del servidor", 
        details: "No se pudo completar la validación debido a un error de configuración"
      });
    }
    
    const decoded = jwt.verify(token, AUTH_SECRET_KEY);
    
    const user = await findUsuarioByUsername(decoded.username);
    if (!user) {
      return res.status(401).json({ 
        message: "Usuario no encontrado", 
        details: "El usuario asociado al token ya no existe"
      });
    }
    
    if (user.activo === false) {
      return res.status(403).json({ 
        message: "Usuario inactivo", 
        details: "La cuenta ha sido desactivada"
      });
    }
    
    return res.status(200).json({ 
      valid: true, 
      user: {
        id: user._id,
        username: user.username,
        tipoUsuario: user.tipoUsuario,
        rol: user.rol,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        imagen: user.imagen, // ← CAMBIO: Incluir imagen en la validación del token
        datosPersonales: user.datosPersonales,
        direccion: user.direccion,
        datosEmpresa: user.datosEmpresa,
        preferencias: user.preferencias,
        membresia: user.membresia,
        verificado: user.verificado,
        activo: user.activo
      }
    });
  } catch (error) {
    console.error("Error validando token:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expirado", 
        details: "La sesión ha expirado, por favor inicie sesión nuevamente"
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Token inválido", 
        details: "El token de autenticación no es válido"
      });
    }
    
    return res.status(500).json({ 
      message: "Error al validar el token", 
      details: "Ha ocurrido un error inesperado durante la validación"
    });
  }
};

module.exports = {
  postAuthLogin,
  postAuthSignup,
  validateToken
};