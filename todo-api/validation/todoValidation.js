// ===========================================
// FILE 2: validation/todoValidation.js
// ===========================================

const Joi = require('joi');

// Schema untuk membuat todo baru
const todoSchema = Joi.object({
    title: Joi.string()
        .min(1)
        .max(200)
        .required()
        .trim()
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 1 character long',
            'string.max': 'Title must not exceed 200 characters',
            'any.required': 'Title is required'
        }),

    description: Joi.string()
        .max(1000)
        .allow('')
        .optional()
        .trim()
        .messages({
            'string.max': 'Description must not exceed 1000 characters'
        }),

    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .optional()
        .default('medium')
        .messages({
            'any.only': 'Priority must be one of: low, medium, high'
        }),

    category: Joi.string()
        .max(50)
        .optional()
        .default('general')
        .trim()
        .messages({
            'string.max': 'Category must not exceed 50 characters'
        })
});

// Schema untuk update todo
const updateTodoSchema = Joi.object({
    title: Joi.string()
        .min(1)
        .max(200)
        .optional()
        .trim()
        .messages({
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least 1 character long',
            'string.max': 'Title must not exceed 200 characters'
        }),

    description: Joi.string()
        .max(1000)
        .allow('')
        .optional()
        .trim()
        .messages({
            'string.max': 'Description must not exceed 1000 characters'
        }),

    completed: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'Completed must be a boolean value'
        }),

    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .optional()
        .messages({
            'any.only': 'Priority must be one of: low, medium, high'
        }),

    category: Joi.string()
        .max(50)
        .optional()
        .trim()
        .messages({
            'string.max': 'Category must not exceed 50 characters'
        })
});

// Fungsi validasi untuk create todo
const validateTodo = (todo) => {
    return todoSchema.validate(todo, { abortEarly: false });
};

// Fungsi validasi untuk update todo
const validateUpdateTodo = (todo) => {
    return updateTodoSchema.validate(todo, { abortEarly: false });
};

// Validasi ID parameter
const validateId = (id) => {
    if (!id || id.trim() === '') {
        return { error: { message: 'ID is required' } };
    }
    return { value: id };
};

module.exports = {
    validateTodo,
    validateUpdateTodo,
    validateId
};