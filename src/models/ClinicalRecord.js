import mongoose from "mongoose";

const clinicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: Number,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["visita", "vacuna", "rx", "laboratorio"],
    },
    studyName: {
      type: String,
      required: true,
    },
    date: {
      type: String, // formato "YYYY-MM-DD"
      required: true,
    },
    results: {
      type: String,
      default: "",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    nextApplication: {
      type: String, // formato "YYYY-MM-DD"
      default: "",
    },
    brand: {
      type: String,
      default: "",
    },
    batch: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ClinicalRecord = mongoose.model("ClinicalRecord", clinicalRecordSchema);

export default ClinicalRecord;
