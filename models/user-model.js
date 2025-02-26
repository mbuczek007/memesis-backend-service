const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const User = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 64,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 20,
    },
    fb_id: {
      type: Number,
      required: false,
    },
    signUpIp: { type: String, required: true },
    lastLoginIp: { type: String, required: true },
    isBlocked: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

User.plugin(AutoIncrement, { inc_field: 'user_id' });
module.exports = mongoose.model('user', User);
