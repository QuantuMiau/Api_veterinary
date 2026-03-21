// models/creditModel.js
import pool from "../config/db.js";

/**
 * Registra un abono a un crédito.
 * El trigger cierra el crédito automáticamente cuando se cubre el saldo.
 */
export const addPayment = async (creditId, amount) => {
  await pool.query("CALL sp_add_credit_payment($1, $2)", [creditId, amount]);
};

/** Lista créditos pendientes */
export const getPending = async () => {
  const result = await pool.query(
    "SELECT * FROM vw_pending_credits WHERE paid = false ORDER BY credit_id"
  );
  return result.rows;
};

/** Lista todos los créditos (incluyendo pagados) */
export const getAll = async () => {
  const result = await pool.query("SELECT * FROM vw_pending_credits ORDER BY credit_id DESC");
  return result.rows;
};

/** Créditos de un cliente específico */
export const getByClient = async (clientId) => {
  const result = await pool.query(
    "SELECT * FROM vw_pending_credits WHERE client_id = $1",
    [clientId]
  );
  return result.rows;
};

/** Historial de abonos de un crédito */
export const getDetail = async (creditId) => {
  const result = await pool.query(
    "SELECT * FROM vw_credit_payments WHERE credit_id = $1",
    [creditId]
  );
  return result.rows;
};
