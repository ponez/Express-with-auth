const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
const route = require("./routes/router");
const path = require("path");
const bodyparser = require("body-parser");
const passport = require("passport");
const multer = require("multer");
const storageMulter = require("./config/storage");

require("./config/passport")(passport);

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  multer({
    storage: storageMulter.storage,
    fileFilter: storageMulter.fileType,
  }).single("file")
);

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      sameSite: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("erorr_msg");
  res.locals.error = req.flash("error");
  next();
});

app.set("view engine", "ejs");

app.use("/", route);

app.use((error, req, res, next) => {
  res.redirect("/505");
});

const db = require("./config/database");

// Test DB
db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`server is on ${port}`);
});
