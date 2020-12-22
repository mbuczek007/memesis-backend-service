const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentVotes = new Schema(
  {
    userId: { type: Number, required: false },
    votedCommentId: { type: Number, required: true },
    ipAddress: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('commentVotes', CommentVotes);
