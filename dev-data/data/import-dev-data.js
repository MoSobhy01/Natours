const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

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
const tours = fs.readFileSync('./dev-data/data/tours.json', 'utf-8');
const reviews = fs.readFileSync('./dev-data/data/reviews.json', 'utf-8');
const users = fs.readFileSync('./dev-data/data/users.json', 'utf-8');
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    await Review.create(JSON.parse(reviews));
    await User.create(JSON.parse(users), { validateBeforeSave: false });
    console.log(`Data Loaded 👌`);
  } catch (err) {
    console.log(`Error 💥:${err.message}\n ${err}`);
  }
};
const cleanDB = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('All Deleted');
  } catch (err) {
    console.log(`Error 💥:${err.message}`);
  }
};
cleanDB().then(() => importData());
