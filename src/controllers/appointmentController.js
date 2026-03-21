import Appointment from "../models/Appointment.js";

// @desc    Create new appointment
// @route   POST /appointment
// @access  Private
export const createAppointment = async (req, res) => {
  const { date, time, personName, reason, petType, description } = req.body;

  try {
    const appointment = new Appointment({
      date,
      time,
      personName,
      reason,
      petType,
      description,
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all appointments
// @route   GET /appointment
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({}).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /appointment/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: "Cita no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /appointment/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  const { date, time, personName, reason, petType, description } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
      appointment.date = date || appointment.date;
      appointment.time = time || appointment.time;
      appointment.personName = personName || appointment.personName;
      appointment.reason = reason || appointment.reason;
      appointment.petType = petType || appointment.petType;
      appointment.description = description || appointment.description;

      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: "Cita no encontrada" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /appointment/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const result = await Appointment.findByIdAndDelete(req.params.id);
    if (result) {
      res.json({ message: "Cita eliminada" });
    } else {
      res.status(404).json({ message: "Cita no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
