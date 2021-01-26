const express = require('express');
const fileUpload = require('express-fileupload');
const ItemCtrl = require('../controllers/item-ctrl');
const auth = require('../middleware/auth');
const router = express.Router();

router.put('/item/status/change', auth.authCheck, ItemCtrl.itemStatusChange);
router.post('/item/vote', ItemCtrl.itemVote);
router.post(
  '/item',
  fileUpload({
    limits: { fileSize: 1 * 1024 * 1024 }, // 1mb
    abortOnLimit: true,
  }),
  auth.authCheck,
  ItemCtrl.createItem
);
router.get('/item/:id', ItemCtrl.getItemById);
router.get('/items/:perPage/:offset', ItemCtrl.getItems);
router.get('/items/:mode/:perPage/:offset', ItemCtrl.getItems);

module.exports = router;
