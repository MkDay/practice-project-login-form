/*
NOTES:
* video ref: https://www.youtube.com/watch?v=-RCnNyD0L-s
* wanna tweak a bit
* after login didn't redirect to the home page
*/

if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const initialzePassport = require('./passport-config');
const methodOverride = require('method-override');


const app = express();

initialzePassport(passport, 
    (email) => users.find((user) => user.email === email), 
    (id) => users.find((user) => user.id === id));

const users = [];

app.use(express.urlencoded({ extended: false }));

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

app.get('/', checkAuthenticate, (req, res) => {
    res.render('index', { name: req.user.name });
});

app.get('/register', checkNotAuthenticate, (req, res) => {
    res.render('register');
});

app.post('/register', checkNotAuthenticate, async (req, res) => {

    try {

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        res.redirect('/login');

    } catch(err) {
        res.redirect('/register');
    }
    console.log(users);
    
});

app.get('/login', checkNotAuthenticate, (req, res) => {
    res.render('login');
});

app.post('/login', checkNotAuthenticate, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

function checkAuthenticate (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}

function checkNotAuthenticate (req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

app.listen(3000, () => {
    console.log('connecting...');
});

