// This is the code of trial task backend app

// Load libraries
const mongoose = require("mongoose");
const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require('path');
const fileUpload = require('express-fileupload');
const cmd = require('node-cmd');

// Load schema
const Data = require("./data");

const API_PORT = 3001;
const app = express();
app.use(cors());
app.use(fileUpload());
const router = express.Router();

// Load json parser for logging
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

// Allow to host files from a local directory (for downloading)
const files_dir = '/files';
app.use(files_dir, express.static(__dirname + files_dir));

// route to MongoDB (credentials shown for development only!)
const dbRoute = "mongodb+srv://user1:CX5ve9mVQzy6uVEz@cluster0-eyorl.mongodb.net/test?retryWrites=true";

// Connect to MongoDB
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);
let db = mongoose.connection;

// Check the connection
db.once("open", () => console.log("DB connection OK"));
db.on("error", console.error.bind(console, "MongoDB: Connection error!"));


// Get the list of previous jobs
router.get("/getData", (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// Delete job from the list
router.delete("/deleteData", (req, res) => {
  const { id } = req.body;
  Data.findByIdAndRemove(id, err => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

convertFile = (filepath, extension) => {
  cmd.run('ffmpeg -i ' + filepath + ' ' + filepath + extension);
}

router.post("/uploadAndConvertToAudio", (req, res) => {
  let uploaded_file = req.files.file;
  const relative_filepath = files_dir + '/' + uploaded_file.name;
  const filepath = __dirname + relative_filepath;
  const extension = '.mp3';

  // Save the file
  uploaded_file.mv(filepath, err => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

  // Run ffmpeg
  convertFile(filepath, extension);

  // Add new record to the DB
  const output_filename = uploaded_file.name + extension;
  let data = new Data();
  data.date = (new Date()).toLocaleTimeString();
  data.filename = output_filename;
  data.url = files_dir + '/' + output_filename;

  data.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

router.post("/uploadAndConvertToVideo", (req, res) => {
  let uploaded_file = req.files.file;
  const relative_filepath = files_dir + '/' + uploaded_file.name;
  const filepath = __dirname + relative_filepath;
  const extension = '.avi';

  // Save the file
  uploaded_file.mv(filepath, err => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

  // Run ffmpeg
  convertFile(filepath, extension);

  // Add new record to the DB
  const output_filename = uploaded_file.name + extension;
  let data = new Data();
  data.date = (new Date()).toLocaleTimeString();
  data.filename = output_filename;
  data.url = files_dir + '/' + output_filename;

  data.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

concatenateAudio = (dir, filenameA, filenameB, extension) => {
  const filenameA_path = dir + '/' + filenameA;
  const filenameB_path = dir + '/' + filenameB;
  const output = dir + '/' + filenameA + '+' + filenameB + extension;
  cmd.run('ffmpeg -i ' + filenameA_path + ' -i ' + filenameB_path + ' -filter_complex "[0:a] [1:a] concat=n=2:v=0:a=1 [a]" -map "[a]" ' + output);
}

router.post("/uploadAndConcatenateAudio", (req, res) => {
  let fileA = req.files.fileA;
  let fileB = req.files.fileB;
  const filenameA = fileA.name;
  const filenameB = fileB.name;
  const extension = '.mp3';
  files_dir_path = __dirname + files_dir;

  // Save both files
  fileA.mv(files_dir_path + '/' + filenameA, function(err) {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

  fileB.mv(files_dir_path + '/' + filenameB, function(err) {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

  // Join the audio files
  concatenateAudio = (files_dir_path, filenameA, filenameB, extension);

  // Add new record to the DB
  const output_name = filenameA + '+' + filenameB + extension
  let data = new Data();
  data.date = (new Date()).toLocaleTimeString();
  data.filename = output_name;
  data.url = files_dir + '/' + output_name

  data.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// Append /api to all http requests
app.use("/api", router);

// Listen to the selected port
app.listen(API_PORT, () => console.log("LISTENING ON PORT ${API_PORT}"));
