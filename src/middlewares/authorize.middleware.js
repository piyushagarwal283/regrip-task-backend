const { Task } = require('../models');

async function authorizeTaskOwner(req, res, next) {
  const taskId = req.params.id;
  const userId = req.user.id;

  const task = await Task.findOne({ where: { id: taskId, UserId: userId } });
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  req.task = task;
  next();
}

module.exports = { authorizeTaskOwner };
