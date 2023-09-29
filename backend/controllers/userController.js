const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../model/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const path = require("path");
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary");

router.post(
  "/create-user",
  catchAsyncError(async (req, res, next) => {
    try {
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

      const createdUser = {
        name,
        email,
        password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.url,
        },
      };

      const user = await User.create(createdUser);
      res.status(201).json({
        user,
      });
    } catch (error) {
      console.log("ErrorM:", error);
      return res.status(500).json({ message: "MMInternal server error." });
    }
  })
);

module.exports = router;
