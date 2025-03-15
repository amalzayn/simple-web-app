// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Main route
app.get('/api/info', (req, res) => {
  res.json({
    message: 'Application successfully deployed to GKE!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    kubernetes: {
      pod: process.env.HOSTNAME || 'unknown',
      namespace: process.env.NAMESPACE || 'unknown'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});