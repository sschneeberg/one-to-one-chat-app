const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    content: { type: String, required: true },
    chat_id: { type: String, required: true, unique: true },
    user_from: { type: String, required: true },
    sent_at: { type: Date, required: true, default: new Date() }
});

module.exports = mongoose.model('Message', messageSchema);
