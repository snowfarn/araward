import mysql from 'mysql2/promise';

let pool = null;
let tableInitialized = false;

export function getMySQLPool() {
  if (!pool) {
    const host = process.env.MYSQL_HOST;
    const user = process.env.MYSQL_USER;
    const password = process.env.MYSQL_PASSWORD;
    const database = process.env.MYSQL_DATABASE;
    const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;

    // Only activate MySQL if credentials are provided in .env
    if (host && user && database) {
      try {
        pool = mysql.createPool({
          host,
          port,
          user,
          password: password || '',
          database,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 8000,
          enableKeepAlive: true,
          keepAliveInitialDelay: 10000,
        });
      } catch (err) {
        console.error('[mysql] Pool creation failed:', err);
      }
    }
  }
  return pool;
}

export async function ensureMySQLTable(p) {
  if (tableInitialized) return;
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`gang_storage\` (
        \`filename\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`data\` LONGTEXT NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableInitialized = true;
  } catch (err) {
    console.error('[mysql] Could not ensure gang_storage table:', err);
  }
}
