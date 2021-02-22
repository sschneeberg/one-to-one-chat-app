const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema(
    {
        id: { type: String, index: true },
        username: { type: String }
    },
    { autoIndex: false, _id: false }
);

const chatSchema = new Schema({
    members: [memberSchema]
});

const Chat = mongoose.model('Chat', chatSchema);
Chat.createIndexes();

module.exports = Chat;
