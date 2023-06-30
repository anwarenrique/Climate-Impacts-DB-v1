const express = require("express");
const router = express.Router();
const editController = require("../controllers/edit");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/:id", ensureAuth, editController.getEdit); //take you to the 'edit post' view
router.get("/remove/:id", ensureAuth, editController.deleteItem); //delete a post you made
router.post("/update/:id", ensureAuth, editController.updateItem); //save the changes of your edit

module.exports = router;
