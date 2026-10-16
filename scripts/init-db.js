const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function initDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS football_db;`);
    await connection.query(`USE football_db;`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(100) NOT NULL,
        number INT NOT NULL,
        image_data LONGTEXT
      );
    `);

    console.log('Database and players table initialized successfully.');
    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDB();
