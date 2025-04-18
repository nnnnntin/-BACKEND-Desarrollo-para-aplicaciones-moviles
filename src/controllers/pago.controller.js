const Joi = require("joi");
const {
  getPagos,
  findPago,
  savePago,
  updatePago,
  deletePago,
} = require("../repositories/pago.repository");
const {
  createPagoSchema,
  updatePagoSchema,
} = require("../routes/validations/pago.validation");

const getPagosController = async (req, res) => {
  try {
    const pagos = await getPagos();
    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getPagoController = async (req, res) => {
  const { id } = req.params;
  try {
    const pago = await findPago(id);
    if (!pago) {
      return res.status(404).json({ message: `No se ha encontrado el pago con id: ${id}` });
    }
    res.status(200).json(pago);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postPagoController = async (req, res) => {
  const { error, value } = createPagoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { idUsuario, monto, fecha, metodo } = value;
  try {
    await savePago(idUsuario, monto, fecha, metodo);
    res.status(201).json({ message: "Pago creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putPagoController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updatePagoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const updated = await updatePago(id, value);
    if (!updated) {
      return res.status(404).json({ message: `No se ha encontrado el pago con id: ${id}` });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deletePagoController = async (req, res) => {
  const { id } = req.params;
  try {
    await deletePago(id);
    res.status(200).json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getPagosController,
  getPagoController,
  postPagoController,
  putPagoController,
  deletePagoController,
};
