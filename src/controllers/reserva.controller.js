const Joi = require("joi");
const {
  getReservas,
  findReserva,
  saveReserva,
  updateReserva,
  deleteReserva,
} = require("../repositories/reserva.repository");
const {
  createReservaSchema,
  updateReservaSchema,
} = require("../routes/validations/reserva.validation");

const getReservasController = async (req, res) => {
  try {
    const reservas = await getReservas();
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getReservaController = async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await findReserva(id);
    if (!reserva) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${id}` });
    }
    res.status(200).json(reserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postReservaController = async (req, res) => {
  const { error, value } = createReservaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { idUsuario, idOficina, fecha, estado } = value;
  try {
    await saveReserva(idUsuario, idOficina, fecha, estado);
    res.status(201).json({ message: "Reserva creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putReservaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateReservaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const updated = await updateReserva(id, value);
    if (!updated) {
      return res.status(404).json({ message: `No se ha encontrado la reserva con id: ${id}` });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteReservaController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteReserva(id);
    res.status(200).json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getReservasController,
  getReservaController,
  postReservaController,
  putReservaController,
  deleteReservaController,
};
