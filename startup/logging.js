const logger = require('../winston/errorLogger');
const winston = require('winston');
require('winston-mongodb');
//error magic
require('express-async-errors');

module.exports = function(){
    //winston can also be used but winston had issues seperating rejections and execpetions
    /*
    const logErr =  winston.createLogger({
        level: 'error',
        format: winston.format.combine(
            winston.format.json(),
            winston.format.prettyPrint(),
        ),
        transports: [
            new winston.transports.Console(),
        ],
        rejectionHandlers: [
        new winston.transports.File({ filename: 'rejections.log' })
        ],
        exceptionHandlers: [
        new winston.transports.File({ filename: 'exceptions.log' })
        ]
    });
    */

    /*
    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true })
        new winston.transports.File({ filename: 'exceptions.log' })
    );
    winston.rejections.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true })
        new winston.transports.File({ filename: 'rejections.log' })
    )*/

    //Uncaught error handle
    process.on('uncaughtException', (ex) => {
        logger.error(ex);
        setTimeout(() => {
            process.exit(1);
        }, 200);
    });

    //Unhandled rejection handling
    process.on('unhandledRejection', (ex) => {
        logger.error(ex);
        setTimeout(() => {
            process.exit(1);
        }, 200);
    });

    //throw new Error("Something failed during startup.")
    // const p = Promise.reject(new Error("Something went wrong misserably..."))
    // p.then(() => console.log('Unhandled rejection...'));

};