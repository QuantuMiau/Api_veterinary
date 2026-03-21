// models/supplyModel.js
import pool from "../config/db.js";

/** Crea un insumo */
export const newSupply = async (name, cost, price, inventory) => {
  await pool.query(
    "CALL sp_new_supply($1, $2, $3, $4)",
    [name, cost, price, inventory]
  );
};

/** Actualiza insumo */
export const updateSupply = async (conceptId, name, cost, price, inventory, active) => {
  await pool.query(
    "CALL sp_update_supply($1, $2, $3, $4, $5, $6)",
    [conceptId, name, cost, price, inventory, active]
  );
};

/** Soft-delete */
export const deleteSupply = async (conceptId) => {
  await pool.query("CALL sp_delete_supply($1)", [conceptId]);
};

/** Reactiva insumo */
export const activateSupply = async (conceptId) => {
  await pool.query("CALL sp_activate_supply($1)", [conceptId]);
};

/** Lista todos los insumos */
export const getAll = async () => {
  const result = await pool.query("SELECT * FROM vw_supplies ORDER BY concept_id");
  return result.rows;
};
