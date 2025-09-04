// ===========================================
// FILE 3: controllers/todoController.js
// ===========================================

const { v4: uuidv4 } = require('uuid');
const { validateTodo, validateUpdateTodo, validateId } = require('../validation/todoValidation');

// In-memory storage (nanti bisa diganti dengan database)
let todos = [
    {
        id: uuidv4(),
        title: 'Sample Todo - Welcome!',
        description: 'This is a sample todo item to get you started. You can edit or delete this.',
        completed: false,
        priority: 'medium',
        category: 'general',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        title: 'Learn Express.js',
        description: 'Complete the Express.js tutorial and build a REST API',
        completed: true,
        priority: 'high',
        category: 'learning',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString()
    }
];

// @desc    Get all todos with filtering and searching
// @route   GET /api/todos
// @access  Public
const getTodos = (req, res) => {
    try {
        console.log('📋 Getting todos with filters:', req.query);

        const { completed, priority, category, search, limit = 100, page = 1 } = req.query;
        let filteredTodos = [...todos];

        // Filter by completion status
        if (completed !== undefined) {
            const isCompleted = completed === 'true';
            filteredTodos = filteredTodos.filter(todo => todo.completed === isCompleted);
            console.log(`🔍 Filtered by completed: ${isCompleted}, count: ${filteredTodos.length}`);
        }

        // Filter by priority
        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            filteredTodos = filteredTodos.filter(todo => todo.priority === priority);
            console.log(`🔍 Filtered by priority: ${priority}, count: ${filteredTodos.length}`);
        }

        // Filter by category
        if (category) {
            filteredTodos = filteredTodos.filter(todo =>
                todo.category.toLowerCase() === category.toLowerCase()
            );
            console.log(`🔍 Filtered by category: ${category}, count: ${filteredTodos.length}`);
        }

        // Search in title and description
        if (search) {
            const searchTerm = search.toLowerCase().trim();
            filteredTodos = filteredTodos.filter(todo =>
                todo.title.toLowerCase().includes(searchTerm) ||
                todo.description.toLowerCase().includes(searchTerm)
            );
            console.log(`🔍 Filtered by search: ${search}, count: ${filteredTodos.length}`);
        }

        // Sort by createdAt (newest first)
        filteredTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedTodos = filteredTodos.slice(startIndex, endIndex);

        console.log(`✅ Returning ${paginatedTodos.length} todos (page ${pageNum})`);

        res.json({
            success: true,
            count: paginatedTodos.length,
            totalCount: filteredTodos.length,
            page: pageNum,
            totalPages: Math.ceil(filteredTodos.length / limitNum),
            data: paginatedTodos
        });
    } catch (error) {
        console.error('❌ Error in getTodos:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error while fetching todos',
            error: error.message
        });
    }
};

// @desc    Get single todo by ID
// @route   GET /api/todos/:id
// @access  Public
const getTodoById = (req, res) => {
    try {
        const { error } = validateId(req.params.id);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.log('🔍 Getting todo by ID:', req.params.id);

        const todo = todos.find(t => t.id === req.params.id);

        if (!todo) {
            console.log('❌ Todo not found:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        console.log('✅ Todo found:', todo.title);

        res.json({
            success: true,
            data: todo
        });
    } catch (error) {
        console.error('❌ Error in getTodoById:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error while fetching todo',
            error: error.message
        });
    }
};

// @desc    Create new todo
// @route   POST /api/todos
// @access  Public
const createTodo = (req, res) => {
    try {
        console.log('➕ Creating new todo:', req.body);

        const { error, value } = validateTodo(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                error: error.details[0].message,
                details: error.details
            });
        }

        const newTodo = {
            id: uuidv4(),
            title: value.title,
            description: value.description || '',
            completed: false,
            priority: value.priority || 'medium',
            category: value.category || 'general',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        todos.push(newTodo);
        console.log('✅ Todo created successfully:', newTodo.id);

        res.status(201).json({
            success: true,
            message: 'Todo created successfully',
            data: newTodo
        });
    } catch (error) {
        console.error('❌ Error in createTodo:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error while creating todo',
            error: error.message
        });
    }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Public
