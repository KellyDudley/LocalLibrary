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
        this.setupSearch();
        this.setupModal();
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

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        const performSearch = () => {
            const query = searchInput.value.toLowerCase().trim();
            this.filterBooks(query);
        };

        searchBtn.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            } else {
                // Real-time search as user types
                const query = e.target.value.toLowerCase().trim();
                this.filterBooks(query);
            }
        });

        // Clear search when input is empty
        searchInput.addEventListener('input', (e) => {
            if (e.target.value === '') {
                this.displayBooks();
            }
        });
    }

    setupModal() {
        const modal = document.getElementById('edit-modal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('edit-cancel-btn');
        const editForm = document.getElementById('edit-book-form');

        // Close modal events
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Handle edit form submission
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateBook();
        });
    }

    openEditModal(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        // Populate form fields
        document.getElementById('edit-title').value = book.title;
        document.getElementById('edit-author').value = book.author;
        document.getElementById('edit-isbn').value = book.isbn || '';
        document.getElementById('edit-category').value = book.category;
        document.getElementById('edit-status').value = book.status || 'unread';

        // Store current book ID for updating
        this.currentEditingId = bookId;

        // Show modal
        document.getElementById('edit-modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('edit-modal').style.display = 'none';
        this.currentEditingId = null;
    }

    updateBook() {
        if (!this.currentEditingId) return;

        const title = document.getElementById('edit-title').value;
        const author = document.getElementById('edit-author').value;
        const isbn = document.getElementById('edit-isbn').value;
        const category = document.getElementById('edit-category').value;
        const status = document.getElementById('edit-status').value;

        const bookIndex = this.books.findIndex(b => b.id === this.currentEditingId);
        if (bookIndex === -1) return;

        // Update book
        this.books[bookIndex] = {
            ...this.books[bookIndex],
            title,
            author,
            isbn,
            category,
            status
        };

        this.saveBooks();
        this.displayBooks();
        this.closeModal();
        this.showMessage('Book updated successfully!', 'success');
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

    displayBooks(booksToShow = null) {
        const container = document.getElementById('books-container');
        const books = booksToShow || this.books;
        
        if (books.length === 0) {
            const message = booksToShow ? 'No books found matching your search.' : 'No books added yet. Click "Add Book" to get started!';
            container.innerHTML = `<p class="no-books">${message}</p>`;
            return;
        }

        const booksHTML = books.map(book => `
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

    filterBooks(query) {
        if (!query) {
            this.displayBooks();
            return;
        }

        const filteredBooks = this.books.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.category.toLowerCase().includes(query) ||
            (book.isbn && book.isbn.toLowerCase().includes(query))
        );

        this.displayBooks(filteredBooks);
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
        this.openEditModal(id);
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