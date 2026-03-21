// models/patientModel.js
import pool from "../config/db.js";

/** Crea un paciente nuevo */
export const newPatient = async (clientId, speciesId, name, color, breed, sex) => {
  await pool.query(
    "CALL sp_new_patient($1, $2, $3, $4, $5, $6)",
    [clientId, speciesId, name, color, breed, sex]
  );
};

/** Actualiza datos del paciente */
export const updatePatient = async (patientId, clientId, speciesId, name, color, breed, sex) => {
  await pool.query(
    "CALL sp_update_patient($1, $2, $3, $4, $5, $6, $7)",
    [patientId, clientId, speciesId, name, color, breed, sex]
  );
};

/** Obtiene pacientes de un cliente */
export const getByClient = async (clientId) => {
  const result = await pool.query(
    "SELECT * FROM fn_get_patients_by_client($1)",
    [clientId]
  );
  return result.rows;
};

/** Lista todos los pacientes (vista completa para admin) */
export const getAll = async () => {
  const result = await pool.query("SELECT * FROM vw_patients ORDER BY patient_id");
  return result.rows;
};

/** Obtiene un paciente específico */
export const getById = async (patientId) => {
  const result = await pool.query(
    "SELECT * FROM vw_patient_details WHERE patient_id = $1",
    [patientId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};
