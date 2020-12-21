const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ItemVotes = new Schema(
  {
    userId: { type: Number, required: true },
    votedItemId: { type: Number, required: true },
  },
  { timestamps: true }
);

ItemVotes.plugin(AutoIncrement, { inc_field: 'id' });
module.exports = mongoose.model('itemVotes', ItemVotes);
