const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/pindb");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  dp: {
    type: String, // Assuming dp is a string representing a URL or file path
  },
  fullname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.plugin(plm);
module.exports = mongoose.model("User", userSchema);
