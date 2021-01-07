const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const Item = new Schema(
  {
    title: { type: String, required: true, min: 3, max: 250 },
    subtitle: { type: String, required: false, max: 1500 },
    source: { type: String, required: false, max: 1500 },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, required: true },
    isAccepted: { type: Boolean, required: false, default: false },
    acceptedDate: { type: Number, required: false },
    disableComments: { type: Boolean, required: false, default: false },
    votes: { type: Number, required: false, default: 0 },
    votesCount: { type: Number, required: false, default: 0 },
    userId: { type: Number, required: true },
  },
  { timestamps: true }
);

Item.plugin(mongoosePaginate);
Item.plugin(AutoIncrement, { inc_field: 'id' });
module.exports = mongoose.model('items', Item);
