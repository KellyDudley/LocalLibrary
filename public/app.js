// LocalLibrary - JavaScript functionality

class LibraryApp {
    constructor() {
        this.books = this.loadBooks();
        this.categories = this.loadCategories();
        this.currentSection = 'book-list';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupForm();
        this.setupSearch();
        this.setupModal();
        this.setupCategories();
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
            'categories-btn': 'categories'
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
        
        // Update statistics when displaying all books
        if (!booksToShow) {
            this.updateStatistics();
        }
        
        if (books.length === 0) {
            const message = booksToShow ? 'No books found matching your search.' : 'No books added yet. Click "Add Book" to get started!';
            container.innerHTML = `<p class="no-books">${message}</p>`;
            return;
        }

        const booksHTML = books.map(book => `
            <div class="book-card" data-id="${book.id}">
                <div class="book-status ${book.status || 'unread'}">${this.getStatusLabel(book.status || 'unread')}</div>
                <h3>${book.title}</h3>
                <p class="author">by ${book.author}</p>
                <p class="category">Category: ${book.category}</p>
                <p class="date">Added: ${book.dateAdded}</p>
                ${book.isbn ? `<p class="isbn">ISBN: ${book.isbn}</p>` : ''}
                <div class="book-actions">
                    <button class="status-btn" onclick="app.toggleStatus('${book.id}')">${this.getStatusAction(book.status || 'unread')}</button>
                    <button class="edit-btn" onclick="app.editBook('${book.id}')">Edit</button>
                    <button class="delete-btn" onclick="app.deleteBook('${book.id}')">Delete</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = booksHTML;
    }

    updateStatistics() {
        const totalBooks = this.books.length;
        const readBooks = this.books.filter(book => book.status === 'read').length;
        const readingBooks = this.books.filter(book => book.status === 'reading').length;
        const unreadBooks = this.books.filter(book => !book.status || book.status === 'unread').length;

        document.getElementById('total-books').textContent = totalBooks;
        document.getElementById('books-read').textContent = readBooks;
        document.getElementById('books-reading').textContent = readingBooks;
        document.getElementById('books-unread').textContent = unreadBooks;
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

    getStatusLabel(status) {
        const labels = {
            'unread': '📚 Unread',
            'reading': '📖 Reading',
            'read': '✅ Read'
        };
        return labels[status] || labels['unread'];
    }

    getStatusAction(status) {
        const actions = {
            'unread': 'Start Reading',
            'reading': 'Mark as Read',
            'read': 'Mark Unread'
        };
        return actions[status] || actions['unread'];
    }

    toggleStatus(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        const statusFlow = {
            'unread': 'reading',
            'reading': 'read',
            'read': 'unread'
        };

        book.status = statusFlow[book.status || 'unread'];
        this.saveBooks();
        this.displayBooks();
        
        const statusMsg = {
            'reading': 'Started reading',
            'read': 'Marked as read',
            'unread': 'Marked as unread'
        };
        
        this.showMessage(`${statusMsg[book.status]} "${book.title}"`, 'success');
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

    setupCategories() {
        // Initialize default categories if none exist
        if (this.categories.length === 0) {
            this.categories = [
                { id: '1', name: 'Fiction', color: '#667eea' },
                { id: '2', name: 'Non-Fiction', color: '#38a169' },
                { id: '3', name: 'Science', color: '#3182ce' },
                { id: '4', name: 'History', color: '#d69e2e' },
                { id: '5', name: 'Biography', color: '#805ad5' },
                { id: '6', name: 'Other', color: '#718096' }
            ];
            this.saveCategories();
        }

        // Setup category form
        const addCategoryBtn = document.getElementById('add-category-btn');
        const categoryForm = document.getElementById('new-category-form');
        const cancelCategoryBtn = document.getElementById('cancel-category-btn');
        const addCategoryFormContainer = document.getElementById('add-category-form');

        addCategoryBtn.addEventListener('click', () => {
            addCategoryFormContainer.style.display = 'block';
            document.getElementById('category-name').focus();
        });

        cancelCategoryBtn.addEventListener('click', () => {
            addCategoryFormContainer.style.display = 'none';
            categoryForm.reset();
        });

        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCategory();
        });

        this.displayCategories();
    }

    addCategory() {
        const name = document.getElementById('category-name').value;
        const color = document.getElementById('category-color').value;

        if (!name.trim()) return;

        const newCategory = {
            id: Date.now().toString(),
            name: name.trim(),
            color: color
        };

        this.categories.push(newCategory);
        this.saveCategories();
        this.displayCategories();
        
        // Hide form and reset
        document.getElementById('add-category-form').style.display = 'none';
        document.getElementById('new-category-form').reset();
        
        this.showMessage(`Category "${name}" added successfully!`, 'success');
    }

    displayCategories() {
        const container = document.getElementById('categories-list');
        const countElement = document.getElementById('category-count');
        
        countElement.textContent = this.categories.length;

        if (this.categories.length === 0) {
            container.innerHTML = '<p class="no-categories">No categories found.</p>';
            return;
        }

        const categoriesHTML = this.categories.map(category => {
            const bookCount = this.books.filter(book => book.category === category.name).length;
            return `
                <div class="category-card" style="border-left: 4px solid ${category.color}">
                    <div class="category-info">
                        <h3>${category.name}</h3>
                        <p>${bookCount} book${bookCount !== 1 ? 's' : ''}</p>
                    </div>
                    <div class="category-actions">
                        <button class="edit-btn" onclick="app.editCategory('${category.id}')">Edit</button>
                        <button class="delete-btn" onclick="app.deleteCategory('${category.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = categoriesHTML;
    }

    editCategory(id) {
        // TODO: Implement category editing
        console.log('Edit category:', id);
    }

    deleteCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;

        const bookCount = this.books.filter(book => book.category === category.name).length;
        
        if (bookCount > 0) {
            if (!confirm(`This category has ${bookCount} book${bookCount !== 1 ? 's' : ''}. Deleting it will change those books to "Other" category. Continue?`)) {
                return;
            }
            // Update books with this category to "Other"
            this.books.forEach(book => {
                if (book.category === category.name) {
                    book.category = 'Other';
                }
            });
            this.saveBooks();
        }

        this.categories = this.categories.filter(c => c.id !== id);
        this.saveCategories();
        this.displayCategories();
        this.displayBooks(); // Refresh books display
        
        this.showMessage(`Category "${category.name}" deleted successfully!`, 'success');
    }

    loadCategories() {
        const saved = localStorage.getItem('localLibraryCategories');
        return saved ? JSON.parse(saved) : [];
    }

    saveCategories() {
        localStorage.setItem('localLibraryCategories', JSON.stringify(this.categories));
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