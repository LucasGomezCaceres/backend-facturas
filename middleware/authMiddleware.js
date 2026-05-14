const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "CAMBIAR_SECRET_EN_RAILWAY";

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Sesión no válida." });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Sesión expirada. Ingrese nuevamente." });
  }
}

function adminRequired(req, res, next) {
  if (req.user.rol !== "ADMIN") return res.status(403).json({ error: "Solo el administrador puede realizar esta acción." });
  next();
}

module.exports = { authRequired, adminRequired };
