const mongoose = require('mongoose')

const buildChecks = () => {
    const databaseReady = mongoose.connection.readyState === 1
    return [
        {
            name: 'Web server',
            status: 'Healthy',
            priority: 'Good',
            detail: 'Express is serving the application.'
        },
        {
            name: 'Database',
            status: databaseReady ? 'Connected' : 'Needs attention',
            priority: databaseReady ? 'Good' : 'Critical',
            detail: databaseReady ? 'MongoDB is connected.' : 'MongoDB is not connected; saved accounts and vehicles will not persist.'
        },
        {
            name: 'Protected workspace',
            status: 'Configured',
            priority: 'Good',
            detail: 'Garage, diagnostics, parts, and settings require an authenticated user.'
        },
        {
            name: 'Agent safety',
            status: 'Approval required',
            priority: 'Important',
            detail: 'The Agent can inspect and suggest only. It does not execute terminal commands or change files automatically.'
        }
    ]
}

const buildSuggestions = () => {
    const databaseReady = mongoose.connection.readyState === 1
    return [
        {
            title: 'Start or configure MongoDB',
            priority: databaseReady ? 'Low impact' : 'Critical',
            impact: databaseReady ? 'No action needed now.' : 'Required before registration, login, and Garage CRUD can save data.',
            action: 'Check the database connection and show the exact error; do not change files automatically.'
        },
        {
            title: 'Review dashboard routes',
            priority: 'Recommended',
            impact: 'Prevents broken links and keeps protected pages consistent.',
            action: 'Run a read-only route smoke test and show any non-200 result.'
        },
        {
            title: 'Add vehicle images',
            priority: 'Low impact',
            impact: 'Improves presentation but does not affect diagnostics or data safety.',
            action: 'Use local SVG illustrations until approved vehicle image assets are provided.'
        }
    ]
}

const showAgentDashboard = (req, res) => {
    res.render('agent', {
        checks: buildChecks(),
        suggestions: buildSuggestions(),
        scannedAt: new Date().toLocaleString()
    })
}

const agentHealth = (req, res) => {
    res.json({
        checks: buildChecks(),
        suggestions: buildSuggestions(),
        scannedAt: new Date().toISOString()
    })
}

module.exports = { showAgentDashboard, agentHealth }
