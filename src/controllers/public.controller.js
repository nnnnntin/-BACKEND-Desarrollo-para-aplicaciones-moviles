const healthController = (req, res) => {
  try {
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en health check:", error);
    res.status(500).json({ 
      message: "Error en health check", 
      details: error.message || "Error interno del servidor"
    });
  }
};

const pingController = (req, res) => {
  try {
    res.status(200).send("pong");
  } catch (error) {
    console.error("Error en ping:", error);
    res.status(500).json({ 
      message: "Error al responder ping", 
      details: error.message || "Error interno del servidor"
    });
  }
};

module.exports = {
  healthController,
  pingController,
};