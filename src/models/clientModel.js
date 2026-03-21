// models/clientModel.js
import pool from "../config/db.js";

/** Crea un cliente nuevo */
export const newClient = async (firstName, lastName, motherName, phone, address, city) => {
  await pool.query(
    "CALL sp_new_client($1, $2, $3, $4, $5, $6)",
    [firstName, lastName, motherName, phone, address, city]
  );
};

/** Actualiza datos del cliente */
export const updateClient = async (clientId, firstName, lastName, motherName, phone, address, city) => {
  await pool.query(
    "CALL sp_update_client($1, $2, $3, $4, $5, $6, $7)",
    [clientId, firstName, lastName, motherName, phone, address, city]
  );
};

/** Obtiene cliente por ID */
export const getById = async (clientId) => {
  const result = await pool.query(
    "SELECT * FROM fn_get_client_by_id($1)",
    [clientId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

/** Lista todos los clientes */
export const getAll = async () => {
  const result = await pool.query("SELECT * FROM vw_clients ORDER BY client_id");
  return result.rows;
};
