const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();

const itemRouter = require('./routes/item-router');
const authRouter = require('./routes/auth-router');
const commentRouter = require('./routes/comment-router');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/', itemRouter);
app.use('/auth/', authRouter);
app.use('/comments/', commentRouter);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port ${port}`));
