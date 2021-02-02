// this set up followed from a previously created template
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../models');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const options = {};
options.jwtFromReqeust = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET;
options.passReqToCallback = true;

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(options, (req, jwt_payload, done) => {
            // find user from id in payload
            db.User.findById(jwt_payload.id)
                .then((user) => {
                    if (user) {
                        //user found, return user
                        req.user = user;
                        return done(null, user);
                    } else {
                        // no user in db
                        return done(null, false);
                    }
                })
                .catch((err) => {
                    throw err;
                });
        })
    );
};
