const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'They must be a todo task title'],
      unique: true,
      minLength: 16,
    },

    description: {
      type: String,
      required: [true, 'They must be a todo task description'],
      minLength: 16,
    },

    dueDate: {
      type: Date,
      required: [true, 'You must set a due date for the todo task'],
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  {},
);

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
