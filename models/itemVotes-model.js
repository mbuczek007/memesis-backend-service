const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemVotes = new Schema(
  {
    userId: { type: Number, required: false },
    votedItemId: { type: Number, required: true },
    ipAddress: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('itemVotes', ItemVotes);
