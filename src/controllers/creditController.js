// controllers/creditController.js
import * as Credit from "../models/creditModel.js";
import { parsePgError } from "../helpers/pgErrors.js";

/** POST /credit/:id/payment — registrar abono */
export const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "amount debe ser mayor a 0" });

    await Credit.addPayment(id, amount);
    return res.status(201).json({ ok: true, message: "Abono registrado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** GET /credit — todos los créditos */
export const getAll = async (req, res) => {
  try {
    const credits = await Credit.getAll();
    return res.status(200).json(credits);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener créditos" });
  }
};

/** GET /credit/pending — solo los pendientes */
export const getPending = async (req, res) => {
  try {
    const credits = await Credit.getPending();
    return res.status(200).json(credits);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener créditos pendientes" });
  }
};

/** GET /credit/client/:clientId — créditos de un cliente */
export const getByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const credits = await Credit.getByClient(clientId);
    return res.status(200).json(credits);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener créditos del cliente" });
  }
};

/** GET /credit/:id — historial de abonos de un crédito */
export const getDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await Credit.getDetail(id);
    return res.status(200).json(detail);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener detalle del crédito" });
  }
};
