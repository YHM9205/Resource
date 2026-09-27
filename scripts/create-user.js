require('dotenv').config()

const bcrypt = require('bcryptjs')
const connectDB = require('../config/db')
const User = require('../models/User')

const username = String(process.env.ADMIN_USERNAME || '').trim()
const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const password = String(process.env.ADMIN_PASSWORD || '')

if (!username || !email || password.length < 8) {
    console.error('Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running this command.')
    process.exitCode = 1
} else {
    createUser().catch((error) => {
        console.error(`User creation failed: ${error.message}`)
        process.exitCode = 1
    })
}

const createUser = async () => {
    await connectDB()
    const passwordHash = await bcrypt.hash(password, 12)
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })

    if (existingUser) {
        existingUser.username = username
        existingUser.email = email
        existingUser.password = passwordHash
        await existingUser.save()
        console.log(`Updated user: ${username}`)
    } else {
        await User.create({ username, email, password: passwordHash })
        console.log(`Created user: ${username}`)
    }

    process.exit(0)
}