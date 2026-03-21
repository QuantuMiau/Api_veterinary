// routes/userRoutes.js
import express from "express";
import * as User from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuario
 *   description: Endpoints de usuarios (app mobile)
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Usuario]
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
 *         description: Login exitoso — retorna token JWT
 *       401:
 *         description: Credenciales incorrectas o usuario inactivo
 */
router.post("/login", User.login);

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Registrar nuevo usuario (crea carrito automáticamente)
 *     tags: [Usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, phone, password]
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
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       409:
 *         description: Email o teléfono ya registrado
 */
router.post("/register", User.register);

/**
 * @swagger
 * /user/update:
 *   put:
 *     summary: Actualizar datos del usuario (sin contraseña)
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       409:
 *         description: Email o teléfono ya registrado
 */
router.put("/update", auth, User.updateUser);

/**
 * @swagger
 * /user/password:
 *   put:
 *     summary: Actualizar contraseña del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
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
 *         description: Contraseña actualizada
 */
router.put("/password", auth, User.updatePassword);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/", auth, User.getUser);

export default router;
