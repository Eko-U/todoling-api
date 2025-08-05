const express = require('express');

const router = express.Router();

const taskController = require('../controller/taskController');
const authController = require('../controller/authController');

router.use(authController.protect);

router
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route('/:taskId')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
