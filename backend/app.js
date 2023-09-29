const express = require("express");
const app = express();
const ErrorMiddleWare = require("./middlewares/error");
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "./config/.env" });
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileupload());
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// import route controllers
const user = require("./controllers/userController");

app.use("/api/v1/user", user);

// Error Middle ware
app.use(ErrorMiddleWare);

module.exports = app;
