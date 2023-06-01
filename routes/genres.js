//Imports
const mongoose = require('mongoose');
const express = require('express');
const { Genre, validate } = require('../models/genre');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

//Middleware
router.use(express.json());

router.get('/', async (req, res) => {
    //throw new Error("Could not connect to genres...")
    const genres = await Genre.find().sort('name');
    res.send(genres);
});

router.get('/:id', validateObjectId, async (req, res) => {
    
    const genre = await Genre.findById(req.params.id);
    //const genre = genres.find( c => c.id === parseInt(req.params.id))
    if (!genre) return res.status(404).send("Genre ID is not available...")

    res.send(genre);
});

router.post('/', auth, async (req, res) => {

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let genre = new Genre({
        name: req.body.name,
    })

    genre = await genre.save();
    res.send(genre);
})

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    let genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send("Genre ID is not available...");

    const { error } = validate(req.body);
    if (error){
        return res.status(400).send(error.details[0].message);
    }

    genre.set({ name: req.body.name})
    genre = await genre.save();
    res.send(genre);
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    //const genre = genres.find( c => c.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send("Genre ID is not available...");

    // const index = genres.indexOf(genre);
    // genres.splice(index, 1);

    res.send(genre);
})

module.exports = router;
