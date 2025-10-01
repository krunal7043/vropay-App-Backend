const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/signup'));
app.use('/api', require('./routes/interest'));
app.use('/api', require('./routes/learnScreen'));
app.use('/api', require('./routes/signin'));
app.use('/api', require('./routes/message'));

module.exports = app;