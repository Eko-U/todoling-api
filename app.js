const path = require('path');
const fs = require('fs');

const morgan = require('morgan');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRouter');

const globalErrors = require('./controller/errorController');
const cookieParser = require('cookie-parser');

const app = express();

//Middlewares
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(helmet());

app.use(
  cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
  }),
);

app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

app.use(globalErrors);

module.exports = app;
