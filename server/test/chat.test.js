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
        it('Should reject an unauthorized user', (done) => {
            const searchTerm = 'joe';
            request(app).get('/users').query({ search: searchTerm }).expect(401, done);
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
    });

    describe('GET /chats', () => {
        it('Should return a 200 json response', (done) => {
            request(app)
                .get('/chats')
                .set('cookie', cookie)
                .query({ id: `${id}` })
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
        it('Should reject an unauthorized user', (done) => {
            request(app)
                .get('/chats')
                .query({ id: `${id}` })
                .expect(401, done);
        });
        it('Should find all chats for a given user', (done) => {
            request(app)
                .get('/chats')
                .query({ id: `${id}` })
                .set('cookie', cookie)
                .then(async (response) => {
                    const chats = await db.Chat.find({ 'members.id': id });
                    assert(chats.length === response.body.conversations.length, true);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('GET /chats/:id (where id is a chat id', () => {
        it('Should return a 200 json response', (done) => {
            request(app)
                .get(`/chats/${seedChats[1]._id}`)
                .set('cookie', cookie)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
        it('Should reject an unauthorized user', (done) => {
            request(app).get(`/chats/${seedChats[1]._id}`).expect(401, done);
        });
        it('Should reject a search for chats the user is not a part of', (done) => {
            request(app).get(`/chats/${seedChats[0]._id}`).set('cookie', cookie).expect(401, done);
        });
        it('Should return all the messages for a given chat in a date-sorted order', (done) => {
            request(app)
                .get(`/chats/${seedChats[1]._id}`)
                .set('cookie', cookie)
                .then(async (response) => {
                    const msgs = await db.Message.find({ chat_id: seedChats[1]._id }).sort({ sent_at: 'descending' });
                    assert(msgs.length === response.body.messages.length, true);
                    for (let i = 0; i < msgs.length; i++) {
                        assert(msgs[i]._id.toString() === response.body.messages[i]._id, true);
                    }
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('POST /chats', () => {
        it('Should successfully create a chat for the user', (done) => {
            request(app)
                .post('/chats')
                .send({ members: [{ id: seedUsers[0]._id, username: seedUsers[0].username }] })
                .set('cookie', cookie)
                .expect('Content-Type', /json/)
                .expect(201)
                .then(async (response) => {
                    assert(response.body.msg === 'Create successful', true);
                    const chat = await db.Chat.findOne({ _id: response.body.chat });
                    assert(chat.members[0].id === id.toString() || chat.members[1].id === id.toString(), true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should reject an unauthorized user', (done) => {
            request(app)
                .post('/chats')
                .send({ members: [{ id: seedUsers[0]._id, username: seedUsers[0].username }] })
                .expect(401, done);
        });
    });

    describe('POST /chats/:id', () => {
        it('Should reject an unauthorized user', (done) => {
            request(app).post(`/chats/${seedChats[1]._id}`).send({ content: 'And the red balloon' }).expect(401, done);
        });
        it('Should successfully add a message to the given chat for a user', (done) => {
            request(app)
                .post(`/chats/${seedChats[1]._id}`)
                .send({ content: 'And the red balloon' })
                .set('cookie', cookie)
                .then(async (response) => {
                    assert(response.body.msg === 'Create successful', true);
                    const message = await db.Message.findOne({
                        chat_id: seedChats[1]._id,
                        content: 'And the red balloon'
                    });
                    assert(message.user_from === id.toString(), true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should not post to a chat the user is not in', (done) => {
            request(app)
                .post(`/chats/${seedChats[0]._id}`)
                .send({ content: 'And the red balloon' })
                .set('cookie', cookie)
                .expect(401, done);
        });
    });
});
