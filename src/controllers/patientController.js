// controllers/patientController.js
import * as Patient from "../models/patientModel.js";
import { parsePgError } from "../helpers/pgErrors.js";

export const newPatient = async (req, res) => {
  try {
    const { client_id, species_id, name, color, breed, sex } = req.body;
    if (!client_id || !species_id || !name || !sex)
      return res.status(400).json({ message: "Faltan campos requeridos" });

    await Patient.newPatient(client_id, species_id, name, color, breed, sex);
    return res.status(201).json({ ok: true, message: "Paciente registrado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, species_id, name, color, breed, sex } = req.body;

    await Patient.updatePatient(id, client_id, species_id, name, color, breed, sex);
    return res.status(200).json({ ok: true, message: "Paciente actualizado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const getAll = async (req, res) => {
  try {
    const patients = await Patient.getAll();
    return res.status(200).json(patients);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener pacientes" });
  }
};

export const getByClient = async (req, res) => {
  try {
    const { client_id } = req.params;
    const patients = await Patient.getByClient(client_id);
    return res.status(200).json(patients);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener pacientes del cliente" });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.getById(id);

    if (!patient) return res.status(404).json({ message: "Paciente no encontrado" });
    return res.status(200).json(patient);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el paciente" });
  }
};
