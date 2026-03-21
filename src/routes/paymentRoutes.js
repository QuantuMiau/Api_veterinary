// routes/paymentRoutes.js
import express from "express";
import * as Payment from "../controllers/paymentController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pagos Stripe
 *   description: Integración con Stripe para pagos de la app mobile
 */

/**
 * @swagger
 * /payment/intent:
 *   post:
 *     summary: Crear un PaymentIntent de Stripe
 *     tags: [Pagos Stripe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: Monto en centavos (MXN)
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
router.post("/intent", auth, Payment.createPaymentIntent);

/**
 * @swagger
 * /payment/method/{paymentIntentId}:
 *   get:
 *     summary: Obtener datos del método de pago usado
 *     tags: [Pagos Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentIntentId
 *         required: true
 *         schema:
 *           type: string
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
router.get("/method/:paymentIntentId", auth, Payment.getPaymentMethod);

export default router;
