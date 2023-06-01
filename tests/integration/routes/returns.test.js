// POST /api/returns { customerId, movieid }
const { Rental } = require('../../../models/rental');
const request = require('supertest');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');
const moment = require('moment');
const { Movie } = require('../../../models/movie');
const { object } = require('joi');

let server;

describe('/api/returns', () => {
    //testing POST
    describe('POST /', () => {
        let token;
        let customerId;
        let movieId;
        let rental;
        let movie;

        const exec = async() => {
            return await request(server)
                .post('/api/returns')
                .set('x-auth-token', token)
                .send({ customerId: customerId, movieId: movieId })
        };
        beforeEach(async() => {
            server = require('../../../index')
            token = new User().generateAuthToken();
            customerId = new mongoose.Types.ObjectId();
            movieId = new mongoose.Types.ObjectId();

            movie = new Movie({
                '_id': movieId,
                'title':'movie1',
                'genre': {'name': '12345'},
                'dailyRentalRate': 5,
                'numberInStock': 10
            });
            await movie.save();

            rental = new Rental({
                customer: {
                    _id: customerId,
                    name: '12345',
                    phone: '1234567890'
                },
                movie: {
                    _id: movieId,
                    title: 'movie1',
                    dailyRentalRate: 5
                }
            });
            await rental.save();
        });
        afterEach(async() => {
            server.close();
            await Rental.deleteMany({});
            await Movie.deleteMany({});
        });

        //tests

        // it('should work', async() => {
        //     const result = await Rental.findById(rental._id);
        //     expect(result).not.toBeNull();
        // })

        it('should return a 401 if the user is not logged in', async() => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return a 400 if the customerID is not provided', async() => {
            customerId = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });    
        
        it('should return a 400 if the movieID is not provided', async() => {
            movieId = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        
        it('should return a 404 if no rentals are found for customer/movie found', async() => {
            await Rental.deleteMany({});
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return a 400 if the rental is already processed', async() => {
            rental.dateReturned = new Date();
            await rental.save();
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 200 if the request is valid ', async() => {
            const res = await exec();
            expect(res.status).toBe(200);
        });

        it('set the return date', async() => {
            const res = await exec();
            const result = await Rental.findById(rental._id);
            const diff = new Date() - result.dateReturned;

            expect(diff).toBeLessThan(10*1000);
        });

        it('calculate the rental fee', async() => {
            rental.dayOut = moment().add(-7, 'days').toDate();
            await rental.save();

            await exec();
            const resultRental = await Rental.findById(rental._id);

            expect(resultRental.rentalFee).toBe(7*5);
            
        });

        it('increasing the movie stock', async() => {
            await exec();
            const resultMovie = await Movie.findById(movieId);
            expect(resultMovie.numberInStock).toBe(11);
            
        });

        it('return the rental', async() => {
            const res = await exec();
            // expect(res.body).toHaveProperty('_id', rental._id.toHexString());
            // expect(res.body).toHaveProperty('customer._id', customerId.toHexString());
            // expect(res.body).toHaveProperty('movie._id', movieId.toHexString());
            // expect(res.body).toHaveProperty('dayOut');
            // expect(res.body).toHaveProperty('dateReturned');
            // expect(res.body).toHaveProperty('rentalFee');

            expect(Object.keys(res.body))
            .toEqual(expect.arrayContaining([
                '_id', 'customer', 'movie', 'dayOut', 'dateReturned','rentalFee'
            ]));
        });
    })
})

// returns a 401 if the user is not logged in 
// returns a 400 if the customerId is not provided
// returns a 400 if the movieId is not provided
// returns a 404 if no rentals are found for customer/movie found
// returns a 400 if the rental is already processed 
// returns 200 if the request is valid 
// set the return date 
// calculate the rental fee
// increase the stock 
// return the rental 