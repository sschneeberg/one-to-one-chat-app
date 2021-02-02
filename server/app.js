// Imports
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const { join } = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const socketio = require('socket.io');
const passport = require('passport');

// Routers
const indexRouter = require('./routes/index');
const pingRouter = require('./routes/ping');
const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');

const { json, urlencoded } = express;

// Server set up
const app = express();
const httpServer = require('http').createServer(app);
const io = socketio(httpServer, { cors: { origin: '*' } }); // allow all for now
app.use(cors({ origin: '*' })); // allow all for now
app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));
app.use(passport.initialize());
require('./config/passport')(passport);

// Routers
app.use('/', indexRouter);
app.use('/ping', pingRouter);
app.use('/user', userRouter);
app.use('/chat', chatRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ error: err });
});

module.exports = httpServer;
