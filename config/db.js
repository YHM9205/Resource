const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/autocode-db'
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
}

module.exports = connectDB;
