const passport = require('passport');
const DB = require("../DB/Database")
const session = require('express-session');
const CONFIG = require("./json/login.json");
const MySQL = require("mysql");

const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy

exports.init = function(App){
    passport.serializeUser((user, done)  => {
        done(null, user);
    });
    
    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
    
    passport.use(new GoogleStrategy({
            clientID: CONFIG.clientID,
            clientSecret: CONFIG.clientSecret,
            callbackURL: CONFIG.callbackURL,
            passReqToCallback : true
        }, (req, accessToken, refreshToken, profile, done) => {
            process.nextTick(async () => {
                const user = await DB.TABLE.users.findOne({ id : profile.id });
                if(!user){
                    await DB.TABLE.users.add(profile.id, "{}", 1);
                }
                req.session.profile = {
                    id : profile.id
                }
                await DB.TABLE.session.add(req.session.id, req.session.profile, Date.now());
                return done(null, profile);
            })
        }
    ));
    App.use(session({
        secret: CONFIG.SESSION_SECRET,
        resave: true,
        saveUninitialized: false
    }));

    App.use(passport.initialize());
    App.use(passport.session()); 

    App.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
    
    App.get('/auth/google/callback', passport.authenticate( 'google', { failureRedirect: '/', successRedirect: '/game' }));
    
}
exports.isAuthenticated = function (req, res, process) {
    if(req.isAuthenticated()) return process();
    res.redirect('/');
};
