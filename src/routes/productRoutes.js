// routes/productRoutes.js
import express from "express";
import * as Product from "../controllers/productController.js";
import { authEmployee } from "../middleware/authEmployee.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Catálogo de productos
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Crear producto (admin)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, name, price, category_id, subcategory_id, stock]
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: SKU / código de negocio
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *               price:
 *                 type: number
 *               category_id:
 *                 type: integer
 *               subcategory_id:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               image_url:
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
router.post("/", authEmployee, Product.newProduct);

/**
 * @swagger
 * /product/{id}:
 *   put:
 *     summary: Actualizar producto por concept_id
 *     tags: [Productos]
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
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *               price:
 *                 type: number
 *               category_id:
 *                 type: integer
 *               subcategory_id:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               image_url:
 *                 type: string
 *               active:
 *                 type: boolean
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
router.put("/:id", authEmployee, Product.updateProduct);

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Desactivar producto (soft-delete)
 *     tags: [Productos]
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
router.delete("/:id", authEmployee, Product.deleteProduct);

/**
 * @swagger
 * /product/{id}/activate:
 *   patch:
 *     summary: Reactivar producto
 *     tags: [Productos]
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
router.patch("/:id/activate", authEmployee, Product.activateProduct);

/**
 * @swagger
 * /product/admin:
 *   get:
 *     summary: Vista admin — todos los productos con costo
 *     tags: [Productos]
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
router.get("/admin", authEmployee, Product.getAllAdmin);

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Catálogo mobile — productos activos con stock > 0
 *     tags: [Productos]
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
router.get("/", Product.getAllActive);

/**
 * @swagger
 * /product/catalog:
 *   get:
 *     summary: Catálogo dashboard productos y servicios
 *     tags: [Productos]
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
router.get("/catalog", authEmployee, Product.getCatalog);

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Obtener producto por concept_id
 *     tags: [Productos]
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
router.get("/:id", Product.getById);

export default router;
