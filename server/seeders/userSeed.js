const db = require('../models');
const bcrypt = require('bcrypt');

let seedPassword = 'password';

const runSeed = async () => {
    try {
        await db.User.deleteMany({});
        await db.Chat.deleteMany({});
        await db.Message.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(seedPassword, salt);
        seedPassword = hash;
        const createdUsers = await db.User.insertMany([
            {
                username: 'John Smith',
                email: 'jsmith@test1.com',
                password: seedPassword
            },
            {
                username: 'John Smith',
                email: 'jsmith@test2.com',
                password: seedPassword
            },
            {
                username: 'Jane Doe',
                email: 'janedoe@test.com',
                password: seedPassword
            },
            {
                username: 'Mary Jane',
                email: 'mary.jane@test.com',
                password: seedPassword
            }
        ]);
        const createdChats = await db.Chat.insertMany([
            {
                members: [
                    { id: createdUsers[0]._id, username: createdUsers[0].username },
                    { id: createdUsers[2]._id, username: createdUsers[2].username }
                ]
            },
            {
                members: [
                    { id: createdUsers[1]._id, username: createdUsers[1].username },
                    { id: createdUsers[3]._id, username: createdUsers[3].username }
                ]
            },
            {
                members: [
                    { id: createdUsers[3]._id, username: createdUsers[3].username },
                    { id: createdUsers[2]._id, username: createdUsers[2].username }
                ]
            }
        ]);
        const createdMessages = await db.Message.insertMany([
            {
                content: 'Hello world',
                user_from: createdUsers[0]._id,
                sent_at: new Date(),
                chat_id: createdChats[0]._id
            },
            {
                content: 'Hello back',
                user_from: createdUsers[2]._id,
                sent_at: new Date(),
                chat_id: createdChats[0]._id
            },
            {
                content: 'Goodnight room',
                user_from: createdUsers[3]._id,
                sent_at: new Date(),
                chat_id: createdChats[1]._id
            },
            {
                content: 'Goodnight Moon',
                user_from: createdUsers[3]._id,
                sent_at: new Date(),
                chat_id: createdChats[1]._id
            },
            {
                content: 'Goodnight cow jumpin over the moon',
                user_from: createdUsers[1]._id,
                sent_at: new Date(),
                chat_id: createdChats[1]._id
            },
            {
                content: 'Goodnight light',
                user_from: createdUsers[3]._id,
                sent_at: new Date(),
                chat_id: createdChats[1]._id
            },
            {
                content: 'Hello!',
                user_from: createdUsers[2]._id,
                sent_at: new Date(),
                chat_id: createdChats[2]._id
            }
        ]);
        return [createdUsers, createdChats];
    } catch (err) {
        console.log('SEED ERR', err);
    }
};

module.exports = runSeed;
