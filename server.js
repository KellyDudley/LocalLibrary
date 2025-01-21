const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints for future expansion
app.get('/api/books', (req, res) => {
    // For now, return empty array since we're using localStorage
    res.json({ message: 'API endpoint ready for future implementation' });
});

app.listen(PORT, () => {
    console.log(`LocalLibrary server running on http://localhost:${PORT}`);
});