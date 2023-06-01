//Imports
const config = require('config');
const _ = require('lodash');
const passwordComplexity = require("joi-password-complexity");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const express = require('express');
const { User, validateUser } = require('../models/user');
const auth = require('../middleware/auth');

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

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error){
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already exists...");

    // user = new User({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password
    // })
    user = new User(_.pick(req.body, ['name', 'email', 'password']));

    const validity = passwordComplexity(complexityOptions).validate(user.password);
    if (validity.error) return res.status(400).send(validity.error.details[0].message);

    //Encrypting the password with salt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;