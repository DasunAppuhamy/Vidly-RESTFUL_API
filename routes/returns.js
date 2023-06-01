const express = require('express');
const { Rental } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();
router.use(express.json());



router.post('/', [auth, validate(validateReturn)], async(req, res) => {
    
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if(!rental) return res.status(404).send('Rental not found...');

    if(rental.dateReturned) return res.status(400).send('Rental already returned...');

    rental.return();
    await rental.save();

    const movie = await Movie.findById(req.body.movieId);
    movie.numberInStock += 1;
    await movie.save();

    return res.status(200).send(rental);

});

module.exports = router;

function validateReturn(req){
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
    });

    return schema.validate({
        customerId: req.customerId,
        movieId: req.movieId,
    });
};