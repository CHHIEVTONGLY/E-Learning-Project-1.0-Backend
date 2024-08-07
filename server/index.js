require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const uri = process.env.MONGODB_URI;

const userRouter = require("./routers/userRouter");
const paypalRouter = require("./routers/paypalRouter");
const courseRouter = require("./routers/courseRouter");
const ABARouter = require("./routers/ABARouter");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); //

app.use(express.static("../frontend/dist"));

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/api/user", userRouter);
app.use("/api/paypal", paypalRouter);
app.use("/api/course", courseRouter);

app.use("/api/aba", ABARouter);

mongoose.connect(uri).then(() => {
  console.log("MongoDB connected successfully");
});

app.listen(3000, () => console.log("Server started on port 3000"));
