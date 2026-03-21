// controllers/clientController.js
import * as Client from "../models/clientModel.js";
import { parsePgError } from "../helpers/pgErrors.js";

export const newClient = async (req, res) => {
  try {
    const { first_name, last_name, mother_name, phone, address, city } = req.body;
    if (!first_name || !last_name || !mother_name)
      return res.status(400).json({ message: "Faltan campos requeridos" });

    await Client.newClient(first_name, last_name, mother_name, phone, address, city);
    return res.status(201).json({ ok: true, message: "Cliente registrado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, mother_name, phone, address, city } = req.body;

    await Client.updateClient(id, first_name, last_name, mother_name, phone, address, city);
    return res.status(200).json({ ok: true, message: "Cliente actualizado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const getAll = async (req, res) => {
  try {
    const clients = await Client.getAll();
    return res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener clientes" });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.getById(id);

    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    return res.status(200).json(client);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el cliente" });
  }
};
