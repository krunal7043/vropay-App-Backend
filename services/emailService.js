const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmailOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'VroPay Verification Code',
    text: `Your VroPay verification code is: ${otp}. This code will expire in 10 minutes.`
  });
};

module.exports = { sendEmailOTP };