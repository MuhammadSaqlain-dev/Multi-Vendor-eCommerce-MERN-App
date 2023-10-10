const app = require("./app");
const cloudinary = require("cloudinary");
const connectDatabase = require("./db/Database");

// handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err}`);
  console.log("server is shutting down due to uncaught exception errors.");
  process.exit(1);
});

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "./config/.env" });
}

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () =>
  console.log(`server is connected to port ${process.env.PORT}`)
);

// unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  console.log(
    "server is shutting down due to unhandled promise rejection errors."
  );
  server.close(() => process.exit(1));
});
