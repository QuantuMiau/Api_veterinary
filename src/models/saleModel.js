// models/saleModel.js
import pool from "../config/db.js";

/**
 * Registra una venta de clínica.
 * items: array de objetos [{ concept_id, quantity, price }, ...]
 */
export const newSale = async (employeeId, clientId, paymentMethod, items) => {
  await pool.query(
    "CALL sp_new_sale($1, $2, $3, $4::json)",
    [employeeId, clientId, paymentMethod, JSON.stringify(items)]
  );
};

/** Lista todas las ventas */
export const getAll = async () => {
  const result = await pool.query("SELECT * FROM vw_sales ORDER BY sale_id DESC");
  return result.rows;
};

/** Detalle de una venta (línea por línea) */
export const getById = async (saleId) => {
  const result = await pool.query(
    "SELECT * FROM vw_sale_detail WHERE sale_id = $1",
    [saleId]
  );
  return result.rows;
};

/** Ventas de un empleado específico */
export const getByEmployee = async (employeeId) => {
  const result = await pool.query(
    "SELECT * FROM vw_sales_by_employee WHERE employee_id = $1",
    [employeeId]
  );
  return result.rows;
};
