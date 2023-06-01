//Imports
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const express = require('express');
const Joi = require('joi');
const { User } = require('../models/user');

const router = express.Router();
const complexityOptions = {
    min: 10,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  };
  

router.use(express.json());

router.post('/', async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error){
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid username or password...");

    //Comparing the encrypted password
    const validaPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validaPassword) return res.status(400).send("Invalid username or password...");

    //Creating the JSON web token
    const token = user.generateAuthToken();
    res.send(token);
});

function validateLogin(user){
    const schema = Joi.object({
        email: Joi.string().min(8).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });
    return schema.validate({
        email: user.email,
        password: user.password
    });
};

module.exports = router;