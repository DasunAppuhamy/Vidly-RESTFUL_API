const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
    return token;
};

const User = mongoose.model("Users", userSchema);

//Validation function
function validateUser(user){
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(8).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });
    return schema.validate({
        name: user.name,
        email: user.email,
        password: user.password
    });
};

exports.User = User;
exports.validateUser = validateUser;