const express = require("express");
const router = express.Router();
const { authRequired, adminRequired } = require("../middleware/authMiddleware");
const exportController = require("../controllers/exportController");

router.use(authRequired);
router.use(adminRequired);

router.get("/csv", exportController.exportCsv);
router.get("/excel", exportController.exportExcel);

module.exports = router;
