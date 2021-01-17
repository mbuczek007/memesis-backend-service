const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    userId: { type: Number, required: true },
    itemId: { type: Number, required: true },
    commentBody: { type: String, required: true },
    votes: { type: Number, required: false, default: 0 },
    votesCount: { type: Number, required: false, default: 0 },
    parentCommentId: { type: Number, required: false },
  },
  { timestamps: true }
);

Comment.plugin(AutoIncrement, { inc_field: 'comment_id' });
module.exports = mongoose.model('comment', Comment);
