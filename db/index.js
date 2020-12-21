const mongoose = require('mongoose');

mongoose
  .connect('mongodb://77.55.215.248:27017/vps-memesis-km-database-dev', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.error('Connection error', e.message);
  });

const db = mongoose.connection;

module.exports = db;
