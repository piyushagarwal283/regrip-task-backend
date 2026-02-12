async function sendOtpEmail(email, otpCode) {
  console.log(`OTP for ${email}: ${otpCode}`);
  return true;
}

module.exports = { sendOtpEmail };
