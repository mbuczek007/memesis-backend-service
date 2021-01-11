const mongoose = require('mongoose');

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .catch((e) => {
    console.error('Connection error', e.message);
  });

const db = mongoose.connection;

module.exports = db;
