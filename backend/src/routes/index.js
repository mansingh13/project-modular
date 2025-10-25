const express = require('express');
const moduleRoutes = require('./moduleRoutes');

const router = express.Router();

// API routes
router.use('/modules', moduleRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Modular Backend API'
  });
});

module.exports = router;