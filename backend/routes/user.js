const express = require("express");
const router = express.Router();
const userControler = require("../controlers/user");

router.post("/signup", userControler.signup);
router.post("/login", userControler.login);

module.exports = router;