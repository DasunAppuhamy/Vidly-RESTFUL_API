const { User } = require('../../../models/user');
const { Genre } = require('../../../models/genre');
const request = require('supertest');
let server;

describe('auth middleware', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async() => {
        await Genre.deleteMany({});
        await server.close();
    });

    let token;
    const exec = async() => {
        return await request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1'})
    };
    beforeEach(() => token = new User().generateAuthToken());

    //tests
    it('should return a 401 error if token is not provided', async() => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it('should return a 400 error if token is invalid', async() => {
        token = 'a';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return a 200 error if token is valid', async() => {
        const res = await exec();
        expect(res.status).toBe(200);
    });
});