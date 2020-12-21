const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const CommentVotes = new Schema(
  {
    userId: { type: Number, required: true },
    votedCommentId: { type: Number, required: true },
  },
  { timestamps: true }
);

CommentVotes.plugin(AutoIncrement, { inc_field: 'id' });
module.exports = mongoose.model('commentVotes', CommentVotes);
