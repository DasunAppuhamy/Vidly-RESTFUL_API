const winston = require('winston');

const infoLogger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
    ],
});

module.exports = infoLogger;
