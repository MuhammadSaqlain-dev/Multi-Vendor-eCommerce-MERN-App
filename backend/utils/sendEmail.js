const nodemailer = require("nodemailer");
const ErrorHandler = require("./ErrorHandler");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      secure: true,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: options.email,
      subject: options.subject,
      text: options.emailMessage,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    return ErrorHandler(500, error.message);
  }
};

module.exports = sendEmail;
