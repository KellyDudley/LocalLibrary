const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'locallibrary.db');

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
                this.createTables();
            }
        });
    }

    createTables() {
        const createBooksTable = `
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT,
                category TEXT NOT NULL,
                date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'unread',
                notes TEXT
            )
        `;

        const createCategoriesTable = `
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                color TEXT DEFAULT '#667eea'
            )
        `;

        this.db.run(createBooksTable, (err) => {
            if (err) {
                console.error('Error creating books table:', err.message);
            } else {
                console.log('Books table ready');
            }
        });

        this.db.run(createCategoriesTable, (err) => {
            if (err) {
                console.error('Error creating categories table:', err.message);
            } else {
                console.log('Categories table ready');
                this.insertDefaultCategories();
            }
        });
    }

    insertDefaultCategories() {
        const defaultCategories = [
            'Fiction',
            'Non-Fiction',
            'Science',
            'History',
            'Biography',
            'Other'
        ];

        const insertCategory = `INSERT OR IGNORE INTO categories (name) VALUES (?)`;
        
        defaultCategories.forEach(category => {
            this.db.run(insertCategory, [category], (err) => {
                if (err && err.message !== 'UNIQUE constraint failed: categories.name') {
                    console.error('Error inserting category:', err.message);
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = Database;