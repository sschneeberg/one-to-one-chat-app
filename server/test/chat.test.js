const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const db = require('../models');
const runSeed = require('../seeders/userSeed');

describe('Chat Routes', () => {
    let cookie = '';
    let [seedUsers, seedChats] = [];
    let [id, email, username] = [];
    const testPassword = 'password';

    before(async () => {
        //add a user to test db and log them in
        await db.User.deleteMany({});
        await db.Chat.deleteMany({});
        await db.Message.deleteMany({});
        [seedUsers, seedChats] = await runSeed();
        [id, email, username] = [seedUsers[3]._id, seedUsers[3].email, seedUsers[3].username];
        try {
            const response = await request(app).post('/users/login').send({ email, password: testPassword });
            cookie = response.header['set-cookie'][0].split(' ')[0];
        } catch (err) {
            console.log('TEST LOGIN ERR', err);
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
                .query({ search: searchTerm.split(' ').join('-') })
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

    describe('GET /chats/:id (where id is user id)', () => {
        it('Should return a 200 json response', (done) => {
            request(app).get(`/chats/${id}`).set('cookie', cookie).expect('Content-Type', /json/).expect(200, done);
        });
        it('Should deny an unauthorized user', (done) => {
            request(app).get(`/chats/${id}`).expect(401, done);
        });
        it('Should find all chats for a given user', (done) => {
            request(app)
                .get(`/chats/${id}`)
                .set('cookie', cookie)
                .then(async (response) => {
                    const chats = await db.Chat.find({ 'members.id': id });
                    assert(chats.length === response.body.conversations.length, true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should return an empty array when no chats are found', (done) => {
            request(app)
                .get('/chats/4')
                .set('cookie', cookie)
                .then((response) => {
                    assert(response.body.conversations.length === 0, true);
                    done();
                })
                .catch((err) => done(err));
        });
    });
});
