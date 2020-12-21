const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const Comments = new Schema(
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

Comments.plugin(AutoIncrement, { inc_field: 'id' });
module.exports = mongoose.model('comments', Comments);
