const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { otpRequestLimiter, loginLimiter } = require('../middlewares/rateLimit.middleware');
const validate = require('../middlewares/validate.middleware');
const Joi = require('joi');

const requestOtpSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().allow('', null),
  }),
});

const verifyOtpSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  }),
});

const refreshSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
});

router.post(
  '/request-otp',
  otpRequestLimiter,
  validate(requestOtpSchema),
  authController.requestOtp
);

router.post(
  '/verify-otp',
  loginLimiter,
  validate(verifyOtpSchema),
  authController.verifyOtp
);

router.post(
  '/refresh',
  validate(refreshSchema),
  authController.refreshToken
);

module.exports = router;
