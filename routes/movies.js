const express = require('express');
const mongoose = require('mongoose');
const { Movie, validateMovie } = require('../models/movie');
const { Genre } = require('../models/genre');
const router = express.Router();

//middleware
router.use(express.json());

router.get('/', async(req, res) => {
    const movies = await Movie.find().sort('title');
    res.send(movies);
});

router.get('/:id', async(req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("The corresponding movie is not found...");

    res.send(movie)
});

router.post('/', async(req, res) => {
    const { error } = validateMovie(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send("The genre is invalid...");

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    const result = await movie.save();
    res.send(result);
});

router.put('/:id', async(req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("The corresponding movie is not found...");

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send("The genre is invalid...");

    const { error } = validateMovie(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    movie.set({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    })
    const result = await movie.save();
    res.send(result);
});

router.delete('/:id', async(req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) res.status(404).send("The corresponding movie is not found...");
    res.send(movie);
});

module.exports = router;