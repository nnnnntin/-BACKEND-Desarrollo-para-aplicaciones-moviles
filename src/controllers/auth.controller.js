const jwt = require("jsonwebtoken");
const {
  findUsuarioByUsername,
  isValidPassword,
  saveUsuario,
} = require("../repositories/usuario.repository");

const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

const postAuthLogin = async (req, res) => {
  const { body } = req;
  const { username, password } = body;
  const user = await findUsuarioByUsername(username);

  if (!user) {
    res.status(400).json({ message: "Credenciales inválidas" });
    return;
  }
  const isValidPass = await isValidPassword(password, user.password);
  if (!isValidPass) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }
  const userId = user._id.toString();

  const token = jwt.sign(
    { id: userId, username: user.username },
    AUTH_SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.json({ token: token });
};

const postAuthSignup = async (req, res) => {
  const { body } = req;
  const { name, username, password } = body;

  const user = await findUsuarioByUsername(username);
  if (user) {
    res.status(400).json({ message: "Nombre de usuario ya en uso" });
    return;
  }
  try {
    await saveUsuario(name, username, password);
    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Ha ocurrido un error inesperado" });
  }
};

module.exports = {
  postAuthLogin,
  postAuthSignup,
};
