const { User, Otp, RefreshToken, ActivityLog } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.util');
const { sendOtpEmail } = require('../utils/email.util');
const { Op } = require('sequelize');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ email });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({
      otpCode,
      expiresAt,
      consumed: false,
      UserId: user.id,
    });

    await sendOtpEmail(email, otpCode);

    await ActivityLog.create({
      UserId: user.id,
      action: 'OTP_REQUESTED',
      metadata: JSON.stringify({ email }),
    });

    res.json({ message: 'OTP sent to email (check server logs)' });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    const otpRecord = await Otp.findOne({
      where: {
        UserId: user.id,
        otpCode: otp,
        consumed: false,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!otpRecord) {
      await ActivityLog.create({
        UserId: user.id,
        action: 'LOGIN_FAILED',
        metadata: JSON.stringify({ reason: 'INVALID_OTP' }),
      });
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    otpRecord.consumed = true;
    await otpRecord.save();
    user.isVerified = true;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshTokenValue = generateRefreshToken(user);

    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      token: refreshTokenValue,
      expiresAt: refreshExpires,
      revoked: false,
      UserId: user.id,
    });

    await ActivityLog.create({
      UserId: user.id,
      action: 'LOGIN_SUCCESS',
      metadata: null,
    });

    res.json({ accessToken, refreshToken: refreshTokenValue });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const record = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        revoked: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!record) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findByPk(record.UserId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);

    await ActivityLog.create({
      UserId: user.id,
      action: 'TOKEN_REFRESH',
      metadata: null,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};
