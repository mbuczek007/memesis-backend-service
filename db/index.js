const mongoose = require('mongoose');

const productionSetting =
  'mongodb://mongodb.server621526.nazwa.pl:4012/server621526_memesis01';
const devSetting = 'mongodb://127.0.0.1:27017/memesis-km-database-dev';

mongoose
  .connect(productionSetting, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.error('Connection error', e.message);
  });

const db = mongoose.connection;

module.exports = db;
