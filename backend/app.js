const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require("cors");

const app = express();

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


app.use("/api/auth", userRoutes);
app.use("/api/auth", signUp);
app.use("/api/auth", logIn);


app.use("/api/auth/login", userRoutes);

// app.use("/api/books", bookRoutes);

function signUp(req, res, next) {
    const body = req.body;
    console.log("signUp body:", body);
    next();
}

function logIn(req, res, next) {
    const body = req.body;
    console.log("logIn body:", body);
    next();
}

app.use((req, res, next) => {
    console.log('Requête reçue !');
    next();
});

app.use((req, res, next) => {
    res.status(201);
    next();
});

app.use((req, res, next) => {
    res.json({ message: 'Votre requête a bien été reçue !' });
    next();
});

app.use((req, res, next) => {
    console.log('Réponse envoyée avec succès !');
});

module.exports = app;