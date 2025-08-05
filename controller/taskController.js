const catchAsync = require('../utils/catchAsync');
const Task = require('./../model/taskModel');
const AppError = require('../utils/appError');

function checkDueDate(dueDate) {
  const now = new Date(Date.now());
  const future = new Date(dueDate);

  return now > future;
}

exports.getAllTasks = async (req, res, next) => {
  const tasks = await Task.find({ user: { $eq: req.user.id } });
  res.status(200).json({
    length: tasks.length,
    status: 'succes',
    data: tasks,
  });
};

exports.getTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;

  const task = await Task.findById({ _id: taskId });

  res.status(200).json({
    status: 'succes',
    data: task,
  });
});

exports.createTask = catchAsync(async (req, res, next) => {
  const newTask = {
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    user: req.user.id,
  };

  const isDueDate = checkDueDate(newTask.dueDate);

  if (isDueDate)
    return next(
      new AppError('Due date must be greater than current date', 400),
    );

  const task = await Task.create(newTask);

  res.status(200).json({
    status: 'succes',
    data: task,
  });
});

exports.updateTask = async (req, res, next) => {
  const taskId = req.params.taskId;

  if (Object.keys(req.body).length === 0)
    return next(new AppError('You must input data to update', 400));

  const task = await Task.findByIdAndUpdate({ _id: taskId }, req.body, {
    runValidators: true,
    new: true,
  });

  if (!task)
    return res.status(404).json({
      status: 'fail',
      message: `No task found for this id: ${taskId}`,
    });

  res.status(200).json({
    status: 'success',
    data: task,
  });
};

exports.deleteTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  const task = await Task.findByIdAndDelete({ _id: taskId });

  res.status(200).json({
    status: 'succes',
    message: 'Deleted Succefully',
  });
};
