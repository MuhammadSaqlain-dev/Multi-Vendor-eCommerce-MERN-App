const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log("sendMail.js");
  console.log(
    process.env.SMTP_HOST,
    process.env.SMTP_PORT,
    process.env.SMTP_USERNAME,
    process.env.SMTP_PASSWORD
  );
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
};

module.exports = sendEmail;
