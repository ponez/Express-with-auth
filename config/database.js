const Sequelize = require('sequelize')

module.exports = new Sequelize('myweb', 'postgres', '1111', {
    host: 'localhost',
    dialect: 'postgres',
    operatorAliases: false

   
})