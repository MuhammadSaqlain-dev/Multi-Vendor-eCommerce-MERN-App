const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("cloudinary");
const Shop = require("../model/shopModel");
const sendShopToken = require("../utils/shopJwtToken.js");
const { isSeller, isAdmin, isAuthenticated } = require("../middlewares/auth");

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
      folder: "avatars-MV",
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
    const activationUrl = `https://multi-vendor-e-commerce-mern-app-frontend.vercel.app/seller/activate/${activationToken}`;

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

// log out from shop
router.get(
  "/logout",
  catchAsyncError(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop profile picture
router.put(
  "/update-shop-avatar",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      let existsSeller = await Shop.findById(req.seller._id);

      const imageId = existsSeller.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars-MV",
        width: 150,
      });

      existsSeller.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      await existsSeller.save();

      res.status(200).json({
        success: true,
        seller: existsSeller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all sellers --- for admin
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller ---admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller withdraw methods --- only seller
router.delete(
  "/delete-withdraw-method/",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
