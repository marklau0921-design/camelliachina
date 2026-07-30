import mysql from 'mysql2/promise';

try {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'camellia',
    password: 'camellia123',
    database: 'camellia_local'
  });
  const conn = await pool.getConnection();
  const [rows] = await conn.query('SELECT COUNT(*) as cnt FROM cities');
  console.log('✅ Cities count:', rows[0].cnt);
  conn.release();
  pool.end();
} catch (e) {
  console.error('❌ Error:', e.message);
}
