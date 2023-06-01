const mongoose = require('mongoose');
const Joi = require('joi');

//setting the schema and the model genres
const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
    }
});

const Genre = mongoose.model("Genres", genreSchema);

//Validation function
function validateGenre(genre){
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required()
    });
    return schema.validate({name: genre.name});
};

exports.genreSchema = genreSchema;
exports.Genre = Genre;
exports.validate = validateGenre;