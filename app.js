const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();


const todoRoutes = require("./routes/todo");
const authRoutes = require('./routes/auth');

app.use(express.urlencoded({extended: true,}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());

app.use("/todo", todoRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect("mongodb+srv://mongo:12345@cluster0.t1iooe7.mongodb.net/todo")
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
