const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key'; // Use an environment variable for the secret key

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ayush', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Get the default connection
const db = mongoose.connection;

// Event listener for successful connection
db.on('connected', () => {
    console.log('Connected to MongoDB');
});

// Event listener for connection errors
db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

// Define a schema for registration data
const registrationSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    clientID: { type: String, required: true, unique: true },
    clientSecret: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true, unique: true },
    rollNo: { type: String, required: true },
});

// Create a model based on the schema
const Registration = mongoose.model('Registration', registrationSchema);

// POST endpoint for obtaining Authorization Token
app.post('/test/auth', async (req, res) => {
    const { companyName, clientID, clientSecret, ownerName, ownerEmail, rollNo } = req.body;

    try {
        // Validate the input
        if (!companyName || !clientID || !clientSecret || !ownerName || !ownerEmail || !rollNo) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if the provided clientID and clientSecret match the stored data
        const registration = await Registration
