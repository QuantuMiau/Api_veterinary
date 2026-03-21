// routes/serviceRoutes.js
import express from "express";
import * as Service from "../controllers/serviceController.js";
import { authEmployee } from "../middleware/authEmployee.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Catálogo de servicios clínicos
 */

/**
 * @swagger
 * /service:
 *   post:
 *     summary: Crear servicio
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, duration]
 *             properties:
 *               name:
 *                 type: string
 *               cost:
 *                 type: number
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *                 description: "Formato HH:MM:SS (ej: '00:30:00')"
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
router.post("/", authEmployee, Service.newService);
/**
 * @swagger
 * /service/{id}:
 *   put:
 *     summary: Actualizar servicio por concept_id
 *     tags: [Servicios]
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
 *               name:
 *                 type: string
 *               cost:
 *                 type: number
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *                 description: "Formato HH:MM:SS (ej: '00:30:00')"
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Operación exitosa
 *       400:
 *         description: Petición incorrecta
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error de servidor
 */
router.put("/:id", authEmployee, Service.updateService);

/**
 * @swagger
 * /service/{id}:
 *   delete:
 *     summary: Desactivar servicio (soft-delete)
 *     tags: [Servicios]
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
 *       400:
 *         description: Petición incorrecta
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error de servidor
 */
router.delete("/:id", authEmployee, Service.deleteService);

/**
 * @swagger
 * /service/{id}/activate:
 *   patch:
 *     summary: Reactivar servicio
 *     tags: [Servicios]
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
 *       400:
 *         description: Petición incorrecta
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error de servidor
 */
router.patch("/:id/activate", authEmployee, Service.activateService);

/**
 * @swagger
 * /service:
 *   get:
 *     summary: Listar todos los servicios
 *     tags: [Servicios]
 *     responses:
 *       200:
 *         description: Operación exitosa
 *       500:
 *         description: Error de servidor
 */
router.get("/", Service.getAll);

export default router;
