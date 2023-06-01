//Imports
const infoLogger = require('./winston/infoLogger');
//const debug = require('debug')('app:main');
const express = require('express');
const app = express();

//Routes 
require('./startup/routes')(app);

//DB
require('./startup/db')();

//Error handling exceptions and rejections
require('./startup/logging')();

//config jwt
require('./startup/config')();

//Joi
require('./startup/validation')();

//Production 
require('./startup/prod')(app);

//listening to the port
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    infoLogger.info(`Listening on port: ${port}`)
});

module.exports = server;

//OOP
// Statics => methods directly on the class --> Rental.lookup()
// Instances => methods on the object --> new User().generateAuthToken()
