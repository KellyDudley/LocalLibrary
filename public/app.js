// LocalLibrary - JavaScript functionality

class LibraryApp {
    constructor() {
        this.books = this.loadBooks();
        this.currentSection = 'book-list';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupForm();
        this.displayBooks();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and sections
                navButtons.forEach(b => b.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));

                // Add active class to clicked button
                btn.classList.add('active');

                // Show corresponding section
                const targetSection = this.getTargetSection(btn.id);
                document.getElementById(targetSection).classList.add('active');
                this.currentSection = targetSection;
            });
        });
    }

    getTargetSection(buttonId) {
        const sectionMap = {
            'add-book-btn': 'add-book',
            'view-books-btn': 'book-list',
            'categories-btn': 'book-list' // For now, redirect to book list
        };
        return sectionMap[buttonId] || 'book-list';
    }

    setupForm() {
        const form = document.getElementById('book-form');
        const cancelBtn = document.getElementById('cancel-btn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBook();
        });

        cancelBtn.addEventListener('click', () => {
            this.showSection('book-list');
            form.reset();
        });
    }

    addBook() {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const isbn = document.getElementById('isbn').value;
        const category = document.getElementById('category').value;

        const newBook = {
            id: Date.now().toString(),
            title,
            author,
            isbn,
            category,
            dateAdded: new Date().toLocaleDateString(),
            status: 'unread'
        };

        this.books.push(newBook);
        this.saveBooks();
        this.displayBooks();
        this.showSection('book-list');
        
        // Reset form
        document.getElementById('book-form').reset();
        
        // Show success message
        this.showMessage('Book added successfully!', 'success');
    }

    displayBooks() {
        const container = document.getElementById('books-container');
        
        if (this.books.length === 0) {
            container.innerHTML = '<p class="no-books">No books added yet. Click "Add Book" to get started!</p>';
            return;
        }

        const booksHTML = this.books.map(book => `
            <div class="book-card" data-id="${book.id}">
                <h3>${book.title}</h3>
                <p class="author">by ${book.author}</p>
                <p class="category">Category: ${book.category}</p>
                <p class="date">Added: ${book.dateAdded}</p>
                ${book.isbn ? `<p class="isbn">ISBN: ${book.isbn}</p>` : ''}
                <div class="book-actions">
                    <button class="edit-btn" onclick="app.editBook('${book.id}')">Edit</button>
                    <button class="delete-btn" onclick="app.deleteBook('${book.id}')">Delete</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = booksHTML;
    }

    showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        
        document.getElementById(sectionId).classList.add('active');
        
        // Update corresponding nav button
        const buttonMap = {
            'add-book': 'add-book-btn',
            'book-list': 'view-books-btn'
        };
        
        const buttonId = buttonMap[sectionId];
        if (buttonId) {
            document.getElementById(buttonId).classList.add('active');
        }
    }

    editBook(id) {
        // TODO: Implement edit functionality
        console.log('Edit book:', id);
    }

    deleteBook(id) {
        if (confirm('Are you sure you want to delete this book?')) {
            this.books = this.books.filter(book => book.id !== id);
            this.saveBooks();
            this.displayBooks();
            this.showMessage('Book deleted successfully!', 'success');
        }
    }

    loadBooks() {
        const saved = localStorage.getItem('localLibraryBooks');
        return saved ? JSON.parse(saved) : [];
    }

    saveBooks() {
        localStorage.setItem('localLibraryBooks', JSON.stringify(this.books));
    }

    showMessage(text, type = 'info') {
        // Simple message display - can be enhanced later
        alert(text);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LibraryApp();
});