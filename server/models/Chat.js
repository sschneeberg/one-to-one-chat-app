const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    members: [{ type: String }] // array of user id's
});

module.exports = mongoose.model('Chat', chatSchema);
