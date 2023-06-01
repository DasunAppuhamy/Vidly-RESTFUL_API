const winston = require('winston');
require('winston-mongodb');

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.json(),
        winston.format.errors({stack: true}),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
        winston.format.metadata(),
        winston.format.splat()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logfile.log', level: 'error' }),
        new winston.transports.MongoDB({ db: "mongodb://localhost/Vidly", level: 'error'})
    ],
  });

module.exports = logger;