// ===========================================
// FILE 4: routes/todos.js
// ===========================================

const express = require('express');
const router = express.Router();
const {
    getTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoStatus,
    getTodoStats
} = require('../controllers/todoController');

// Request logging middleware untuk debugging
router.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', req.body);
    }
    if (req.query && Object.keys(req.query).length > 0) {
        console.log('🔍 Query:', req.query);
    }
    next();
});

// Statistics endpoint (harus sebelum /:id route)
router.get('/stats', getTodoStats);

// @route   GET /api/todos
// @desc    Get all todos with optional filtering and search
// @access  Public
// Query params: completed, priority, category, search, limit, page
router.get('/', getTodos);

// @route   GET /api/todos/:id
// @desc    Get single todo by ID
// @access  Public
router.get('/:id', getTodoById);

// @route   POST /api/todos
// @desc    Create new todo
// @access  Public
// Body: { title, description?, priority?, category? }
router.post('/', createTodo);

// @route   PUT /api/todos/:id
// @desc    Update todo (full update)
// @access  Public
// Body: { title?, description?, completed?, priority?, category? }
router.put('/:id', updateTodo);

// @route   PATCH /api/todos/:id/toggle
// @desc    Toggle todo completion status
// @access  Public
router.patch('/:id/toggle', toggleTodoStatus);

// @route   DELETE /api/todos/:id
// @desc    Delete todo
// @access  Public
router.delete('/:id', deleteTodo);

// Health check endpoint
router.get('/health/check', (req, res) => {
    res.json({
        success: true,
        message: 'Todo routes are healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;