const express = require('express');
const router = express.Router();

class BookRoutes {
    constructor(db) {
        this.db = db.db; // Access the SQLite database instance
        this.setupRoutes();
    }

    setupRoutes() {
        // Get all books
        router.get('/', (req, res) => {
            const query = 'SELECT * FROM books ORDER BY date_added DESC';
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ books: rows });
            });
        });

        // Get a single book
        router.get('/:id', (req, res) => {
            const query = 'SELECT * FROM books WHERE id = ?';
            this.db.get(query, [req.params.id], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (!row) {
                    res.status(404).json({ error: 'Book not found' });
                    return;
                }
                res.json({ book: row });
            });
        });

        // Add a new book
        router.post('/', (req, res) => {
            const { title, author, isbn, category, notes } = req.body;
            
            if (!title || !author || !category) {
                res.status(400).json({ error: 'Title, author, and category are required' });
                return;
            }

            const query = `
                INSERT INTO books (title, author, isbn, category, notes) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [title, author, isbn, category, notes || ''], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json({
                    id: this.lastID,
                    message: 'Book added successfully'
                });
            });
        });

        // Update a book
        router.put('/:id', (req, res) => {
            const { title, author, isbn, category, status, notes } = req.body;
            
            const query = `
                UPDATE books 
                SET title = ?, author = ?, isbn = ?, category = ?, status = ?, notes = ?
                WHERE id = ?
            `;
            
            this.db.run(query, [title, author, isbn, category, status, notes, req.params.id], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: 'Book not found' });
                    return;
                }
                res.json({ message: 'Book updated successfully' });
            });
        });

        // Delete a book
        router.delete('/:id', (req, res) => {
            const query = 'DELETE FROM books WHERE id = ?';
            
            this.db.run(query, [req.params.id], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: 'Book not found' });
                    return;
                }
                res.json({ message: 'Book deleted successfully' });
            });
        });

        // Search books
        router.get('/search/:query', (req, res) => {
            const searchQuery = `%${req.params.query}%`;
            const query = `
                SELECT * FROM books 
                WHERE title LIKE ? OR author LIKE ? OR category LIKE ? OR isbn LIKE ?
                ORDER BY date_added DESC
            `;
            
            this.db.all(query, [searchQuery, searchQuery, searchQuery, searchQuery], (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ books: rows });
            });
        });
    }

    getRouter() {
        return router;
    }
}

module.exports = BookRoutes;