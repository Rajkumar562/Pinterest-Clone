const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path"); // gives us the extension of the file

//multer is primarily used for uploading files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads"); //destination of the file
  },
  filename: function (req, file, cb) {
    const filename = uuidv4();
    cb(null, filename + path.extname(file.originalname)); // extension added to the uploaded file
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
