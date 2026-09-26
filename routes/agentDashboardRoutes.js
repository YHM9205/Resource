const express = require('express')
const { requireUser } = require('../controllers/authController')
const { showAgentDashboard, agentHealth } = require('../controllers/agentDashboardController')

const router = express.Router()
router.get('/agent', requireUser, showAgentDashboard)
router.get('/api/agent/health', requireUser, agentHealth)

module.exports = router;
