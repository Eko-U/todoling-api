const app = require('./app');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

const DB_STRING = process.env.DATABASE_STRING.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);


mongoose.connect(DB_STRING).then(() => console.log('DB connected succefully'));

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
