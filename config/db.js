const mongoose = require("mongoose");
require("dotenv").config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOCONNECTIONSTR);
    console.log("connected to mongo db successfuly");
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

module.exports = connectDB;
