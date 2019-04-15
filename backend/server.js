
const mongoose = require("mongoose");
const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");

const Data = require("./data");

const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

// this is our MongoDB database
const dbRoute = "mongodb+srv://user1:CX5ve9mVQzy6uVEz@cluster0-eyorl.mongodb.net/test?retryWrites=true";

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

// this is our get method
// this method fetches all available data in our database
router.get("/getData", (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
  const { id } = req.body;
  console.log(id)
  Data.findByIdAndRemove(id, err => {
  //Data.findOneAndDelete(id, err => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});


const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const cmd = require('node-cmd');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cookieParser());
app.use(fileUpload());
app.use('/files', express.static(__dirname + '/files'));

router.post("/uploadAndConvertToAudio", (req, res) => {
  console.log(req);
  let uploaded_file = req.files.file;
  console.log(uploaded_file.name);
  console.log(__dirname);

  uploaded_file.mv(__dirname + '/files/' + uploaded_file.name, function(err) {
    if (err) {
      console.log(err)
      return res.status(500).send(err);
    }

    cmd.run('ffmpeg -i ' + __dirname + '/files/' + uploaded_file.name + ' ' + __dirname + '/files/' + uploaded_file.name + '.mp3');



    let data = new Data();


    data.id = 0;
    data.date = Date();
    data.filename = uploaded_file.name + '.mp3';
    data.url = '/files/' + uploaded_file.name + '.mp3';

    data.save(err => {
      if (err) return res.json({ success: false, error: err });
      //return res.json({ success: true });
    });



    res.json({file: '/files/' + uploaded_file.name + '.mp3'})
  });

})


router.post("/uploadAndConvertToVideo", (req, res) => {
  console.log(req);
  let uploaded_file = req.files.file;
  console.log(uploaded_file.name);
  console.log(__dirname);

  uploaded_file.mv(__dirname + '/files/' + uploaded_file.name, function(err) {
    if (err) {
      console.log(err)
      return res.status(500).send(err);
    }

    const extension = '.avi'
    cmd.run('ffmpeg -i ' + __dirname + '/files/' + uploaded_file.name + ' ' + __dirname + '/files/' + uploaded_file.name + extension);

    let data = new Data();


    data.id = 0;
    data.date = Date();
    data.filename = uploaded_file.name + extension;
    data.url = '/files/' + uploaded_file.name + extension;

    data.save(err => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
  });

})


router.post("/uploadAndConcatenateAudio", (req, res) => {
  console.log(req.files);
  let uploaded_fileA = req.files.fileA;
  let uploaded_fileB = req.files.fileB;
  console.log(uploaded_fileA.name);
  console.log(uploaded_fileB.name);
  console.log(__dirname);

  uploaded_fileA.mv(__dirname + '/files/' + uploaded_fileA.name, function(err) {
    if (err) {
      console.log(err)
      return res.status(500).send(err);
    }
  });

  uploaded_fileB.mv(__dirname + '/files/' + uploaded_fileB.name, function(err) {
    if (err) {
      console.log(err)
      return res.status(500).send(err);
    }
  });

  const extension = '.mp3'
  const filenameA = __dirname + '/files/' + uploaded_fileA.name
  const filenameB = __dirname + '/files/' + uploaded_fileB.name
  const output = __dirname + '/files/' + uploaded_fileA.name + '+' + uploaded_fileB.name + extension
  cmd.run('ffmpeg -i ' + filenameA + ' -i ' + filenameB + ' -filter_complex "[0:a] [1:a] concat=n=2:v=0:a=1 [a]" -map "[a]" ' + output);

  console.log('ffmpeg -i ' + filenameA + '-i' + filenameB + ' -filter_complex " [0:a] [1:a] concat=n=2:v=0:a=1 [a]" -map "[a]" ' + output);

  let data = new Data();

  data.id = 0;
  data.date = Date();
  data.filename = uploaded_fileA.name + '+' + uploaded_fileB.name + extension;
  data.url = '/files/' + uploaded_fileA.name + '+' + uploaded_fileB.name + extension

  data.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log("LISTENING ON PORT ${API_PORT}"));
