// helpers/pgErrors.js
/**
 * Mapea códigos de error de PostgreSQL a respuestas HTTP.
 * Los SPs de esta DB lanzan excepciones con SQLSTATE P0001/P0002/P0003.
 *
 * P0001 → registro no existe / crédito ya pagado / monto inválido
 * P0002 → email duplicado
 * P0003 → teléfono duplicado
 * 23505  → unique violation genérico
 * 23503  → foreign key violation
 */

const PG_ERROR_MAP = {
  P0002: { status: 409, message: "El email ya está registrado" },
  P0003: { status: 409, message: "El teléfono ya está registrado" },
  "23505": { status: 409, message: "Ya existe un registro con ese valor" },
  "23503": { status: 400, message: "Referencia no encontrada (clave foránea)" },
};

/**
 * Parsea un error de PostgreSQL y retorna { status, message }.
 * Si no se reconoce el código, devuelve 500.
 */
export const parsePgError = (error) => {
  const mapped = PG_ERROR_MAP[error.code];
  if (mapped) return mapped;

  // Si es un RAISE EXCEPTION genérico de PL/pgSQL
  if (error.code === 'P0001' && error.message) {
    let status = 400;
    if (error.message.toLowerCase().includes("no existe") || error.message.toLowerCase().includes("no encontrad")) {
      status = 404;
    } else if (error.message.toLowerCase().includes("registrado") || error.message.toLowerCase().includes("duplicado")) {
      status = 409;
    }
    return { status, message: error.message };
  }

  // Intentar extraer el mensaje del SP directamente
  if (error.message) {
    return { status: 400, message: error.message };
  }

  return { status: 500, message: "Error interno del servidor" };
};
