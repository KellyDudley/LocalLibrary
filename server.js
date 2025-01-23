const express = require('express');
const path = require('path');
const Database = require('./database');
const BookRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize routes after database is ready
setTimeout(() => {
    const bookRoutes = new BookRoutes(db);
    app.use('/api/books', bookRoutes.getRouter());
    console.log('API routes initialized');
}, 1000); // Give database time to initialize

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'running',
        message: 'LocalLibrary API is operational',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`LocalLibrary server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close();
    process.exit(0);
});