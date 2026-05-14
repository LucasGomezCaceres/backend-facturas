const express = require("express");
const router = express.Router();
const { authRequired, adminRequired } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.use(authRequired);
router.use(adminRequired);

router.get("/", userController.getUsers);
router.patch("/:id/approve", userController.approveUser);
router.patch("/:id/deactivate", userController.deactivateUser);
router.patch("/:id/activate", userController.activateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
