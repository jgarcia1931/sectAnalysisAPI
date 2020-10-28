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

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public

/**
 * @swagger
 *   paths:
 *     /api/v1/auth/register:
 *       post:
 *         tags:
 *           - "Auth"
 *         summary: Register new user
 *         consumes:
 *           - application/json
 *         parameters:
 *           - in: body
 *             name: user
 *             description: The user to be registered
 *             schema:
 *               type: object
 *               required:
 *                 - name
 *                 - email
 *                 - password
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *                 role:
 *                   type: string
 *         responses:
 *           201:
 *             description: Created
 */
router.post('/register', register);
/**
 * @swagger
 *   paths:
 *     /api/v1/auth/login:
 *       post:
 *         tags:
 *           - "Auth"
 *         summary: Login user
 *         consumes:
 *           - application/json
 *         parameters:
 *           - in: body
 *             name: user
 *             description: The user to be registered
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *         responses:
 *           200:
 *             description: Logged in
 */
router.post('/login', login);
/**
 * @swagger
 *   paths:
 *     /api/v1/auth/google:
 *       get:
 *         tags:
 *           - "Auth"
 *         summary: Login Google
 */
router.get('/google', passport.authenticate('google', {
    scope: ['profile','email']
}));
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    res.send('you reached the callback URI');
});
/**
 * @swagger
 *   paths:
 *     /api/v1/auth/logout:
 *       get:
 *         tags:
 *           - "Auth"
 *         summary: Logout user
 *         responses:
 *           200:
 *             description: logged out
 */
router.get('/logout', logout);

/**
 * @swagger
 *   paths:
 *     /api/v1/auth/me:
 *       get:
 *         tags:
 *           - "Auth"
 *         summary: Return currently logged in user
 *         responses:
 *           200:
 *             description: current user
 */
router.get('/me', protect, getMe);
router.get('/confirmemail', confirmEmail);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;