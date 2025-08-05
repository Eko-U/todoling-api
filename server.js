const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;

const DB_STRING = process.env.DATABASE_STRING.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

if (!process.env.DATABASE_STRING || !process.env.DATABASE_PASSWORD) {
  throw new Error('Missing DATABASE_STRING or DATABASE_PASSWORD env var');
}

mongoose.connect(DB_STRING).then(() => console.log('DB connected succefully'));

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
