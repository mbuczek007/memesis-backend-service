const express = require('express');
const ItemCtrl = require('../controllers/item-ctrl');

const auth = require('../middleware/auth');

const router = express.Router();

router.post('/item', auth.authCheck, ItemCtrl.createItem);
router.get('/item/:id', ItemCtrl.getItemById);
router.get('/items/:perPage/:offset', ItemCtrl.getItems);
router.get('/items/:mode/:perPage/:offset', ItemCtrl.getItems);
router.get('/count/items/:mode?', ItemCtrl.getItemsCount);

module.exports = router;
