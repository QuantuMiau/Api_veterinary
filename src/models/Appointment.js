import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    date: {
      type: String, // formato "YYYY-MM-DD"
      required: true,
    },
    time: {
      type: String, // formato "HH:mm"
      required: true,
    },
    personName: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    petType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
