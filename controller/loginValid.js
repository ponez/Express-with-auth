const passport = require("passport");
const User = require("../model/Users");
var StorageSession = require("session-storage");

exports.logValid = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
});

exports.acitvationValidation = (req, res, next) => {
  //throw new Error("test");
  User.findOne({ where: { email: req.body.email.toLowerCase() } })
    .then((user) => {
      if (user.isActivated) {
        ssn = req.session;
        ssn.email = req.body.email;
        next();
      }
      if (user.isActivated != true) {
        req.flash("error", "your account has not been activated");
        res.redirect(req.get("referer"));
      }
    })
    .catch((err) => console.log(err));
};
exports.logOut = (req, res) => {
  req.logout();
  req.flash("success_msg", "You successfully logged out!");
  res.redirect("/login");
};
