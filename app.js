require("dotenv").config();
const express = require("express");

// -- Initialize express app
const app = express();

// --- Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Default route
app.get("/", (req, res) => {
    res.send("YallaCyprus - KSUM");
});

// --- Listen on port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
    console.log("Server listening successfully on port ", PORT)
);