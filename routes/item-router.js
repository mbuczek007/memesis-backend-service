const express = require('express');
const ItemCtrl = require('../controllers/item-ctrl');

const router = express.Router();
/* router.post('/item', ItemCtrl.createItem);
router.delete('/item/:id', ItemCtrl.deleteItem);
; */
router.get('/item/:id', ItemCtrl.getItemById);
router.post('/item', ItemCtrl.createItem);
router.get('/items/:perPage/:offset', ItemCtrl.getItems);
router.get('/items/:mode/:perPage/:offset', ItemCtrl.getItems);
router.get('/count/items/:mode?', ItemCtrl.getItemsCount);

module.exports = router;
