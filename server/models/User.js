const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        username: { type: String, required: true, minLength: 3 },
        searchTag: { type: String, maxLength: 3 },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    },
    { autoIndex: false }
);

userSchema.index({ searchTag: 'text' });

userSchema.pre('save', async function (next) {
    // hash password before saving
    try {
        let user = this;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        user.searchTag = user.username.slice(0, 3).toLowerCase();
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model('User', userSchema);
User.createIndexes();

module.exports = User;
