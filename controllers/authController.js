const bcrypt = require('bcryptjs')
const User = require('../models/User')

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function redirectWithMessage(path, message) {
    return `${path}?message=${encodeURIComponent(message)}`
}

function safeNext(value) {
    return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
        ? value
        : '/settings'
}

function validEmail(email) {
    return emailPattern.test(email) && email.length <= 254
}

function sessionUser(user) {
    return { id: user.id, username: user.username, email: user.email }
}

function regenerateSession(req, user) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) return reject(error)
            req.session.user = sessionUser(user)
            return resolve()
        })
    })
}

function showSignIn(req, res) {
    res.render('auth/sign-in', {
        message: req.query.message || '',
        error: '',
        next: safeNext(req.query.next)
    })
}

function showSignUp(req, res) {
    res.render('auth/sign-up', {
        message: req.query.message || '',
        error: '',
        next: safeNext(req.query.next)
    })
}

async function register(req, res) {
    const username = String(req.body.username || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const next = safeNext(req.body.next)

    if (!username || username.length > 50 || !validEmail(email) || password.length < 8 || password.length > 128) {
        return res.status(400).render('auth/sign-up', {
            message: '',
            error: 'Enter a username, a valid email, and a password of at least 8 characters.',
            next
        })
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] })
        if (existingUser) {
            return res.status(409).render('auth/sign-up', {
                message: '',
                error: 'That username or email is already registered.',
                next
            })
        }

        const passwordHash = await bcrypt.hash(password, 12)
        const user = await User.create({ username, email, password: passwordHash })
        await regenerateSession(req, user)
        return res.redirect(next)
    } catch (error) {
        console.error('Registration failed:', error.message)
        return res.status(500).render('auth/sign-up', {
            message: '',
            error: 'Registration is temporarily unavailable. Please try again.',
            next
        })
    }
}

async function signIn(req, res) {
    const username = String(req.body.username || '').trim()
    const password = String(req.body.password || '')
    const next = safeNext(req.body.next)

    try {
        const user = await User.findOne({ username })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).render('auth/sign-in', {
                message: '',
                error: 'The username or password is incorrect.',
                next
            })
        }

        await regenerateSession(req, user)
        return res.redirect(next)
    } catch (error) {
        console.error('Sign in failed:', error.message)
        return res.status(500).render('auth/sign-in', {
            message: '',
            error: 'Sign in is temporarily unavailable. Please try again.',
            next
        })
    }
}

function signOut(req, res) {
    req.session.destroy((error) => {
        if (error) {
            console.error('Sign out failed:', error.message)
            return res.status(500).send('Unable to sign out.')
        }
        return res.redirect('/')
    })
}

function requireUser(req, res, next) {
    if (!req.session.user) {
        const destination = encodeURIComponent(req.originalUrl)
        return res.redirect(`/auth/sign-up?next=${destination}`)
    }
    return next()
}

async function showSettings(req, res) {
    try {
        const user = await User.findById(req.session.user.id).select('username email')
        if (!user) return res.redirect('/auth/sign-out')
        return res.render('auth/settings', { user, message: req.query.message || '', error: '' })
    } catch (error) {
        console.error('Settings load failed:', error.message)
        return res.status(500).send('Unable to load settings.')
    }
}

async function updateSettings(req, res) {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (!validEmail(email) || (password && (password.length < 8 || password.length > 128))) {
        return res.status(400).render('auth/settings', {
            user: req.session.user,
            message: '',
            error: 'Enter a valid email and a password between 8 and 128 characters.'
        })
    }

    try {
        const user = await User.findById(req.session.user.id)
        if (!user) return res.redirect('/auth/sign-out')

        if (email && email !== user.email) {
            const emailInUse = await User.findOne({ email, _id: { $ne: user.id } })
            if (emailInUse) {
                return res.status(409).render('auth/settings', { user, message: '', error: 'That email is already in use.' })
            }
            user.email = email
        }
        if (password) {
            if (password.length < 8) {
                return res.status(400).render('auth/settings', { user, message: '', error: 'The new password must be at least 8 characters.' })
            }
            user.password = await bcrypt.hash(password, 12)
        }
        await user.save()
        req.session.user.email = user.email
        return res.redirect(redirectWithMessage('/settings', 'Your account settings were updated.'))
    } catch (error) {
        console.error('Settings update failed:', error.message)
        return res.status(500).render('auth/settings', { user: req.session.user, message: '', error: 'Settings could not be updated.' })
    }
}

module.exports = {
    showSignIn,
    showSignUp,
    register,
    signIn,
    signOut,
    requireUser,
    showSettings,
    updateSettings
}
