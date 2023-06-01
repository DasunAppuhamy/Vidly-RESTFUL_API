const express = require('express');
const mongoose = require('mongoose');
const { Rental , validateRental } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const Fawn = require('fawn');
const router = express.Router();

//middleware
router.use(express.json());
Fawn.init("mongodb://localhost/Vidly");

router.get('/', async(req, res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
});

router.get('/:id', async(req, res) => {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).send("The corresponding movie is not found...");

    res.send(rental)
});

router.post('/', async(req, res) => {
    const { error } = validateRental(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("The customer is invalid...");

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("The movie is invalid...");

    if (movie.numberInStock === 0 ) return res.status(400).send("Movie is out of stock...")

    const rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    const result = await rental.save();

    movie.numberInStock --;
    movie.save();

    res.send(result);
});

router.put('/:id', async(req, res) => {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).send("The corresponding movie is not found...");

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("The customer is invalid...");

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("The movie is invalid...");

    const { error } = validateRental(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    rental.set({
        customer: {
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });
    
    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .run();
    }
    catch (ex) {
        res.status(500).send("An internal error occured...")
    }
    res.send(result);
});

router.delete('/:id', async(req, res) => {
    const rental = await Rental.findByIdAndRemove(req.params.id);
    if (!rental) res.status(404).send("The corresponding movie is not found...");
    res.send(rental);
});

module.exports = router;