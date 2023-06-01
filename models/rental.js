const Joi = require('joi');
const mongoose = require('mongoose');
const moment = require('moment');

const rentalSchema = new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
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
        }),
        required: true
    },

    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                minlength: 5
            },
            dailyRentalRate: {
                type: Number,
                max: 10,
                min: 0
            }
        }),
        required: true
    },
    
    dayOut: {
        type: Date,
        required: true,
        default: Date.now
    },

    dateReturned: {
        type: Date,
    },

    rentalFee: {
        type: Number,
        min: 0
    }
});

rentalSchema.statics.lookup = function(customerId, movieId){
    return this.findOne({
        'customer._id': customerId,
        'movie._id': movieId
    });
};

rentalSchema.methods.return = function(){
    this.dateReturned = new Date();
    this.rentalFee = moment().diff(this.dayOut, 'days') * this.movie.dailyRentalRate;
};

const Rental = mongoose.model('Rentals', rentalSchema);


function validateRental(rental){
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
    });

    return schema.validate({
        customerId: rental.customerId,
        movieId: rental.movieId,
    });
};


exports.Rental = Rental;
exports.validateRental = validateRental;