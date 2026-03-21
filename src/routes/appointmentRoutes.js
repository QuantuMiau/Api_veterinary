import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - date
 *         - time
 *         - personName
 *         - reason
 *         - petType
 *       properties:
 *         id:
 *           type: string
 *           description: El ID autogenerado de la cita
 *         date:
 *           type: string
 *           description: Fecha de la cita (YYYY-MM-DD)
 *         time:
 *           type: string
 *           description: Hora de la cita (HH:mm)
 *         personName:
 *           type: string
 *           description: Nombre de la persona que agenda
 *         reason:
 *           type: string
 *           description: Motivo de la cita
 *         petType:
 *           type: string
 *           description: Tipo de mascota (perro, gato, conejo, ave, etc.)
 *         description:
 *           type: string
 *           description: Notas adicionales
 */

/**
 * @swagger
 * /appointment:
 *   post:
 *     summary: Crea una nueva cita
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post("/", createAppointment);

/**
 * @swagger
 * /appointment:
 *   get:
 *     summary: Obtiene todas las citas
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Lista de citas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get("/", getAppointments);

/**
 * @swagger
 * /appointment/{id}:
 *   get:
 *     summary: Obtiene una cita por ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la cita
 *       404:
 *         description: Cita no encontrada
 */
router.get("/:id", getAppointmentById);

/**
 * @swagger
 * /appointment/{id}:
 *   put:
 *     summary: Actualiza una cita
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Cita actualizada
 *       404:
 *         description: Cita no encontrada
 */
router.put("/:id", updateAppointment);

/**
 * @swagger
 * /appointment/{id}:
 *   delete:
 *     summary: Elimina una cita
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cita eliminada
 *       404:
 *         description: Cita no encontrada
 */
router.delete("/:id", deleteAppointment);

export default router;
