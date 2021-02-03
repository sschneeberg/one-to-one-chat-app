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
            const [email, password, username] = ['joe@test.com', 'password', 'Joe Schmoe'];
            request(app)
                .post('/users/register')
                .send({ email, password, username })
                .expect(201)
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'Signup sucessful', true);
                    assert(response.body.token, true);
                    db.User.findOne({ email })
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
            const [email, password, username] = ['joe@test.com', 'password', 'Joey Schmoey'];
            request(app)
                .post('/users/register')
                .send({ email, password, username })
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'Email in use', true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should not create an account with missing requirements', function (done) {
            const [email, password] = ['badregister@test.com', 'password'];
            request(app)
                .post('/users/register')
                .send({ email, password })
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
            const [email, password, username] = ['badregister@test.com', 'pass', 'Short Password'];
            request(app)
                .post('/users/register')
                .send({ email, password, username })
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
            const [email, password] = ['joe@test.com', 'password'];
            request(app)
                .post('/users/login')
                .send({ email, password })
                .expect(200)
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'Login sucessful', true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should reject a non existent user/incorrect email', function (done) {
            const [email, password] = ['badlogin@test.com', 'password'];
            request(app)
                .post('/users/login')
                .send({ email, password })
                .expect(400)
                .expect('Content-type', /json/)
                .then((response) => {
                    assert(response.body.msg === 'User not found', true);
                    done();
                })
                .catch((err) => done(err));
        });
        it('Should reject a wrong password', function (done) {
            const [email, password] = ['joe@test.com', 'wrongPassword'];
            request(app)
                .post('/users/login')
                .send({ email, password })
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
