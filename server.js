const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.message, err);
  console.log('UNCAUGHT EXPECTION 💥. Shutting Down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  // eslint-disable-next-line no-unused-vars
  .then((con) => {
    console.log('DB Connection Successful! 👌');
  });

const PORT = process.env.PORT || 8000;
const HOST = 'localhost';

const SERVER = app.listen(PORT, HOST, () => {
  console.log(`Listening on ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXPECTION 💥. Shutting Down...');
  SERVER.close(() => {
    process.exit(1);
  });
});
