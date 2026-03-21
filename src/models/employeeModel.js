// models/employeeModel.js
import pool from "../config/db.js";

/**
 * Busca empleado por email incluyendo password (solo para login).
 * Se hace query a la tabla directamente porque vw_employees no expone password.
 */
export const findByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM "Employees" WHERE email = $1`,
    [email]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

/** Crea un empleado nuevo */
export const register = async (firstName, lastName, motherName, email, phone, password, role = "Empleado") => {
  await pool.query(
    "CALL sp_new_employee($1, $2, $3, $4, $5, $6, $7)",
    [firstName, lastName, motherName, email, phone, password, role]
  );
};

/** Actualiza datos del empleado (sin contraseña) */
export const updateEmployee = async (employeeId, firstName, lastName, motherName, email, phone, role) => {
  await pool.query(
    "CALL sp_update_employee($1, $2, $3, $4, $5, $6, $7)",
    [employeeId, firstName, lastName, motherName, email, phone, role]
  );
};

/** Actualiza solo la contraseña del empleado */
export const updatePassword = async (employeeId, password) => {
  await pool.query(
    "CALL sp_update_employee_password($1, $2)",
    [employeeId, password]
  );
};

/** Soft-delete del empleado */
export const deleteEmployee = async (employeeId) => {
  await pool.query("CALL sp_delete_employee($1)", [employeeId]);
};

/** activa empleado */
export const activeEmployee = async (employeeId) => {
  await pool.query("CALL sp_active_employee($1)", [employeeId]);
};


/** Obtiene empleado por ID */
export const getById = async (employeeId) => {
  const result = await pool.query(
    "SELECT * FROM fn_get_employee_by_id($1)",
    [employeeId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

/** Lista todos los empleados */
export const getAll = async () => {
  const result = await pool.query("SELECT * FROM vw_employees WHERE status = true ORDER BY employee_id");
  return result.rows;
};
