// routes/patientRoutes.js
import express from "express";
import * as Patient from "../controllers/patientController.js";
import { authEmployee } from "../middleware/authEmployee.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pacientes
 *   description: Gestión de pacientes (los datos de visitas se almacenan en MongoDB)
 */

/**
 * @swagger
 * /patient:
 *   post:
 *     summary: Registrar nuevo paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client_id, species_id, name, sex]
 *             properties:
 *               client_id:
 *                 type: integer
 *               species_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               breed:
 *                 type: string
 *               sex:
 *                 type: string
 *                 enum: [Macho, Hembra]
 *     responses:
 *       201:
 *         description: Paciente registrado
 */
router.post("/", authEmployee, Patient.newPatient);

/**
 * @swagger
 * /patient/{id}:
 *   put:
 *     summary: Actualizar paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: integer
 *               species_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               breed:
 *                 type: string
 *               sex:
 *                 type: string
 *                 enum: [Macho, Hembra]
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error de validación o petición incorrecta
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error de servidor
 */
router.put("/:id", authEmployee, Patient.updatePatient);

/**
 * @swagger
 * /patient:
 *   get:
 *     summary: Listar todos los pacientes
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error de validación o petición incorrecta
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error de servidor
 */
router.get("/", authEmployee, Patient.getAll);

/**
 * @swagger
 * /patient/client/{client_id}:
 *   get:
 *     summary: Obtener pacientes de un cliente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: client_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error de validación o petición incorrecta
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error de servidor
 */
router.get("/client/:client_id", authEmployee, Patient.getByClient);

/**
 * @swagger
 * /patient/{id}:
 *   get:
 *     summary: Obtener paciente por ID
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error de validación o petición incorrecta
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error de servidor
 */
router.get("/:id", authEmployee, Patient.getById);

export default router;
