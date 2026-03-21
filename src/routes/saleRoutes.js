// routes/saleRoutes.js
import express from "express";
import * as Sale from "../controllers/saleController.js";
import { authEmployee } from "../middleware/authEmployee.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: Ventas de la clínica (panel admin)
 */

/**
 * @swagger
 * /sale:
 *   post:
 *     summary: Registrar venta de clínica
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentMethod, items]
 *             properties:
 *               clientId:
 *                 type: integer
 *                 description: Obligatorio si paymentMethod es Credito
 *               paymentMethod:
 *                 type: string
 *                 enum: [Efectivo, Credito, Transferencia, Stripe]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     concept_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
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
router.post("/", authEmployee, Sale.newSale);

/**
 * @swagger
 * /sale:
 *   get:
 *     summary: Listar todas las ventas
 *     tags: [Ventas]
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
router.get("/", authEmployee, Sale.getAll);

/**
 * @swagger
 * /sale/employee/{employeeId}:
 *   get:
 *     summary: Ventas de un empleado específico
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
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
router.get("/employee/:employeeId", authEmployee, Sale.getByEmployee);

/**
 * @swagger
 * /sale/{id}:
 *   get:
 *     summary: Detalle de una venta
 *     tags: [Ventas]
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
router.get("/:id", authEmployee, Sale.getById);

export default router;
