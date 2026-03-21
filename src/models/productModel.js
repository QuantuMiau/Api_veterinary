import pool from "../config/db.js";
import redis from "../config/redis.js";

const CACHE_KEY_PRODUCTS = "products:active";
const CACHE_KEY_CATALOG = "products:catalog";
const CACHE_KEY_ADMIN = "products:admin";

const invalidateCache = async () => {
  try {
    console.log('🧹 [Redis] Invalidando caché de productos');
    await redis.del(CACHE_KEY_PRODUCTS, CACHE_KEY_CATALOG, CACHE_KEY_ADMIN);
  } catch (err) {
    console.error("Redis Cache Invalidation Error:", err);
  }
};

export const newProduct = async (productId, name, description, cost, price, categoryId, subcategoryId, stock, imageUrl) => {
  await pool.query(
    "CALL sp_new_product($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    [productId, name, description, cost, price, categoryId, subcategoryId, stock, imageUrl]
  );
  await invalidateCache();
};

export const updateProduct = async (conceptId, name, description, cost, price, categoryId, subcategoryId, stock, imageUrl, active) => {
  await pool.query(
    "CALL sp_update_product($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    [conceptId, name, description, cost, price, categoryId, subcategoryId, stock, imageUrl, active]
  );
  await invalidateCache();
};

export const deleteProduct = async (conceptId) => {
  await pool.query("CALL sp_delete_product($1)", [conceptId]);
  await invalidateCache();
};
export const activateProduct = async (conceptId) => {
  await pool.query("CALL sp_activate_product($1)", [conceptId]);
  await invalidateCache();
};

// catalogo de app mobile
export const getActive = async () => {
  try {
    const cached = await redis.get(CACHE_KEY_PRODUCTS);
    if (cached) {
      console.log('⚡ [Redis] Obteniendo productos activos desde caché');
      return cached;
    }
  } catch (err) {
    console.error("Redis Cache GET Error (Active):", err);
  }

  console.log('🗄️ [DB] Consultando productos activos en PostgreSQL');
  const result = await pool.query("SELECT * FROM vw_products_active");

  try {
    await redis.set(CACHE_KEY_PRODUCTS, result.rows, { ex: 3600 }); // 1h cache
  } catch (err) {
    console.error("Redis Cache SET Error (Active):", err);
  }

  return result.rows;
};

// catalogo para dash
export const getCatalog = async () => {
  try {
    const cached = await redis.get(CACHE_KEY_CATALOG);
    if (cached) {
      console.log('Obteniendo redis');
      return cached;
    }
  } catch (err) {
    console.error("Error:", err);
  }

  console.log('Consultando en postres xd');
  const result = await pool.query("SELECT * FROM vw_catalog");

  try {
    // a una hora xd
    await redis.set(CACHE_KEY_CATALOG, result.rows, { ex: 3600 });
  } catch (err) {
    console.error("Redis Cache SET Error (Catalog):", err);
  }

  return result.rows;
}

// lista para dash admin
export const getAll = async () => {
  try {
    const cached = await redis.get(CACHE_KEY_ADMIN);
    if (cached) {
      console.log('Obteniendo redis');
      return cached;
    }
  } catch (err) {
    console.error("Error:", err);
  }

  console.log('Consultando en postres xd');
  const result = await pool.query("SELECT * FROM vw_product_details ORDER BY concept_id");

  try {
    await redis.set(CACHE_KEY_ADMIN, result.rows, { ex: 3600 });
  } catch (err) {
    console.error("Redis Cache SET Error (Admin):", err);
  }

  return result.rows;
};

export const getById = async (conceptId) => {
  const result = await pool.query(
    "SELECT * FROM vw_product_details WHERE concept_id = $1",
    [conceptId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};
