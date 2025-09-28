const nodemailer = require("nodemailer");

 const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "VroPay - Email Verification OTP",
    html: `
            <h2>Email Verification</h2>
            <p>Your OTP for email verification is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
        `,
  };

  await transporter.sendMail(mailOptions);
};

const sendEmailUpdateOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "VroPay - Email Update Verification",
    html: `
            <h2>Email Update Verification</h2>
            <p>Your OTP for email update verification is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
        `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP, sendEmailUpdateOTP };
