const Joi = require('joi');
const mongoose = require('mongoose');

//schema and model
const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    isGold: {
        type: Boolean,
        default: false,
    },
    phone: {
        type: String,
        minlength: 10,
        maxlength: 10,
        required: function(){return this.isGold},
    }
});

const Customer = mongoose.model("Customers", customerSchema);

//Validation function 
function validateCustomer(customer){
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
        isGold: Joi.boolean().default(false),
        phone: Joi.string().max(10).min(10).required()
    });
    return schema.validate({
        name: customer.name,
        isGold: customer.isGold,
        phone: customer.phone
    });
}

exports.Customer = Customer;
exports.validate = validateCustomer;