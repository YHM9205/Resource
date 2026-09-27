require('dotenv').config()
const express = require("express") //importing express package
const session = require('express-session')
const mongoose = require('mongoose')
const path = require('path')
const crypto = require('crypto')
const passUserToView = require('./middleware/pass-user-to-view')
const pageRoutes = require('./routes/pageRoutes')
const diagnosticRoutes = require('./routes/diagnosticRoutes')
const authRoutes = require('./routes/authRoutes')
const carRoutes = require('./routes/carRoutes')
const agentDashboardRoutes = require('./routes/agentDashboardRoutes')
const app = express() // creates a express application
const PORT = Number(process.env.PORT) || 3000
const SESSION_SECRET = process.env.SESSION_SECRET || (process.env.NODE_ENV !== 'production' ? crypto.randomBytes(32).toString('hex') : '')
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/autocode-db'

if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required')
}

function csrfTokenMiddleware(req, res, next) {
    if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(24).toString('hex')
    res.locals.csrfToken = req.session.csrfToken
    return next()
}

function csrfProtectionMiddleware(req, res, next) {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next()
    const token = String(req.body._csrf || '')
    if (!token || token !== req.session.csrfToken) {
        return res.status(403).send('Invalid CSRF token.')
    }
    req.session.csrfToken = crypto.randomBytes(24).toString('hex')
    res.locals.csrfToken = req.session.csrfToken
    return next()
}

app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'))
app.disable('x-powered-by')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}))
app.use(passUserToView)
app.use(csrfTokenMiddleware)
app.use(csrfProtectionMiddleware)

app.use('/', pageRoutes)
app.use('/', diagnosticRoutes)
app.use('/', authRoutes)
app.use('/', carRoutes)
app.use('/', agentDashboardRoutes)

app.listen(PORT, () => {
    console.log(`App is Running on http://localhost:${PORT}`)
}) // listen on configured port

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log(`Connected to MongoDB: ${mongoose.connection.name}`)
    })
    .catch((error) => {
        console.warn(`MongoDB is not available: ${error.message}`)
    })
