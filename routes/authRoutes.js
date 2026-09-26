const express = require('express')
const rateLimit = require('express-rate-limit')
const {
    showSignIn,
    showSignUp,
    register,
    signIn,
    signOut,
    requireUser,
    showSettings,
    updateSettings
} = require('../controllers/authController')

const router = express.Router()
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Too many authentication attempts. Try again later.'
})

router.get('/auth/sign-in', showSignIn)
router.post('/auth/sign-in', authLimiter, signIn)
router.get('/auth/sign-up', showSignUp)
router.post('/auth/sign-up', authLimiter, register)
router.get('/auth/sign-out', signOut)
router.get('/settings', requireUser, showSettings)
router.post('/settings', requireUser, updateSettings)

module.exports = router;
