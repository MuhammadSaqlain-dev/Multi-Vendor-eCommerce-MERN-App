const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../model/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const cloudinary = require("cloudinary");

const sendEmail = require("../utils/sendEmail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middlewares/auth");

router.post(
  "/create-user",
  catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      return next(
        new ErrorHandler(400, `user with this email ${email} already exists.`)
      );
    }

    const myCloud = await cloudinary.v2.uploader.upload(req.body.file, {
      folder: "avatars-MV",
      width: 150,
      crop: "scale",
    });

    const user = {
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.url,
      },
    };

    const activationToken = createActivationToken(user);
    const activationUrl = `https://multi-vendor-e-commerce-mern-app-frontend.vercel.app/activate/${activationToken}`;

    try {
      sendEmail({
        email: user.email,
        subject: `Complete your signup by clicking the link inside`,
        emailMessage: `Hi ${user.name}!
        This is activation Url: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `please check your email:- ${user.email} to activate your account!`,
      });
    } catch (error) {
      return next(new ErrorHandler(400, error.message));
    }
  })
);

const createActivationToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET_KEY, {
    expiresIn: "10m",
  });
};

router.post(
  "/activation",
  catchAsyncError(async (req, res, next) => {
    const { activation_token } = req.body;
    const newUser = jwt.verify(activation_token, process.env.JWT_SECRET_KEY);

    if (!newUser) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    const { name, email, password, avatar } = newUser;

    let user = await User.findOne({ email });

    if (user) {
      return next(new ErrorHandler(400, "User already exists"));
    }
    user = await User.create({
      name,
      email,
      avatar,
      password,
    });

    sendToken(user, 201, res);
  })
);

// login user
router.post(
  "/login",
  catchAsyncError(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler(400, "Please provide the all fields!"));
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler(400, "User doesn't exists!"));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler(400, "Please provide the correct information")
        );
      }

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load user
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new ErrorHandler(401, "User does'nt exist."));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// logout user
router.get(
  "/logout",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.status(200).json({
        success: true,
        message: "Logout successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
