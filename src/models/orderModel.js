// models/orderModel.js
import pool from "../config/db.js";

/** Crea una orden desde el carrito del usuario */
export const newOrder = async (userId, paymentMethod) => {
  await pool.query("CALL sp_create_order($1, $2)", [userId, paymentMethod]);
};

/** Actualiza el estado de una orden */
export const updateOrderStatus = async (orderId, orderStatus) => {
  await pool.query("CALL sp_update_order_status($1, $2)", [orderId, orderStatus]);
};

/** Lista órdenes de un usuario */
export const getByUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM vw_orders_basic WHERE user_id = $1",
    [userId]
  );
  return result.rows;
};

export const getAllOrders = async () => {
  const result = await pool.query("SELECT * FROM vw_user_orders");
  return result.rows;
}

/** Detalle de una orden específica */
export const getDetails = async (orderId) => {
  const result = await pool.query(
    "SELECT * FROM vw_order_details WHERE order_id = $1",
    [orderId]
  );
  return result.rows;
};
