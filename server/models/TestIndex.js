const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const mongodb = new MongoMemoryServer();

//COME BACK TO THIS
//IN PROGRESS: Cannot get db to connect before tests run even with a before hook, still connecting to local db
mongodb.getUri().then((uri) => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
        useCreateIndex: true
    });

    const db = mongoose.connection;

    // for dev:
    db.once('open', () => console.log(`Mongo Memory Server on port ${port}`));

    db.on('error', (err) => console.log(`Database error: ${err}`));

    module.exports = {
        User: require('./User'),
        Message: require('./Message'),
        Chat: require('./Chat')
    };
});
