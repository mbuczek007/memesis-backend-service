const express = require('express');

const CommentCtrl = require('../controllers/comment-ctrl');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/action/add', auth.authCheck, CommentCtrl.createComment);
router.post('/action/vote', auth.authCheck, CommentCtrl.commentVote);
router.get('/:itemId', CommentCtrl.getComments);

module.exports = router;
