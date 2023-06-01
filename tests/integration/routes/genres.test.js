const request = require('supertest');
const { Genre } = require('../../../models/genre');
const mongoose = require('mongoose');
const { User } = require('../../../models/user');
let server;

describe('/api/genres', () => {
    beforeEach(() => {
        server = require('../../../index')
    });
    afterEach(async() => {
        await Genre.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all genres', async() => {
            await Genre.collection.insertMany([
                { name: 'genre1'},
                { name: 'genre2'}
            ]);
            const res = await request(server).get('/api/genres');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some( g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some( g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return the corresponding genre if valid id is passed', async() => {
            const genre  = new Genre(
                { name: 'genre1'}
            );
            await genre.save()

            const res = await request(server).get('/api/genres/' + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return 404 error if invalid id is passed', async() => {
            const res = await request(server).get('/api/genres/1');

            expect(res.status).toBe(404);
        });

        it('should return 404 error if no genre with the given ID exists', async() => {
            const Id = new mongoose.Types.ObjectId();
            const res = await request(server).get('/api/genres/' + Id);
            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {

        let token;
        let name;

        const getResponse = async() => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({name: name});
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });


        it('should return 401 error if user is not authenticated.', async() => {
            token = '';
            const res = await getResponse()
            expect(res.status).toBe(401);
        });

        it('should return 400 error if user sends an invalid genre less than 5 characters.', async() => {
            name = 'a';
            const res = await getResponse();
            expect(res.status).toBe(400);
        });

        it('should return 400 error if user sends an invalid genre more than 50 characters.', async() => {
            name = new Array(52).join('a');
            const res = await getResponse();
            expect(res.status).toBe(400);
        });

        it('should save the valid genre', async() => {
            await getResponse();
            const genre = await Genre.find({ name: 'genre1'})
            expect(genre).not.toBeNull();
        });

        it('should return the valid genre', async() => {
            const res = await getResponse();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });
    })

    describe('PUT /:id', () => {
        let token;
        let updatedName;
        let id;

        const exec = async() => {
            return await request(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({ name: updatedName});
        };

        beforeEach(async() => {
            token = new User().generateAuthToken();

            const genre = new Genre({ name: 'genre1'});
            await genre.save()

            id = genre._id;

            updatedName = 'newGenre';
        })

        //tests
        it('should return 401 if the user is not logged in', async() => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 404 error if genre Id is not available', async() => {
            id = 1;
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 400 if the updated genre name is less than 5 characters long', async() => {
            updatedName = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if the updated genre name is more than 50 characters long', async() => {
            updatedName = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })
        
        it('should update a valid genre input', async() => {
            const res = await exec();
            const genre = await Genre.findById(id)
            expect(genre.name).toBe(updatedName);
        })

        it('should return the updated genre if the input is valid', async() => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id', id.toHexString());
            expect(res.body).toHaveProperty('name', updatedName);
        })
    })

    describe('DELETE /:id', () => {
        let token;
        let id;
        let genre;

        const exec = async() => {
            return await request(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', token)
                .send()
        };

        beforeEach(async() => {
            token = new User({isAdmin: true}).generateAuthToken();

            genre = new Genre({ name: 'genre1'});
            await genre.save()

            id = genre._id;
        })

        //tests
        it('should return 401 if user is not logged in', async() => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        })

        it('should return 403 if user is not an Admin', async() => {
            token = new User({isAdmin: false}).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        })

        it('should return 404 error if genre Id is not available', async() => {
            id = 1;
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should remove the genre if the request is valid', async() => {
            const res = await exec();
            expect(res.status).toBe(200);
        });

        it('should return the removed genre if the request is valid', async() => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id', id.toHexString());
            expect(res.body).toHaveProperty('name', genre.name);
        });
    })
})