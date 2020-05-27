const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const User = require("../model/Users");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { check, validationResult } = require("express-validator/check");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "webPonezApps@gmail.com",
    pass: "660617test",
  },
});

exports.regPost = (req, res) => {
  let { name, email, password, password2 } = req.body;
  let errors = [];
  const error = validationResult(req);

  if (!name) {
    errors.push({ text: "Please enter your name" });
  }
  if (!email) {
    errors.push({ text: "Please eneter your email" });
  } else {
    email = email.toLowerCase();
  }
  if (!password) {
    errors.push({ text: "Please enter your password" });
  }
  if (password.match(/[a-z]/g) && password.length >= 8) {
    console.log("pass is good");
  } else {
    errors.push({
      text:
        "Your password should contain uppercase and lowercase words and numbers!",
    });
  }
  if (password != password2) {
    errors.push({ text: "Passwords doesn't match" });
  }
  if (!error.isEmpty()) {
    return res.status(422).render("registration/register", {
      errors,
      errorMessage: error.array()[0].msg,
    });
  }
  if (errors.length > 0) {
    res.render("registration/register", {
      errors,
      errorMessage: "",
    });
  } else {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        res.redirect(req.get("referer"));
        throw err;
      }
      const activatedToken = buffer.toString("hex");
      User.findOne({ where: { email } }).then((user) => {
        if (user) {
          errors.push({ text: "Email is already registred" });
          res.render("register", {
            errors,
          });
        } else {
          const newUser = new User({
            name,
            email,
            password,
          });
          transport.sendMail({
            from: "webPonezApps@gmail.com",
            to: email,
            subject: "Welcome to my website",
            html: `
            <p> Welcome to my web site please confirm your email using follwing link </p>
            <a href="http://localhost:3000/AccountConfirm/${activatedToken}">here</a>`,
          });
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) {
                throw err;
              } else {
                newUser.password = hash;
                newUser.isActivatedToken = activatedToken;
                newUser.isActivatedExpiration =
                  Date.now() + 1000 * 60 * 60 * 24;
                newUser
                  .save()
                  .then((user) => {
                    req.flash(
                      "success_msg",
                      "You are now registred and can log in"
                    );
                    res.redirect("/login");
                  })
                  .catch((err) => console.log(err));
              }
            })
          );
        }
      });
    });
  }
};
exports.regPostValid = (req, res, next) => {
  check("email").isEmail();
  next();
};
