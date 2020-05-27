const User = require("../model/Users");

module.exports = (req, res, next) => {
  ssn = req.session;
  User.findOne({ where: { email: ssn.email } }).then((user) => {
    if (user.role === "admin") {
      console.log("here");
      next();
    } else {
      console.log("here again");
      res.redirect("/500");
    }
  });
};
