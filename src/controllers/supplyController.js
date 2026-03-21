// controllers/supplyController.js
import * as Supply from "../models/supplyModel.js";
import { parsePgError } from "../helpers/pgErrors.js";

export const newSupply = async (req, res) => {
  try {
    const { name, cost, price, inventory } = req.body;
    if (!name || !price || inventory === undefined)
      return res.status(400).json({ message: "Faltan campos requeridos (name, price, inventory)" });

    await Supply.newSupply(name, cost, price, inventory);
    return res.status(201).json({ ok: true, message: "Insumo creado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const updateSupply = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cost, price, inventory, active } = req.body;

    await Supply.updateSupply(id, name, cost, price, inventory, active);
    return res.status(200).json({ ok: true, message: "Insumo actualizado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const deleteSupply = async (req, res) => {
  try {
    const { id } = req.params;
    await Supply.deleteSupply(id);
    return res.status(200).json({ ok: true, message: "Insumo desactivado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const activateSupply = async (req, res) => {
  try {
    const { id } = req.params;
    await Supply.activateSupply(id);
    return res.status(200).json({ ok: true, message: "Insumo activado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const getAll = async (req, res) => {
  try {
    const supplies = await Supply.getAll();
    return res.status(200).json(supplies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener insumos" });
  }
};
