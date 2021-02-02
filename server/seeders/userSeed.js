const db = require('../models');
const bcrypt = require('bcrypt');

let seedPassword = 'password';

bcrypt.genSalt(10, (err1, salt) => {
    if (err1) throw err1;
    bcrypt.hash(seedPassword, salt, (err2, hash) => {
        if (err2) throw err2;
        seedPassword = hash;
        db.User.insertMany([
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
        ])
            .then((createdUsers) => {
                console.log('SEED SUCCESSFUL');
                console.log(createdUsers);
            })
            .catch((err) => console.log(err));
    });
});
