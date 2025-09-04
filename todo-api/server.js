const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); // Tambah ini
require('dotenv').config();

const todoRoutes = require('./routes/todos');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (Frontend)
app.use(express.static('Todo_frontend'));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Todo List API',
        version: '1.0.0',
        status: 'Server is running',
        frontend: 'Access frontend at /app',
        endpoints: {
            'GET /api/todos': 'Get all todos',
            'GET /api/todos/:id': 'Get todo by ID',
            'POST /api/todos': 'Create new todo',
            'PUT /api/todos/:id': 'Update todo',
            'DELETE /api/todos/:id': 'Delete todo',
            'PATCH /api/todos/:id/toggle': 'Toggle todo status'
        }
    });
});

// Frontend route
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'Todo_frontend', 'index.html'));
});

app.use('/api/todos', todoRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log('🚀 Server is running on port', PORT);
    console.log('📚 API Documentation: http://localhost:' + PORT);
    console.log('🔗 API Endpoints: http://localhost:' + PORT + '/api/todos');
    console.log('🎨 Frontend App: http://localhost:' + PORT + '/app'); // Tambah ini
    console.log('🌟 Environment:', process.env.NODE_ENV);
});

module.exports = app;