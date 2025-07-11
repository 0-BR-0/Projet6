const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require("cors");

const app = express();
const path = require('path');

const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;