require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initDb } = require("./models/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const facturaRoutes = require("./routes/facturaRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API Sistema Facturas funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/export", exportRoutes);

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
  })
  .catch(error => {
    console.error("Error inicializando base de datos:", error);
    process.exit(1);
  });
