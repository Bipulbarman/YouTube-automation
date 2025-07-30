// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Render provides the PORT environment variable
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL, // The URL of your deployed frontend
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: "Hello from the backend! 👋" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
