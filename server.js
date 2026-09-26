require('dotenv').config()
const express = require("express") //importing express package
const connectDB = require('./config/db')
const path = require('path')
const pageRoutes = require('./routes/pageRoutes')
const diagnosticRoutes = require('./routes/diagnosticRoutes')
const app = express() // creates a express application
const PORT = Number(process.env.PORT) || 3000
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))

connectDB().catch((error) => {
    console.warn(`MongoDB is not available: ${error.message}`)
})








app.use('/', pageRoutes)
app.use('/', diagnosticRoutes)

app.listen(PORT,()=>{
    console.log(`App is Running on http://localhost:${PORT}`)
}) // listen on configured port
