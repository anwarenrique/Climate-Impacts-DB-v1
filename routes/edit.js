const express = require('express')
const router = express.Router()
const editController = require('../controllers/edit')
const {ensureAuth, ensureGuest} = require('../middleware/auth')

router.get('/:id', ensureAuth, editController.getEdit)
router.get('/remove/:id', ensureAuth, editController.deleteItem)
router.post('/update/:id', ensureAuth, editController.updateItem)


module.exports = router