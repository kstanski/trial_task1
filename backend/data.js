
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// This specifies the data structure in MongoDB 
const DataSchema = new Schema(
  {
    date: String,
    filename: String,
    url: String
  },
  { timestamps: true }
);

// Export the new Schema so that it can be used in Node.js
module.exports = mongoose.model("Data", DataSchema);
