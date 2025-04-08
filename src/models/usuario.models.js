const bcrypt = require("bcryptjs");

const usuarios = [
  {
    id: 1,
    name: "Valentin",
    username: "valentin",
    password: "$2b$10$qErnklyHq91yz5Yf8U.xe.7jd24qzt/093Dcnhwon0hIP95Nf3AWW",
    active: true,
  },
  {
    id: 2,
    name: "Diego",
    username: "diego",
    password: "$2b$10$mihW/MciyHet2Rh/LEf8aOP1BZddSouJuRYFeqkWkEPlX8m8nrJA.",
    active: true,
  },
  {
    id: 3,
    name: "Andres",
    username: "diego",
    password: "$2b$10$xktwrrsGh1pGfvWSYIJY5OqlOcqvJtF7n6b.f9TLwkocnKIf1meJa",
    active: true,
  },
];

const getUsuarios = () => usuarios;

const findUser = (username) => {
  const user = usuarios.find((u) => u.username == username);
  return user;
};

const isValidPassword = async (password, userPassword) => {
  const result = await bcrypt.compare(password, userPassword);
  return result;
};

const findUserByUsername = (username) => {
  const user = usuarios.find((u) => u.username == username);
  return user;
};

const saveUser = async (name, username, password) => {
  const lastUser = usuarios[usuarios.length - 1];
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    name: name,
    username: username,
    password: hashedPassword,
    active: true,
  };
  if (lastUser) {
    newUser.id = lastUser.id + 1;
  } else {
    newUser.id = 1;
  }
  usuarios.push(newUser);
  return newUser.id;
};

module.exports = { saveUser, findUser, findUserByUsername, isValidPassword };
