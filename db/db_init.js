// ===============================
// This file creates the database from the option_models in ./option_models
// See also: https://discordjs.guide/sequelize
// ===============================

const Sequelize = require('sequelize')
const path = require("path")
const fs = require("fs")
const { DBName , DBUser, DBPass, DBHost } = require("../config.json")

const sequelize = new Sequelize(`${DBName}`, `${DBUser}`, `${DBPass}`, {
  host: `${DBHost}`,
  dialect: 'mysql',
});

// get all models and save it into DB.<file_name>
const DB = {}
const normalized_path = path.join(__dirname, "models")
fs.readdirSync(normalized_path).forEach(function (file_path) {
    const file = require("./models/" + file_path)
    const file_name = file_path.substring(0, file_path.lastIndexOf('.'))
    DB[file_name] = file(sequelize, Sequelize)
})

module.exports = {
    DB,
    sequelize
}