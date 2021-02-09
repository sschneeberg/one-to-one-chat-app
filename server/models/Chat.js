const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    id: { type: String, index: true },
    username: { type: String }
});

const chatSchema = new Schema({
    members: [memberSchema]
});

module.exports = mongoose.model('Chat', chatSchema);
