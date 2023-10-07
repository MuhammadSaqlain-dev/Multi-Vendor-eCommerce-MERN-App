const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("cloudinary");
const Shop = require("../model/shopModel");
const sendShopToken = require("../utils/shopJwtToken.js");
const { isSeller } = require("../middlewares/auth");

router.post(
  "/create-shop",
  catchAsyncError(async (req, res, next) => {
    const { name, email, password, avatar, zipCode, address, phoneNumber } =
      req.body;

    const isEmailExist = await Shop.findOne({ email });

    if (isEmailExist) {
      return next(
        new ErrorHandler(400, `Shop with this email ${email} already exists.`)
      );
    }

    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "shops-MV",
      width: 150,
      crop: "scale",
    });

    const shop = {
      name,
      email,
      password,
      zipCode,
      address,
      phoneNumber,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.url,
      },
    };

    const activationToken = createActivationToken(shop);
    const activationUrl = `http://localhost:3000/seller/activate/${activationToken}`;

    try {
      sendEmail({
        email: shop.email,
        subject: `Complete your signup by clicking the link inside`,
        emailMessage: `Hi ${shop.name}!
        This is activation Url: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `please check your email:- ${shop.email} to activate your account!`,
      });
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  })
);

const createActivationToken = (shop) => {
  return jwt.sign(shop, process.env.JWT_SECRET_KEY, {
    expiresIn: "10m",
  });
};

router.post(
  "/activation",
  catchAsyncError(async (req, res, next) => {
    const { activation_token } = req.body;
    const newShop = jwt.verify(activation_token, process.env.JWT_SECRET_KEY);

    if (!newShop) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    const { name, email, password, avatar, zipCode, address, phoneNumber } =
      newShop;

    let exists = await Shop.findOne({ email });

    if (exists) {
      return next(new ErrorHandler(400, "Shop already exists"));
    }
    const shop = await Shop.create({
      name,
      email,
      avatar,
      zipCode,
      address,
      phoneNumber,
      password,
    });

    sendShopToken(shop, 201, res);
  })
);

// login shop
router.post(
  "/login-shop",
  catchAsyncError(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler(400, "Please provide the all fields!"));
      }

      const shop = await Shop.findOne({ email }).select("+password");

      if (!shop) {
        return next(new ErrorHandler(400, "Shop doesn't exists!"));
      }

      const isPasswordValid = await shop.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler(400, "Please provide the correct information")
        );
      }

      sendShopToken(shop, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load seller
router.get(
  "/getseller",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler(401, "Seller does'nt exist."));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
