// src/config/redis.js
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

redis.ping()
  .then(() => console.log('Conexión a Upstash bien'))
  .catch((err) => console.error('Error al conectar con Upstash:', err.message));

export default redis;
