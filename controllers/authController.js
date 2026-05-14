const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../models/db");
const { normalizeEmail, validateEmail } = require("../config/helpers");
const JWT_SECRET = process.env.JWT_SECRET || "CAMBIAR_SECRET_EN_RAILWAY";

function signToken(user) {
  return jwt.sign({ id: user.id, correo: user.correo, rol: user.rol }, JWT_SECRET, { expiresIn: "8h" });
}

async function register(req, res) {
  try {
    const correo = normalizeEmail(req.body.correo);
    const clave = String(req.body.clave || "");
    const nombre = String(req.body.nombre || "").trim();
    const unidad = String(req.body.unidad || "").trim();

    if (!correo || !clave || !nombre || !unidad) return res.status(400).json({ error: "Debe completar nombre, unidad, correo y clave." });
    if (!validateEmail(correo)) return res.status(400).json({ error: "Debe ingresar un correo válido." });
    if (clave.length < 6) return res.status(400).json({ error: "La clave debe tener al menos 6 caracteres." });

    const exists = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [correo]);
    if (exists.rowCount > 0) return res.status(409).json({ error: "Ese correo ya está registrado. Use la opción Ingresar." });

    const hash = await bcrypt.hash(clave, 10);
    await pool.query(
      `INSERT INTO usuarios (correo, clave_hash, nombre, unidad, rol, estado)
       VALUES ($1, $2, $3, $4, 'USUARIO', 'PENDIENTE')`,
      [correo, hash, nombre, unidad]
    );

    res.status(201).json({ ok: true, message: "Registro enviado. Espere que el administrador acepte su usuario." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario." });
  }
}

async function login(req, res) {
  try {
    const correo = normalizeEmail(req.body.correo);
    const clave = String(req.body.clave || "");
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);

    if (result.rowCount === 0) return res.status(401).json({ error: "Correo o clave incorrectos." });

    const user = result.rows[0];
    const ok = await bcrypt.compare(clave, user.clave_hash);
    if (!ok) return res.status(401).json({ error: "Correo o clave incorrectos." });
    if (user.estado === "PENDIENTE") return res.status(403).json({ error: "Su usuario está pendiente de aceptación por el administrador." });
    if (user.estado !== "ACTIVO") return res.status(403).json({ error: "Usuario inactivo o eliminado." });

    res.json({
      token: signToken(user),
      user: { id: user.id, correo: user.correo, nombre: user.nombre, unidad: user.unidad, rol: user.rol, estado: user.estado }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al ingresar." });
  }
}

async function me(req, res) {
  const result = await pool.query("SELECT id, correo, nombre, unidad, rol, estado FROM usuarios WHERE id = $1", [req.user.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "Usuario no encontrado." });
  res.json({ user: result.rows[0] });
}

module.exports = { register, login, me };
