// config/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === "production" || process.env.DATABASE_URL;

const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
    };

const pool = new Pool({
  ...dbConfig,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

if (process.env.DATABASE_URL) {
  console.log("Conectando usando DATABASE_URL");
} else {
  console.log(`Conectando usando parámetros individuales (Host: ${process.env.DB_HOST || 'local'})`);
}

pool
  .connect()
  .then((client) => {
    console.log("Conexión a la DB exitosa");
    client.release();
  })
  .catch((err) => {
    console.error("Error al conectar a la DB:", err);
  });

export default pool;
