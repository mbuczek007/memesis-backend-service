const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentVotes = new Schema(
  {
    userId: { type: Number, required: true },
    votedCommentId: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('commentvotes', CommentVotes);
