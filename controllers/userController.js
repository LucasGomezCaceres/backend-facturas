const { pool } = require("../models/db");

async function getUsers(req, res) {
  const estado = req.query.estado;
  const result = estado
    ? await pool.query("SELECT id, correo, nombre, unidad, rol, estado, fecha_registro FROM usuarios WHERE estado = $1 ORDER BY fecha_registro DESC", [estado])
    : await pool.query("SELECT id, correo, nombre, unidad, rol, estado, fecha_registro FROM usuarios ORDER BY fecha_registro DESC");
  res.json(result.rows);
}

async function approveUser(req, res) {
  await pool.query("UPDATE usuarios SET estado = 'ACTIVO' WHERE id = $1 AND rol <> 'ADMIN'", [req.params.id]);
  res.json({ ok: true });
}

async function deactivateUser(req, res) {
  await pool.query("UPDATE usuarios SET estado = 'INACTIVO' WHERE id = $1 AND rol <> 'ADMIN'", [req.params.id]);
  res.json({ ok: true });
}

async function activateUser(req, res) {
  await pool.query("UPDATE usuarios SET estado = 'ACTIVO' WHERE id = $1 AND rol <> 'ADMIN'", [req.params.id]);
  res.json({ ok: true });
}

async function deleteUser(req, res) {
  await pool.query("DELETE FROM usuarios WHERE id = $1 AND rol <> 'ADMIN'", [req.params.id]);
  res.json({ ok: true });
}

module.exports = { getUsers, approveUser, deactivateUser, activateUser, deleteUser };
