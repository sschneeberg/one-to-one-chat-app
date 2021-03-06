// Imports
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const db = require('../models');
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

// Routes

// POST /users/register (Public) Signup
router.post('/register', async (req, res, next) => {
    try {
        // validate: username, password, email in request, password is 6+ characters
        if (!req.body.password || !req.body.username || !req.body.email) {
            res.status(400).json({ msg: 'Email, Username, and Password required' });
        } else if (req.body.password.length < 6) {
            res.status(400).json({ msg: 'Password must be at least 6 characters' });
        } else if (req.body.username.length < 3) {
            res.status(400).json({ msg: 'Username must be at least 3 characters' });
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
                const user = await newUser.save(); // pre save hook will hash password
                const payload = { id: user._id, username: user.username };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXP });
                res.cookie('jwt', token, { httpOnly: true, secure: process.env.SECURE }) //false for dev environment
                    .status(201)
                    .json({ msg: 'Signup successful' });
            }
        }
    } catch (err) {
        console.log('REGISTER ERR', err);
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
                const payload = { id: user._id, username: user.username };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXP });
                res.cookie('jwt', token, { httpOnly: true, secure: process.env.SECURE })
                    .status(200)
                    .json({ msg: 'Login successful' });
            }
        }
    } catch (err) {
        console.log('LOGIN ERR', err);
        next(err);
    }
});

// GET /users/logout (Public) Logout
router.get('/logout', (req, res) => {
    //if cookie remove it
    if (req.cookies['jwt']) {
        res.clearCookie['jwt'].status(200).json({ msg: 'Logout successful' });
    } else {
        res.status(400).json({ msg: 'Invalid Cookie' });
    }
});

// get /users (Private) Search
//Current Idea: query db when user types 3 or 4 characters, return all matching users then filter on the front end as more characters are added
//If the user backspaces to less than 3/4 characters, make another db call when character threshhold is hit for new search term (confirm on front end that search term is new)
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const searchTerm = req.query.search.split('-').join(' '); //turn spaces to dashes on the front end to make url friendly
        if (searchTerm.length !== 3) {
            res.status(400).json({ msg: 'invalid search term, must be 3 characters' });
        } else {
            //find all users matching a searched string, best matches first
            const users = await db.User.find({ $text: { $search: searchTerm.toLowerCase() } })
                .select({ username: 1, _id: 1 })
                .sort({
                    score: { $meta: 'textScore' }
                });
            // dont pass login information: username and id only
            res.status(200).json({ users });
        }
    } catch (err) {
        console.log('GET USERS ERR', err);
        next(err);
    }
});

module.exports = router;
