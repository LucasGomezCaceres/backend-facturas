const express = require("express");
const router = express.Router();
const { authRequired, adminRequired } = require("../middleware/authMiddleware");
const facturaController = require("../controllers/facturaController");

router.use(authRequired);

router.post("/", facturaController.createFactura);
router.get("/", facturaController.getFacturas);
// router.get("/:id", facturaController.getFacturaById);
router.put("/:id", facturaController.updateFactura);
router.delete("/:id", adminRequired, facturaController.deleteFactura);

module.exports = router;
