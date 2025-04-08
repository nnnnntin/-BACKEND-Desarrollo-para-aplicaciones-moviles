const jwt = require("jsonwebtoken");

const {
  saveUser,
  findUserByUsername,
  findUser,
  isValidPassword,
} = require("../models/usuario.models");

const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

const postAuthLogin = async (req, res) => {
  const { body } = req;
  const { username, password } = body;
  const user = findUser(username);

  if (!user) {
    res.status(400).json({ message: "Credenciales inválidas" });
    return;
  }
  const isValidPass = await isValidPassword(password, user.password);
  if (!isValidPass) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    AUTH_SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.json({ token: token });
};

const postAuthSignUp = async (req, res) => {
  const { body } = req;
  const { name, username, password } = body;

  if (findUserByUsername(username)) {
    res.status(400).json({ message: "Nombre de usuario ya en uso" });
    return;
  }
  const userID = await saveUser(name, username, password);
  res.status(201).json({ message: "Usuario creado exitosamente", id: userID });
};

module.exports = {
  postAuthLogin,
  postAuthSignUp,
};
