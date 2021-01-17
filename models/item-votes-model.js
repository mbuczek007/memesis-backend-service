const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemVotes = new Schema(
  {
    votedItemId: { type: Number, required: true },
    ipAddress: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('itemvotes', ItemVotes);
