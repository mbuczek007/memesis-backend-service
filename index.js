const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const requestIp = require('request-ip');

const authRouter = require('./routes/auth-router');
const itemRouter = require('./routes/item-router');
const commentRouter = require('./routes/comment-router');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(requestIp.mw());

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/auth/', authRouter);
app.use('/', itemRouter);
app.use('/comments/', commentRouter);

app.use('/uploads/items', express.static(__dirname + '/uploads/items'));

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port ${port}`));
