const Joi = require('joi');
const mongoose = require('mongoose');
const { genreSchema } = require('./genre');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5
    },
    genre: {
        type: [genreSchema],
        required: true
    },
    numberInStock: {
        type: Number,
        required: true,
        min: 0
    },
    dailyRentalRate: {
        type: Number,
        max: 10,
        min: 0
    }
});

const Movie = mongoose.model('Movies', movieSchema);


function validateMovie(movie){
    const schema = Joi.object({
        title: Joi.string().min(5).required(),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number(),
        dailyRentalRate: Joi.number().max(10),
    });

    return schema.validate({
        title: movie.title,
        genreId: movie.genreId,
        numberInStock: movie.numberInStock,
        dailyRentalRate: movie.dailyRentalRate
    });
};


exports.Movie = Movie;
exports.validateMovie = validateMovie;
