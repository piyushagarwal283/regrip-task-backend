const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeTaskOwner } = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const Joi = require('joi');

const createTaskSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().allow(''),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'DONE').default('PENDING'),
  }),
});

const updateTaskSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(1).max(100),
    description: Joi.string().allow(''),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'DONE'),
  }),
});

router.post('/', authMiddleware, validate(createTaskSchema), taskController.createTask);
router.get('/', authMiddleware, taskController.getTasks);
router.put('/:id', authMiddleware, authorizeTaskOwner, validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', authMiddleware, authorizeTaskOwner, taskController.deleteTask);

module.exports = router;
