const infoLogger = require('../winston/infoLogger');
const mongoose = require('mongoose');
const config = require('config');

module.exports = function(){
    const db = config.get('db');
    mongoose.connect(db, { useUnifiedTopology: true })
    .then(() => infoLogger.info(`Connected to the ${db}...`))
    //.catch(() => winston.info("An error occured..."));
}