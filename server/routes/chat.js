// Imports
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const passport = require('passport');
const db = require('../models');
const router = express.Router();

// Routes (Private)
// Shouldn't be able to access chat information without logged in user

// GET chats -- where :id is user id (Private)
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const chats = await db.Chat.find({ where: { members: req.params.id } });
    } catch (err) {
        console.log('GET CHAT ERR', err);
    }
});

// GET messages -- where :id is chat id
router.get('/:id/messages');

// Until Sockets:
// POST chat

// POST messages

module.exports = router;
