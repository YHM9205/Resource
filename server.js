require('dotenv').config()
const express = require("express") //importing express package
const session = require('express-session')
const connectDB = require('./config/db')
const path = require('path')
const passUserToView = require('./middleware/pass-user-to-view')
const pageRoutes = require('./routes/pageRoutes')
const diagnosticRoutes = require('./routes/diagnosticRoutes')
const authRoutes = require('./routes/authRoutes')
const carRoutes = require('./routes/carRoutes')
const agentDashboardRoutes = require('./routes/agentDashboardRoutes')
const app = express() // creates a express application
const PORT = Number(process.env.PORT) || 3000
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-session-secret'

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

connectDB().catch((error) => {
    console.warn(`MongoDB is not available: ${error.message}`)
})








app.use('/', pageRoutes)
app.use('/', diagnosticRoutes)
app.use('/', authRoutes)
app.use('/', carRoutes)
app.use('/', agentDashboardRoutes)

app.listen(PORT,()=>{
    console.log(`App is Running on http://localhost:${PORT}`)
}) // listen on configured port
