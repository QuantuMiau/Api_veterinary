// models/userModel.js
import pool from "../config/db.js";

/** Login: busca usuario con password hash para comparación con bcrypt */
export const findByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM "Users" WHERE email = $1`,
    [email]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

/** Obtiene cart_id del usuario (tras validar credenciales en JS) */
export const getCartId = async (userId) => {
  const result = await pool.query(
    `SELECT cart_id FROM "Carts" WHERE user_id = $1`,
    [userId]
  );
  return result.rows.length > 0 ? result.rows[0].cart_id : null;
};


/** Crea usuario nuevo (el carrito se crea automáticamente por el SP) */
export const register = async (firstName, lastName, motherName, email, phone, password) => {
  await pool.query(
    "CALL sp_new_user($1, $2, $3, $4, $5, $6)",
    [firstName, lastName, motherName, email, phone, password]
  );
};

/** Actualiza datos del usuario (sin contraseña) */
export const updateUser = async (userId, firstName, lastName, motherName, email, phone) => {
  await pool.query(
    "CALL sp_update_user($1, $2, $3, $4, $5, $6)",
    [userId, firstName, lastName, motherName, email, phone]
  );
};

/** Actualiza solo la contraseña */
export const updatePassword = async (userId, password) => {
  await pool.query(
    "CALL sp_update_user_password($1, $2)",
    [userId, password]
  );
};

/** Obtiene usuario por ID */
export const getUserById = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM fn_get_user_by_id($1)",
    [userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};
