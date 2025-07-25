const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("MongoDB connected successfully")
    );
    await mongoose.connect(process.env.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error(error.message);
    // process exit
    process.exit(1); //
  }
};

module.exports = connectDB;
