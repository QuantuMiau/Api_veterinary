// controllers/productController.js
import * as Product from "../models/productModel.js";
import { parsePgError } from "../helpers/pgErrors.js";

/** POST /product — crear producto */
export const newProduct = async (req, res) => {
  try {
    const { product_id, name, description, cost, price, category_id, subcategory_id, stock, image_url } = req.body;

    if (!product_id || !name || !price || !category_id || !subcategory_id || stock === undefined)
      return res.status(400).json({ message: "Faltan campos requeridos" });

    await Product.newProduct(product_id, name, description, cost, price, category_id, subcategory_id, stock, image_url);
    return res.status(201).json({ ok: true, message: "Producto creado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** PUT /product/:id — actualizar producto */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cost, price, category_id, subcategory_id, stock, image_url, active } = req.body;

    await Product.updateProduct(id, name, description, cost, price, category_id, subcategory_id, stock, image_url, active);
    return res.status(200).json({ ok: true, message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** DELETE /product/:id — soft-delete */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.deleteProduct(id);
    return res.status(200).json({ ok: true, message: "Producto desactivado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** PATCH /product/:id/activate — reactivar producto */
export const activateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.activateProduct(id);
    return res.status(200).json({ ok: true, message: "Producto activado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** GET /product — catálogo público mobile (activos con stock > 0) */
export const getAllActive = async (req, res) => {
  try {
    const products = await Product.getActive();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener productos" });
  }
};

export const getCatalog = async (req, res) => {
  try {
    const products = await Product.getCatalog();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener productos" });
  }
};

/** GET /product/admin — lista completa con costo (solo empleados) */
export const getAllAdmin = async (req, res) => {
  try {
    const products = await Product.getAll();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener productos" });
  }
};

/** GET /product/:id */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el producto" });
  }
};
