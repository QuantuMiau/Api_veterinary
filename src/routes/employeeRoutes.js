// routes/employeeRoutes.js
import express from "express";
import * as Employee from "../controllers/employeeController.js";
import { authEmployee, onlyAdmin } from "../middleware/authEmployee.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Empleados
 *   description: Gestión de empleados
 */

/**
 * @swagger
 * /employee/login:
 *   post:
 *     summary: Login de empleado
 *     tags: [Empleados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso — token con role incluido
 *       401:
 *         description: Credenciales incorrectas
 */
router.post("/login", Employee.login);

/**
 * @swagger
 * /employee/register:
 *   post:
 *     summary: Registrar nuevo empleado (solo Admin)
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               mother_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Empleado]
 *                 default: Empleado
 *     responses:
 *       201:
 *         description: Empleado registrado
 *       403:
 *         description: Solo administradores pueden registrar empleados
 */
router.post("/register", authEmployee, onlyAdmin, Employee.register);

/**
 * @swagger
 * /employee/update/{id}:
 *   put:
 *     summary: Actualizar datos de un empleado (solo Admin)
 *     tags: [Empleados]
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               mother_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Empleado]
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
router.put("/update/:id", authEmployee, onlyAdmin, Employee.updateEmployee);

/**
 * @swagger
 * /employee/password/{id}:
 *   put:
 *     summary: Actualizar contraseña de un empleado (solo Admin)
 *     tags: [Empleados]
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
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
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
router.put("/password/:id", authEmployee, onlyAdmin, Employee.updatePassword);

/**
 * @swagger
 * /employee/{id}:
 *   delete:
 *     summary: Desactivar empleado (soft-delete, solo Admin)
 *     tags: [Empleados]
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
router.delete("/:id", authEmployee, onlyAdmin, Employee.deleteEmployee);

/**
 * @swagger
 * /employee/active/{id}:
 *   put:
 *     summary: Activar empleado (solo Admin)
 *     tags: [Empleados]
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
router.put("/active/:id", authEmployee, onlyAdmin, Employee.activeEmployee);

/**
 * @swagger
 * /employee:
 *   get:
 *     summary: Listar todos los empleados
 *     tags: [Empleados]
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
router.get("/", authEmployee, Employee.getAll);

/**
 * @swagger
 * /employee/{id}:
 *   get:
 *     summary: Obtener empleado por ID
 *     tags: [Empleados]
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
router.get("/:id", authEmployee, Employee.getById);

export default router;
