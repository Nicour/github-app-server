const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const auth = require('./routes/auth');
const organizationRepos = require('./routes/organizationRepos');

const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'https://mystifying-knuth-fe1f6c.netlify.app'
  })
)
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cookieParser());

app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1 * 1000
  }
}));

mongoose.connect(process.env.MONGO_URL, {
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => {
  console.log(`Connected to database`);
})
.catch(error => {
  console.error(error);
});

app.use('/auth', auth);
app.use('/orgs', organizationRepos);

app.use((req, res, next) => {
  res.status(404).json({ code: 'not found' });
})

app.use((err, req, res, next) => {
  console.error('ERROR', req.method, req.path, err);
  if (!res.headersSent) {
    const statusError = err.status || '500';
    res.status(statusError).json(err);
  }
})

module.exports = app;