const updateTodo = (req, res) => {
    try {
        const { error: idError } = validateId(req.params.id);
        if (idError) {
            return res.status(400).json({
                success: false,
                message: idError.message
            });
        }

        const { error, value } = validateUpdateTodo(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                error: error.details[0].message,
                details: error.details
            });
        }

        console.log('✏️ Updating todo:', req.params.id, value);

        const todoIndex = todos.findIndex(t => t.id === req.params.id);

        if (todoIndex === -1) {
            console.log('❌ Todo not found for update:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        // Update todo fields
        const updatedTodo = {
            ...todos[todoIndex],
            ...value,
            id: todos[todoIndex].id, // Prevent ID from being changed
            createdAt: todos[todoIndex].createdAt, // Preserve creation date
            updatedAt: new Date().toISOString()
        };

        todos[todoIndex] = updatedTodo;
        console.log('✅ Todo updated successfully:', updatedTodo.title);

        res.json({
            success: true,
            message: 'Todo updated successfully',
            data: updatedTodo
        });
    } catch (error) {
        console.error('❌ Error in updateTodo:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error while updating todo',
            error: error.message
        });
    }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Public
const deleteTodo = (req, res) => {
    try {
        const { error } = validateId(req.params.id);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.log('🗑️ Deleting todo:', req.params.id);

        const todoIndex = todos.findIndex(t => t.id === req.params.id);

        if (todoIndex === -1) {
            console.log('❌ Todo not found for deletion:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        const deletedTodo = todos.splice(todoIndex, 1)[0];
        console.log('✅ Todo deleted successfully:', deletedTodo.title);

        res.json({
            success: true,
            message: 'Todo deleted successfully',
            data: deletedTodo
        });
    } catch (error) {
        console.error('❌ Error in deleteTodo:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error while deleting todo',
            error: error.message
        });
    }
};

// @desc    Toggle todo completion status
// @route   PATCH /api/todos/:id/toggle
// @access  Public
const toggleTodoStatus = (req, res) => {
    try {
        const { error } = validateId(req.params.id);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.log('🔄 Toggling todo status:', req.params.id);

        const todoIndex = todos.findIndex(t => t.id === req.params.id);

        if (todoIndex === -1) {
            console.log('❌ Todo not found for toggle:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        const oldStatus = todos[todoIndex].completed;
        todos[todoIndex].completed = !oldStatus;
        todos[todoIndex].updatedAt = new Date().toISOString();

        const newStatus = todos[todoIndex].completed;
        console.log(`✅ Todo status toggled: ${oldStatus} → ${newStatus}`);

        res.json({
            success: true,
            message: `Todo marked as ${newStatus ? 'completed' : 'pending'}`,
            data: todos[todoIndex]
        });
    } catch (error) {
        console.error('❌ Error in toggleTodoStatus:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error while toggling todo status',
            error: error.message
        });
    }
};

// @desc    Get todos statistics
// @route   GET /api/todos/stats
// @access  Public
const getTodoStats = (req, res) => {
    try {
        const totalTodos = todos.length;
        const completedTodos = todos.filter(t => t.completed).length;
        const pendingTodos = totalTodos - completedTodos;

        const priorityStats = {
            high: todos.filter(t => t.priority === 'high').length,
            medium: todos.filter(t => t.priority === 'medium').length,
            low: todos.filter(t => t.priority === 'low').length
        };

        const categoryStats = {};
        todos.forEach(todo => {
            categoryStats[todo.category] = (categoryStats[todo.category] || 0) + 1;
        });

        const stats = {
            total: totalTodos,
            completed: completedTodos,
            pending: pendingTodos,
            completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
            priorityBreakdown: priorityStats,
            categoryBreakdown: categoryStats
        };

        console.log('📊 Generated stats:', stats);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Error in getTodoStats:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error while fetching statistics',
            error: error.message
        });
    }
};

module.exports = {
    getTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoStatus,
    getTodoStats
};
