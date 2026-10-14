const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        console.error("FATAL CONFIGURATION ERROR: Neither MONGODB_URI nor MONGO_URI is defined.");
        console.error("Please configure MONGODB_URI in your environment variables or Render dashboard.");
        process.exit(1);
    }

    try {
        const dbName = process.env.DB_NAME || process.env.MONGODB_DB_NAME;
        const options = dbName ? { dbName } : {};

        const conn = await mongoose.connect(mongoUri, options);
        console.log(`MongoDB Connected Successfully: ${conn.connection.host} (Database: ${conn.connection.name})`);
        return conn;
    }
    catch(err){
        console.error("Database Connection Error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;