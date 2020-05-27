const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const upload = require("../controller/upload");
const registerValidation = require("../controller/regvalid");
const loginValidation = require("../controller/loginValid");
const { check, body } = require("express-validator/check");
const isAuth = require("../config/auth");
const permission = require("../config/permission");
const multer = require("multer");
const storageMulter = require("../config/storage");
const gigs = require("../controller/GIG");
const err = require("../controller/err");
const payment = require("../controller/payment");
var multerUpload = multer({ storage: storageMulter });

router.get("/", controller.landingPage);
router.get("/404", controller.notFound);
router.get("/some", isAuth, permission, controller.some);
router.get("/login", controller.loginPage);
router.get("/register", controller.regPage);
router.get("/logout", loginValidation.logOut);
router.get("/profile", controller.profilePage);
router.get("/resetpassword", controller.resetPasswordEmail);
router.get("/resetpassword/:token", controller.getNewPassword);
router.get("/accountconfirm/:token", controller.getAccountConfirm);
router.get("/upload", upload.getUpload);
router.get("/download/:id", upload.getDownload);

//gigs are here nigga
router.get("/gigs", gigs.getList);
router.get("/gigs/add", gigs.getAddList);
router.get("/gigs/search", gigs.getSearch);

router.delete("/gigs/:id", gigs.deleteGig);

router.post("/gigs/add", gigs.postAddList);

//payment shit
router.get("/payment/:id", payment.getPayment);
router.post("/payment/verifyPayment", payment.postPayment);

router.post(
  "/register",
  [check("email").isEmail().withMessage("Email is not valid try again")],
  registerValidation.regPostValid,
  registerValidation.regPost
);
router.post(
  "/login",
  loginValidation.acitvationValidation,
  //controller.recaptchaHandler,
  loginValidation.logValid
);
router.post(
  "/resetpassword",
  controller.recaptchaHandler,
  controller.resetPasswordEmailPost
);
router.post("/newpasswordreset", controller.postNewPassword);
router.post("/profile", controller.postProfile);
router.post("/upload", multerUpload.single("file"), upload.postUpload);

router.get("/500", err.err);
router.use("*", err.notFound);

module.exports = router;
