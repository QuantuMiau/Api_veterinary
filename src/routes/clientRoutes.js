// routes/clientRoutes.js
import express from "express";
import * as Client from "../controllers/clientController.js";
import { authEmployee } from "../middleware/authEmployee.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestión de clientes de la clínica
 */

/**
 * @swagger
 * /client:
 *   post:
 *     summary: Registrar nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, phone, address, city]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               mother_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Petición incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       409:
 *         description: Teléfono ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error de servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/", authEmployee, Client.newClient);

/**
 * @swagger
 * /client/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
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
router.put("/:id", authEmployee, Client.updateClient);

/**
 * @swagger
 * /client:
 *   get:
 *     summary: Listar todos los clientes
 *     tags: [Clientes]
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
router.get("/", authEmployee, Client.getAll);

/**
 * @swagger
 * /client/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
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
router.get("/:id", authEmployee, Client.getById);

export default router;
