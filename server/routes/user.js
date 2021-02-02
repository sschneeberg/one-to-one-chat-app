// Imports
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

// Routes

// GET /users/ping (Public)
router.get('/ping', (req, res) => {
    res.status(200).json({ msg: 'Connected to user router' });
});

// POST /users/register (Public) Signup
router.post('/register', (req, res) => {
    // validate: username, password, email in request, password is 6+ characters
    if (!req.body.password || !req.body.username || !req.body.email) {
        res.json({ msg: 'Email, Username, and Password required' });
    } else if (req.body.password.length < 6) {
        res.json({ msg: 'Password must be at least 6 characters' });
    } else {
        // emails must be unique: check db for existing
        db.User.findOne({ email: req.body.email })
            .then((user) => {
                if (user) {
                    res.json({ msg: 'Email in use' });
                } else {
                    const newUser = new db.User({
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password
                    });
                    // hash password before saving
                    bcrypt.genSalt(10, (err1, salt) => {
                        if (err1) {
                            console.log(err1);
                            res.json({ msg: 'error', error: err1 });
                        }
                        bcrypt.hash(req.body.password, salt, (err2, hash) => {
                            if (err2) {
                                console.log(err2);
                                res.json({ msg: 'error', error: err2 });
                            }
                            newUser.password = hash;
                            newUser
                                .save()
                                .then((user) => res.status(201).json({ msg: 'User created', user: user }))
                                .catch((err) => {
                                    console.log(err);
                                    res.json({ msg: 'error', error: err });
                                });
                        });
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                res.json({ msg: 'error', error: err });
            });
    }
});

// POST /users/login (Public) Login
router.post('/login', (req, res) => {
    // given email, find user and check password
    db.User.findOne({ email: req.body.email })
        .then((user) => {
            //if np user found, unauthorized
            if (!user) {
                res.status(400).json({ msg: 'User not found' });
            } else {
                //if user, check passwords
                bcrypt.compare(req.body.password, user.password).then((isMatch) => {
                    if (!isMatch) res.status(400).json({ msg: 'Login information incorrect' });
                    // if passwords match, sign and send token
                    const payload = {
                        email: user.email,
                        id: user._id,
                        username: user.username
                    };
                    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                        if (err) {
                            console.log(err);
                            res.json({ msg: 'error', error: err });
                        }
                        res.status(200).json({ msg: 'Login sucessful', token: `Bearer ${token}` });
                    });
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.json({ msg: 'error', error: err });
        });
});

module.exports = router;
