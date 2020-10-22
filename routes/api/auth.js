const express = require('express');
const passport = require('passport');
const {
    register,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
    confirmEmail,
} = require('../../controllers/auth');

const router = express.Router();

const { protect } = require('../../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/google', passport.authenticate('google', {
    scope: ['profile','email']
}));
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    res.send('you reached the callback URI');
});
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/confirmemail', confirmEmail);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;