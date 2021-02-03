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
router.post('/register', async (req, res, next) => {
    try {
        // validate: username, password, email in request, password is 6+ characters
        if (!req.body.password || !req.body.username || !req.body.email) {
            res.status(400).json({ msg: 'Email, Username, and Password required' });
        } else if (req.body.password.length < 6) {
            res.status(400).json({ msg: 'Password must be at least 6 characters' });
        } else {
            // emails must be unique: check db for existing
            const user = await db.User.findOne({ email: req.body.email });
            if (user) {
                res.status(400).json({ msg: 'Email in use' });
            } else {
                const newUser = new db.User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                });
                // hash password before saving
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(req.body.password, salt);
                newUser.password = hash;
                const user = await newUser.save();
                const payload = { id: user._id };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXP });
                res.cookie('jwt', token, { httpOnly: true, secure: false }) //false for dev environment
                    .status(201)
                    .json({ msg: 'Signup sucessful' });
            }
        }
    } catch (err) {
        next(err);
    }
});

// POST /users/login (Public) Login
router.post('/login', async (req, res, next) => {
    try {
        // given email, find user and check password
        const user = await db.User.findOne({ email: req.body.email });
        //if np user found, unauthorized
        if (!user) {
            res.status(400).json({ msg: 'User not found' });
        } else {
            //if user, check passwords
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                res.status(400).json({ msg: 'Login information incorrect' });
            } else {
                // if passwords match, sign and send token
                const payload = { id: user._id };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXP });
                res.cookie('jwt', token, { httpOnly: true, secure: false })
                    .status(200)
                    .json({ msg: 'Login sucessful' });
            }
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});

// GET /users/logout (Public) Logout
router.get('/logout', (req, res) => {
    //if cookie remove it
    if (req.cookies['jwt']) {
        res.clearCookie['jwt'].status(200).json({ msg: 'Logout Successful' });
    } else {
        res.status(400).json({ msg: 'Invalid Cookie' });
    }
});

module.exports = router;
