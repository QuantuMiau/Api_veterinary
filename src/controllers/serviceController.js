import * as Service from "../models/serviceModel.js";
import { parsePgError } from "../helpers/pgErrors.js";

export const newService = async (req, res) => {
  try {
    const { name, cost, price, duration, service_type } = req.body;
    if (!name || !price || !duration || !service_type)
      return res.status(400).json({ message: "Faltan campos requeridos (name, price, duration, service_type)" });

    await Service.newService(name, cost, price, duration, service_type);
    return res.status(201).json({ ok: true, message: "Servicio creado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cost, price, duration, active, service_type } = req.body;

    await Service.updateService(id, name, cost, price, duration, active, service_type);
    return res.status(200).json({ ok: true, message: "Servicio actualizado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await Service.deleteService(id);
    return res.status(200).json({ ok: true, message: "Servicio desactivado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const activateService = async (req, res) => {
  try {
    const { id } = req.params;
    await Service.activateService(id);
    return res.status(200).json({ ok: true, message: "Servicio activado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const getAll = async (req, res) => {
  try {
    const services = await Service.getAll();
    return res.status(200).json(services);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener servicios" });
  }
};
