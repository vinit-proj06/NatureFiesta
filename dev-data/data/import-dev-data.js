const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // .connect(process.env.DATABASE_LOCAL, {
    userNewUrlParser: true,
    userCreateIndex: true,
    userFindAndModify: false,
    useUnifiedTopology: true,
    writeConcern: {
      w: 'majority',
      timeout: 5000,
    },
  })
  .then(() => {
    console.log('DB connection successful!');
  });

// Read JSON file
const products = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// Import data into DB
const importData = async () => {
  try {
    await Product.create(products);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// Delete all data from collection
const deleteDate = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
    process.exit(1);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  // node dev-data/data/import-dev-data.js --import
  importData();
} else if (process.argv[2] === '--delete') {
  // node dev-data/data/import-dev-data.js --delete
  deleteDate();
}

console.log(process.argv);
