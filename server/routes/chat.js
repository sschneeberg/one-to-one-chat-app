// Imports
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const passport = require('passport');
const db = require('../models');
const router = express.Router();

// Routes (Private)
// Shouldn't be able to access chat information without logged in user

// GET /chat/ping (Private)
router.get('/ping', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ msg: 'Connected to chat router' });
});

module.exports = router;
