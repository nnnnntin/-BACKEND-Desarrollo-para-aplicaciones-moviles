require("dotenv").config();
const mongoose = require("mongoose");

const connectMongoDB = async () => {
  const { MONGODB_URI, MONGODB_DATABASE_NAME } = process.env;
  if (!MONGODB_URI || !MONGODB_DATABASE_NAME) {
    throw new Error("Faltan variables MONGODB_URI o MONGODB_DATABASE_NAME");
  }

  console.log("Conectando a MongoDB en:", MONGODB_URI, "DB:", MONGODB_DATABASE_NAME);
  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DATABASE_NAME,
    serverSelectionTimeoutMS: 3000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✔ Conexión a MongoDB establecida correctamente");
};

module.exports = connectMongoDB;
