
import DB from '../DB/Database';
import session from 'express-session';
import * as passport from 'passport';
import * as MySQL from 'mysql';
import * as CONFIG from './json/login.json';
import { Application } from 'express';
import {Strategy} from 'passport-google-oauth20';
import {baseStat} from '../Tools/Data';

export function init(passport: passport.PassportStatic, App: Application){
    
    passport.use(new Strategy({
            clientID: CONFIG.clientID,
            clientSecret: CONFIG.clientSecret,
            callbackURL: CONFIG.callbackURL,
            passReqToCallback : true
        }, (req, accessToken, refreshToken, profile, done) => {
            process.nextTick(async () => {
                const user = await DB.TABLE.users.findOne({ id : profile.id });
                
                if(!user){
                    await DB.TABLE.users.add(profile.id, "{}", 1, 0, "earth", baseStat, "{}");
                }
                (req.session as Express.Session).profile = {
                    id : profile.id
                }
                await DB.TABLE.session.add((req.session as Express.Session).id, (req.session as Express.Session).profile, Date.now());
                return done(undefined, profile);
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

    passport.serializeUser((user: any, done: any)  => {
        done(null, user);
    });
    
    passport.deserializeUser((obj: any, done: any) => {
        done(null, obj);
    });

    App.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
    
    App.get('/auth/google/callback', passport.authenticate( 'google', { failureRedirect: '/', successRedirect: '/game' }));
    
}

export function isAuthenticated(req: Express.Request, res: any, process: any){
    if(req.isAuthenticated()) return process();
    res.redirect('/');
}
