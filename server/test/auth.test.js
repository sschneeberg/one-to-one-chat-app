const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const db = require('../models');

describe('User Routes', function () {
    describe('GET /users/ping', function () {
        it('Should return a 200 response', function (done) {
            request(app).get('/users/ping').expect(200, done);
        });
        it('Should return a 200 response', function (done) {
            request(app)
                .get('/users/ping')
                .expect('Content-Type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'Connected to user router', true);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('POST /users/register', function () {
        it('Should successfully create a user', function (done) {
            request(app)
                .post('/users/register')
                .send({ email: 'joe@test.com', password: 'password', username: 'Joe Schmoe' })
                .expect(201)
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'User created', true);
                    assert(response.body.user.email === 'joe@test.com', true);
                    assert(response.body.user.username === 'Joe Schmoe', true);
                    assert(response.body.user.password !== 'password', true);
                    db.User.findOne({ email: response.body.user.email })
                        .then((user) => {
                            assert(user.username === 'Joe Schmoe', true);
                            assert(user.password !== 'password', true);
                            done();
                        })
                        .catch((err) => done(err));
                })
                .catch((err) => done(err));
        });
        it('Should not reuse an existing email', function (done) {
            request(app)
                .post('/users/register')
                .send({ email: 'joe@test.com', password: 'password', username: 'Joey Schmoey' })
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'Email in use', true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should not create an account with missing requirements', function (done) {
            request(app)
                .post('/users/register')
                .send({ email: 'badregister@test.com', password: 'password' })
                .expect(400)
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'Email, Username, and Password required', true);
                    db.User.findOne({ email: 'badregister@test.com' }).then((user) => {
                        assert(!user, true);
                        done();
                    });
                })
                .catch((err) => done(err));
        });
        it('Should not create an account with a short password', function (done) {
            request(app)
                .post('/users/register')
                .send({ email: 'badregister@test.com', password: 'pass', username: 'Short Password' })
                .expect(400)
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'Password must be at least 6 characters', true);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('POST /users/login', function () {
        it('Should log in an existing user', function (done) {
            request(app)
                .post('/users/login')
                .send({ email: 'joe@test.com', password: 'password' })
                .expect(200)
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'Login sucessful', true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should reject a non existent user/incorrect email', function (done) {
            request(app)
                .post('/users/login')
                .send({ email: 'badlogin@test.com', password: 'password' })
                .expect(400)
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'User not found', true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should reject a wrong password', function (done) {
            request(app)
                .post('/users/login')
                .send({ email: 'joe@test.com', password: 'wrongPassword' })
                .expect(400)
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'Login information incorrect', true);
                    done();
                })
                .catch((err) => done(err));
        });
    });
});
