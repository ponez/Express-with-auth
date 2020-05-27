const crypto = require("crypto");
const bcrypt = require("bcrypt");
const request = require("request");
const nodemailer = require("nodemailer");
const User = require("../model/Users");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "webPonezApps@gmail.com",
    pass: "660617test",
  },
});

exports.landingPage = (req, res) => {
  res.render("index.ejs", {
    user: req.user,
    isAuthenticated: req.isAuthenticated,
    name: req.user ? req.user.name : "",
  });
};
exports.notFound = (req, res) => {
  //res.render("404.ejs");
};
exports.loginPage = (req, res, next) => {
  res.render("login.ejs", { captcha: res.recaptcha });
  next();
};
exports.getAccountConfirm = (req, res) => {
  let token = req.params.token;
  User.findOne({
    where: {
      isActivatedToken: token,
      isActivatedExpiration: { [Op.gte]: Date.now() },
    },
  })
    .then((user) => {
      if (!user) {
        //console.log("there wasnt a fucking user here !");
        res.redirect("/404");
      } else {
        res.render("registration/accountconfirm.ejs");
        user.isActivated = true;
        user.isActivatedToken = null;
        user.isActivatedExpiration = null;
        user.save();
      }
    })
    .catch((err) => console.log(err));
  //
};
exports.recaptchaHandler = (req, res, next) => {
  if (
    req.body["g-recaptcha-response"] === undefined ||
    req.body["g-recaptcha-response"] === "" ||
    req.body["g-recaptcha-response"] === null
  ) {
    //res.json({ responseError: "Please select captcha first" });
    req.flash("error", "Please select captcha first");
    return res.redirect(req.get("referer"));
  } else {
    const secretKey = "6LcJGvAUAAAAAJgv1MgrdF97YgbUhMnbDz1SvFho";

    const verificationURL =
      "https://www.google.com/recaptcha/api/siteverify?secret=" +
      secretKey +
      "&response=" +
      req.body["g-recaptcha-response"] +
      "&remoteip=" +
      req.connection.remoteAddress;

    request(verificationURL, function (error, response, body) {
      body = JSON.parse(body);

      if (body.success !== undefined && !body.success) {
        //return res.json({ responseError: "Failed captcha verification" });
        req.flash("error", "Failed captcha verification");
        return res.redirect(req.get("referer"));
      }
      // res.json({ responseSuccess: "Sucess" });
    });
    next();
  }
};
exports.resetPasswordEmail = (req, res, next) => {
  res.render("resetpassword/emailPage.ejs");
};
exports.resetPasswordEmailPost = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      res.redirect("/resetpassword");
      throw err;
    }
    const token = buffer.toString("hex");
    User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (!user) {
          req.flash(
            "error",
            "If ther was a user registred with this email you will receive an email"
          );
          res.redirect("/");
        } else {
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 1000 * 60 * 60 * 2;
          return user
            .save()
            .then((result) => {
              req.flash(
                "error",
                "If ther was a user registred with this email you will receive an email"
              );
              res.redirect("/");
              transport.sendMail({
                to: req.body.email,
                from: "webponezapp@gmail.com",
                subject: "Reset Password",
                html: `
                <p> You've requested a password reset if it wasn't you , you can delete this email </p>
                <p> Click link down below to reset your password </p>
                <a href="http://localhost:3000/resetpassword/${token}">here</a>
                
                `,
              });
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  });
};
exports.getNewPassword = (req, res) => {
  const token = req.params.token;

  User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: { [Op.gte]: Date.now() },
    },
  })
    .then((user) => {
      if (!user) {
        res.redirect("/404");
      } else {
        res.render("resetpassword/newpass.ejs", {
          userId: user.id,
          resetToken: token,
        });
      }
    })
    .catch((err) => console.log(err));
};
exports.postNewPassword = (req, res) => {
  const newPassword = req.body.newpassword;
  const id = req.body.userId;
  const resetToken = req.body.resetToken;
  let resetUser;
  if (!newPassword) {
    req.flash("error", "passwords is empty");
    res.redirect(req.get("referer"));
  }
  if (newPassword.match(/[a-z]/g) && newPassword.length >= 8) {
    console.log("pass is good");
  } else {
    req.flash(
      "error",
      "password is not good enough it should contain letters/numbers and more than 8 words"
    );
    res.redirect(req.get("referer"));
  }
  if (newPassword != req.body.newpasswordconfirm) {
    req.flash("error", "passwords does not match");
    res.redirect(req.get("referer"));
  } else {
    User.findOne({ where: { id, resetToken } })
      .then((user) => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
      })
      .then((hash) => {
        resetUser.password = hash;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = null;
        return resetUser.save();
      })
      .then((result) => res.redirect("/login"))
      .catch((err) => console.log(err));
  }
};
exports.regPage = (req, res) => {
  res.render("registration/register.ejs", {
    errorMessage: "",
  });
};
exports.some = (req, res) => {
  res.render("some.ejs", {
    user: req.user,
    isAuthenticated: req.isAuthenticated,
    name: req.user.name || "",
  });
};
exports.profilePage = (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Please login");
    res.redirect("/login");
  } else {
    ssn = req.session;
    const email = ssn.email;
    User.findOne({ where: { email } })
      .then((user) => {
        if (!user) {
          res.redirect("/404");
        } else {
          console.log(user.id);
          console.log(user.profilePic);
          res.render("profile.ejs", {
            imageUrl: user.profilePic,
          });
        }
      })
      .catch((err) => console.log(err));
  }
};
exports.postProfile = (req, res) => {
  const img = req.file;
  ssn = req.session;
  const userPic = ssn.userPic;
  const email = ssn.email;
  if (!img) {
    return res.status(422).render("profile", {
      imageUrl: img,
      error: "attached file should be a png or jpeg or jpg !",
    });
  } else {
    res.render("profile.ejs", {
      imageUrl: img.path,
    });
    User.findOne({ where: { email } })
      .then((user) => {
        user.profilePic = img.path;
        user.save();
      })
      .catch((err) => console.log(err));
  }
  console.log(img);
};
