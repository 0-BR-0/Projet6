const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const multer = require('../middlewares/multer-config');

const bookControler = require("../controlers/book");


router.get("/", bookControler.getAllBooks);
router.post("/", auth, multer, bookControler.createBook);
router.get("/:id", bookControler.getOneBook);
router.put("/:id", auth, multer, bookControler.modifyBook);
router.delete("/:id", auth, bookControler.deleteBook);
// router.post("/books/:id/rating")

module.exports = router;