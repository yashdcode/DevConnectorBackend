const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURL");

const connectDB = async () => {
  try {
    const res = await mongoose.connect(db);

    console.log("MongoDB database connected...");
  } catch (error) {
    console.error(error.message);
    // process exit
    process.exit(1); //
  }
};

module.exports = connectDB;
