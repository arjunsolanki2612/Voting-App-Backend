const mongoose = require("mongoose");
require("dotenv").config();
//Define the MongoDB connection URL
const mongoURL = "mongodb://localhost:27017/voting";
// const mongoURL = process.env.DB_URL;
//Set up MongoDb connection
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Get the default connection
//Mongoose maintains a default connection object representing the MongoDB connection
const db = mongoose.connection;

//Define the event listeners for databases connection
db.on("connected", () => {
  console.log("Connected to MongoDB server");
});
db.on("error", (err) => {
  console.log("MongoDB connection error", err);
});
db.on("disconnected", () => {
  console.log("MOngoDB disconnected");
});

//Export the database connection
module.exports = db;
