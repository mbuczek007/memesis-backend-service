require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./db');
const itemRouter = require('./routes/item-router');

const app = express();
const apiPort = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/', itemRouter);

app.listen(apiPort, () =>
  console.log(`Server running on port ${apiPort} HAHA`)
);
