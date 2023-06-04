require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const router = require('./routes');
const cors = require('cors');

const {
    HTTP_PORT = 3000
} = process.env;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use('/images', express.static('public/images'));
app.set('view engine', 'ejs');

app.use(router);

// 500
app.use((err, req, res, next) => {
    console.log(err);
    return res.status(500).json({
        status: false,
        message: err.message,
        data: null
    });
});

module.exports = app;