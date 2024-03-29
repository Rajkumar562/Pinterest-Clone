var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const upload = require("./multer");
require("dotenv").config();

const google_auth = require("passport-google-oauth20");
const localStrategy = require("passport-local");
const passport = require("passport");
passport.use(new localStrategy(userModel.authenticate()));

var GoogleStrategy = google_auth.Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/oauth2/redirect/google",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const email = profile.emails[0].value;
        let user = await userModel.findOne({ email: email });
        if (!user) {
          user = await userModel.create({ email: email, fullname: profile.displayName, username: email });
        }
        return cb(null, user);
      } catch (error) {
        return cb(error);
      }
    }
  )
);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});

router.get("/feed", function (req, res) {
  res.render("feed");
});
// router.get("/alluserposts", async function (req, res) {
//   let user = await userModel
//     .findOne({ _id: "6597136f093742eac36e3a2c" })
//     .populate("posts"); // first the user with the given id is found and then the posts array of the user is filled with the actual post data using populate
//   res.send(user);
// });

// router.get("/createuser", async function (req, res) {
//   let user = await userModel.create({
//     username: "testuser",
//     password: "check",
//     posts: [],
//     fullName: "Amit",
//     email: "ami@fmail.com",
//   });
//   res.send(user);
// });

// router.get("/createpost", async function (req, res) {
//   let post = await postModel.create({
//     postText: "A normal setting",
//     user: "6597136f093742eac36e3a2c",
//   });
//   let user = await userModel.findOne({ _id: "6597136f093742eac36e3a2c" });
//   user.posts.push(post._id);
//   await user.save();
//   res.send(post);
// });

router.post("/upload", isLoggedIn, upload.single("image"), async function (req, res) {
  if (!req.file) return res.status(404).send("No files were uploaded");

  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({ image: req.file.filename, postText: req.body.caption, user: user._id });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");

  res.render("profile", { user });
});

router.post("/register", function (req, res) {
  const { username, email, fullname } = req.body;
  const user = new userModel({ username, email, fullname });

  userModel.register(user, req.body.password).then(function (registereduser) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.get("/login/google", passport.authenticate("google", { scope: ["email"] }));

router.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", { failureRedirect: "/login", failureMessage: true }),
  function (req, res) {
    res.redirect("/profile");
  }
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}
module.exports = router;
