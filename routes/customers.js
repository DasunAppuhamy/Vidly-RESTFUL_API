//imports 
const express = require('express');
const mongoose = require('mongoose');
const { Customer, validate } = require('../models/customer');

const router = express.Router();

//middleware 
router.use(express.json());

//API
router.get('/', async(req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

router.get('/:id', async(req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("The customer is not available...");

    res.send(customer);
});

router.post('/', async(req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone 
    })

    const result = await customer.save();
    res.send(result);
});

router.put('/:id', async(req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("The customer is not available...");

    customer.set({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone 
    });

    const result = await customer.save();
    res.send(result);
});

router.delete('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) return res.status(404).send("The customer is not available...");

    res.send(customer);
})

module.exports = router;