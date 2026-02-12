const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middlewares/rateLimit.middleware');

const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');

router.use(apiLimiter);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
