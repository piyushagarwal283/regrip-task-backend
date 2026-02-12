const { Task, ActivityLog } = require('../models');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      UserId: req.user.id,
    });

    await ActivityLog.create({
      UserId: req.user.id,
      action: 'TASK_CREATED',
      metadata: JSON.stringify({ taskId: task.id }),
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({ where: { UserId: req.user.id } });

    await ActivityLog.create({
      UserId: req.user.id,
      action: 'TASK_LIST_VIEWED',
      metadata: null,
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = req.task;
    const { title, description, status } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();

    await ActivityLog.create({
      UserId: req.user.id,
      action: 'TASK_UPDATED',
      metadata: JSON.stringify({ taskId: task.id }),
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = req.task;
    await task.destroy();

    await ActivityLog.create({
      UserId: req.user.id,
      action: 'TASK_DELETED',
      metadata: JSON.stringify({ taskId: task.id }),
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
