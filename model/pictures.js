const Sequelize = require("sequelize");
const db = require("../config/database");

const picPath = db.define("pictures", {
  picPath: Sequelize.STRING,
});

module.exports = picPath;
