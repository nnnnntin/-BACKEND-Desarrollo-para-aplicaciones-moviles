require('dotenv').config();
const mongoose = require('mongoose');

const connectMongoDB = async () => {
  const uri    = process.env.MONGODB_URI; 
  const dbName = process.env.MONGODB_DATABASE_NAME;

  if (!uri) {
    throw new Error('⚠️ La variable MONGODB_URI no está definida en el entorno');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      dbName,
    });
    console.log('✅ Conexión a MongoDB establecida correctamente');
  } catch (error) {
    console.error('✘ Error al conectar a MongoDB:', error);
    throw error;
  }
};

module.exports = connectMongoDB;
