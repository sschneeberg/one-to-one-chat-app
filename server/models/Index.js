const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true
});

const db = mongoose.connection;

// for dev:
db.once('open', console.log(`Database connected on ${db.host}: ${db.port}`));
db.on('error', (err) => console.log(`Database error: ${err}`));

module.exports = {
    User: require('./User'),
    Message: require('./Message'),
    Chat: require('./Chat')
};
