// models/cartModel.js
import pool from "../config/db.js";

/** Contenido del carrito de un usuario */
export const viewCart = async (userId) => {
  const result = await pool.query("SELECT * FROM fn_user_cart($1)", [userId]);
  return result.rows;
};

/** Agrega producto al carrito (o incrementa cantidad) */
export const addToCart = async (cartId, conceptId, quantity) => {
  await pool.query("CALL sp_add_to_cart($1, $2, $3)", [cartId, conceptId, quantity]);
};

/** Actualiza cantidad; si quantity <= 0 elimina el producto */
export const updateQuantity = async (cartId, conceptId, quantity) => {
  await pool.query("CALL sp_update_cart_quantity($1, $2, $3)", [cartId, conceptId, quantity]);
};

/** Elimina un producto del carrito */
export const removeFromCart = async (cartId, conceptId) => {
  await pool.query("CALL sp_remove_from_cart($1, $2)", [cartId, conceptId]);
};
