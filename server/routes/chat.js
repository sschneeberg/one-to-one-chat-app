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
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        if (req.user.id !== req.query.id) {
            //cannot get chats the user is not in
            res.sendStatus(401);
        } else {
            const chats = await db.Chat.find({ 'members.id': req.query.id });
            res.status(200).json({ conversations: chats });
        }
    } catch (err) {
        console.log('GET CHAT ERR', err);
        next(err);
    }
});

// GET messages -- where :id is chat id (Private)
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const chat = await db.Chat.findOne({ _id: req.params.id, 'members.id': req.user.id });
        if (chat) {
            const messages = await db.Message.find({ chat_id: req.params.id }).sort({ sent_at: 'descending' });
            res.status(200).json({ messages: messages });
        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        console.log('GET MSGS ERR', err);
        next(err);
    }
});

// POST chat (Private)
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        // chatMembers given to backend as [{id: id, username: username}, {},...] for each member in new chat
        const chatMembers = req.body.members.push({ id: req.user.id, username: req.user.username }); // add in current user
        const newChat = new db.Chat({
            members: chatMembers
        });
        const chat = await newChat.save();
        res.status(201).json({ msg: 'Create successful', chat: chat.id });
    } catch (err) {
        console.log('POST CHAT ERR', err);
        next(err);
    }
});

// Until sockets:
// POST messages (Private)
router.post('/:id/message', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const newMsg = new db.Message({
            chat_id: req.params.id,
            sent_at: new Date(Date.now()),
            content: req.body.content,
            user_from: req.body.from
        });
        await newMsg.save();
        res.status(201).json({ msg: 'Create successful' });
    } catch (err) {
        console.log('POST MSG ERR', err);
        next(err);
    }
});

module.exports = router;
