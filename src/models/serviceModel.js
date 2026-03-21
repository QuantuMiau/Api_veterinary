import pool from "../config/db.js";

/** Crea un servicio. duration en formato '00:30:00' */
export const newService = async (name, cost, price, duration, service_type) => {
  await pool.query(
    "CALL sp_new_service($1, $2, $3, $4, $5)",
    [name, cost, price, duration, service_type]
  );
};

/** Actualiza servicio */
export const updateService = async (conceptId, name, cost, price, duration, active, service_type) => {
  await pool.query(
    "CALL sp_update_service($1, $2, $3, $4, $5, $6, $7)",
    [conceptId, name, cost, price, duration, active, service_type]
  );
};

/** Soft-delete */
export const deleteService = async (conceptId) => {
  await pool.query("CALL sp_delete_service($1)", [conceptId]);
};

/** Reactiva servicio */
export const activateService = async (conceptId) => {
  await pool.query("CALL sp_activate_service($1)", [conceptId]);
};

/** Lista todos los servicios */
export const getAll = async () => {
  const result = await pool.query("SELECT * FROM vw_services ORDER BY concept_id");
  return result.rows;
};
