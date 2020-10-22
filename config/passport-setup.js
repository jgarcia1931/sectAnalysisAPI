const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/User');
const asyncHandlerPass = require('../middleware/asyncPass');

passport.serializeUser((user, done)=>{
    done(null, user.id);
})

passport.deserializeUser((id, done)=>{
    User.findById(id).then((user) => {
        done(null, user);
    });
})

passport.use(
    new GoogleStrategy({
        clientID: '222952724775-bagidtu6bros10vredni7rm24koqcamo.apps.googleusercontent.com',
        clientSecret: 'bOkjt_mXPHIWHYNp3eyGGXw6',
        callbackURL: '/api/v1/auth/google/callback',
    },asyncHandlerPass( async (accessToken, refreshToken, profile, done)=>{
        const {id, displayName, emails} = profile;
        console.log(emails[0].value);
        let user = await User.findOne({googleId:id});

        if (!user) {
            user = await User.create({
                name: displayName,
                googleId:id,
                email:emails[0].value
            });
        }
        done(null, user);
    }))
); //Note where I moved the parenthesis