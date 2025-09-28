const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTP = async (phoneNumber, otp) => {
  await client.messages.create({
    body: `Your VroPay verification code is: ${otp}. This code will expire in 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
};

const sendPhoneUpdateOTP = async (phoneNumber, otp) => {
  await client.messages.create({
    body: `Your VroPay phone number update verification code is: ${otp}. This code will expire in 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
};

module.exports = { sendOTP, sendPhoneUpdateOTP };