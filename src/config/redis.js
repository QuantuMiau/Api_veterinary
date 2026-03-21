// src/config/redis.js
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Verificación de conexión al inicio
redis.ping()
  .then(() => console.log('✅ [Redis] Conexión a Upstash establecida correctamente'))
  .catch((err) => console.error('❌ [Redis] Error al conectar con Upstash:', err.message));

export default redis;
