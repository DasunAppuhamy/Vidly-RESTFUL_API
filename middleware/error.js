const logger = require('../winston/errorLogger');

module.exports = function(err, req, res, next){
    //Logging errors
    logger.error(err);

    res.status(500).send("something went wrong...");
};