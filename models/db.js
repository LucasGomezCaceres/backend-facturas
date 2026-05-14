const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hclfgc@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Cambiar1234";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      correo TEXT UNIQUE NOT NULL,
      clave_hash TEXT NOT NULL,
      nombre TEXT NOT NULL,
      unidad TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'USUARIO',
      estado TEXT NOT NULL DEFAULT 'PENDIENTE',
      fecha_registro TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS facturas (
      id SERIAL PRIMARY KEY,
      factura TEXT NOT NULL,
      fecha DATE NOT NULL,
      proveedor TEXT NOT NULL,
      rut TEXT NOT NULL,
      pedido_compra TEXT,
      recepcion_sap TEXT,
      salida_sap TEXT,
      orden_compra TEXT,
      fecha_entrega DATE,
      destino TEXT NOT NULL,
      observacion TEXT,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      usuario_correo TEXT NOT NULL,
      fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
      ultima_modificacion TIMESTAMP,
      modificado_por TEXT
    );
  `);

  const admin = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [ADMIN_EMAIL]);
  if (admin.rowCount === 0) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      `INSERT INTO usuarios (correo, clave_hash, nombre, unidad, rol, estado)
       VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVO')`,
      [ADMIN_EMAIL, hash, "Administrador", "Administración"]
    );
    console.log("Administrador inicial creado:", ADMIN_EMAIL);
  }
}

module.exports = { pool, initDb };
