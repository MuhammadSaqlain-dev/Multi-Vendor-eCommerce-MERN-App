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
app.use(
  cors({
    origin: "https://multi-vendor-e-commerce-mern-app-frontend.vercel.app",
    credentials: true,
  })
);

app.use("/testing", (req, res) => {
  res.send("Hello World, it's working..");
});

// import route controllers
const user = require("./controllers/userController");
const shop = require("./controllers/shopController");
const product = require("./controllers/productController");
const event = require("./controllers/eventController");
const order = require("./controllers/orderController");
const coupon = require("./controllers/couponController");
const withdraw = require("./controllers/withdrawController");
const payment = require("./controllers/paymentController");

app.use("/api/v1/user", user);
app.use("/api/v1/shop", shop);
app.use("/api/v1/product", product);
app.use("/api/v1/event", event);
app.use("/api/v1/order", order);
app.use("/api/v1/coupon", coupon);
app.use("/api/v1/withdraw", withdraw);
app.use("/api/v1/payment", payment);

// Error Middle ware
app.use(ErrorMiddleWare);

module.exports = app;
