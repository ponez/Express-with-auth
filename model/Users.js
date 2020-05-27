const Sequelize = require("sequelize");
const db = require("../config/database");

const User = db.define("users", {
  name: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
  role: {
    type: Sequelize.STRING,
  },
  resetToken: {
    type: Sequelize.STRING,
  },
  resetTokenExpiration: {
    type: Sequelize.DATE,
  },
  isActivated: {
    type: Sequelize.BOOLEAN,
  },
  isActivatedToken: {
    type: Sequelize.STRING,
  },
  isActivatedExpiration: {
    type: Sequelize.DATE,
  },
  profilePic: {
    type: Sequelize.STRING,
  },
});

module.exports = User;
