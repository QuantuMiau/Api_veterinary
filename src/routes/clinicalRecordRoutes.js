import express from "express";
import { create, getByPatient, update, remove, getLatestByPatient } from "../controllers/clinicalRecordController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ClinicalRecord:
 *       type: object
 *       required:
 *         - patientId
 *         - category
 *         - studyName
 *         - date
 *       properties:
 *         _id:
 *           type: string
 *           description: El ID autogenerado del registro
 *         patientId:
 *           type: number
 *           description: ID del paciente en SQL
 *         category:
 *           type: string
 *           enum: [visita, vacuna, rx, laboratorio]
 *           description: Categoría del registro clínico
 *         studyName:
 *           type: string
 *           description: Nombre del estudio o visita
 *         date:
 *           type: string
 *           description: Fecha del registro (YYYY-MM-DD)
 *         results:
 *           type: string
 *           description: Resultados del estudio
 *         diagnosis:
 *           type: string
 *           description: Diagnóstico
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         fileUrl:
 *           type: string
 *           description: URL del archivo subido (Cloudinary)
 *         nextApplication:
 *           type: string
 *           description: Fecha de la próxima aplicación (YYYY-MM-DD)
 */

/**
 * @swagger
 * /clinical-record/patient/{patientId}:
 *   get:
 *     summary: Obtiene todos los registros clínicos de un paciente
 *     tags: [ClinicalRecords]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID del paciente (SQL)
 *     responses:
 *       200:
 *         description: Lista de registros clínicos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClinicalRecord'
 */
router.get("/patient/:patientId", getByPatient);

/**
 * @swagger
 * /clinical-record/latest/{patientId}:
 *   get:
 *     summary: Obtiene el registro clínico más reciente de un paciente
 *     tags: [ClinicalRecords]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID del paciente (SQL)
 *     responses:
 *       200:
 *         description: El registro más reciente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClinicalRecord'
 */
router.get("/latest/:patientId", getLatestByPatient);

/**
 * @swagger
 * /clinical-record:
 *   post:
 *     summary: Crea un nuevo registro clínico
 *     tags: [ClinicalRecords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClinicalRecord'
 *     responses:
 *       201:
 *         description: Registro creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post("/", create);

/**
 * @swagger
 * /clinical-record/{id}:
 *   put:
 *     summary: Actualiza un registro clínico
 *     tags: [ClinicalRecords]
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
 *             $ref: '#/components/schemas/ClinicalRecord'
 *     responses:
 *       200:
 *         description: Registro actualizado
 *       404:
 *         description: Registro no encontrado
 */
router.put("/:id", update);

/**
 * @swagger
 * /clinical-record/{id}:
 *   delete:
 *     summary: Elimina un registro clínico
 *     tags: [ClinicalRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro eliminado
 *       404:
 *         description: Registro no encontrado
 */
router.delete("/:id", remove);

export default router;
