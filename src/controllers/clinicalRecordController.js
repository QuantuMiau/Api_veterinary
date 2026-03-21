import ClinicalRecord from "../models/ClinicalRecord.js";

export const getByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await ClinicalRecord.find({
      patientId: Number(patientId),
    }).sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la historia clínica", details: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { patientId, category, studyName, date, results, diagnosis, notes, fileUrl, nextApplication, brand, batch } = req.body;

    if (!patientId || !category || !studyName || !date) {
      return res.status(400).json({ error: "Campos requeridos: patientId, category, studyName, date" });
    }

    const record = new ClinicalRecord({
      patientId,
      category,
      studyName,
      date,
      results: results || "",
      diagnosis: diagnosis || "",
      notes: notes || "",
      fileUrl: fileUrl || null,
      nextApplication: nextApplication || "",
      brand: brand || "",
      batch: batch || "",
    });

    const saved = await record.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: "Error al crear el registro", details: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const updated = await ClinicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Registro no encontrado" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar el registro", details: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await ClinicalRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Registro no encontrado" });
    res.json({ message: "Registro eliminado correctamente", id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el registro", details: error.message });
  }
};

export const getLatestByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const record = await ClinicalRecord.findOne({
      patientId: Number(patientId),
    }).sort({ date: -1, createdAt: -1 });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el último registro", details: error.message });
  }
};
