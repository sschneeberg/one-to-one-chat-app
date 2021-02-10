const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const db = require('../models');

describe('Chat Routes', () => {
    let cookie = '';
    const [email, password, username] = ['joe@test.com', 'password', 'Joe Schmoe'];

    before(async () => {
        //add a user to test db and log them in
        await db.User.deleteMany({});
        try {
            const user = new db.User({
                username: username,
                email: email,
                password: password
            });
            await user.save();
            const response = await request(app).post('/users/login').send({ email, password });
            cookie = response.header['set-cookie'][0].split(' ')[0];
        } catch (err) {
            console.log('LOGIN ERR', err);
        }
    });

    describe('GET /users', () => {
        it('Should return a 200 json response', (done) => {
            const searchTerm = 'joe';
            request(app)
                .get('/users')
                .query({ search: searchTerm })
                .set('cookie', cookie)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
        it('Should return all users matching the search term', (done) => {
            const searchTerm = 'joe';
            request(app)
                .get('/users')
                .query({ search: searchTerm })
                .set('cookie', cookie)
                .then(async (response) => {
                    const matchedUsers = await db.User.find({ $text: { $search: searchTerm } }).sort({
                        score: { $meta: 'textScore' }
                    });
                    assert(matchedUsers.length === response.body.users.length, true);
                    for (let i = 0; i < matchedUsers.length; i++) {
                        assert(matchedUsers[i].username === response.body.users[i].username);
                    }
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should return an empty array if no users found', (done) => {
            const searchTerm = 'no match in db';
            request(app)
                .get('/users')
                .query({ search: searchTerm })
                .set('cookie', cookie)
                .then((response) => {
                    assert(response.body.users.length === 0, true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should deny an unauthorized user', (done) => {
            const searchTerm = 'joe';
            request(app).get('/users').query({ search: searchTerm }).expect(401, done);
        });
    });
});
