import { validationResult, body, param, query } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Auth validation rules
export const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 50 })
        .withMessage('Name cannot exceed 50 characters'),
    body('role')
        .isIn(['client', 'freelancer'])
        .withMessage('Role must be either client or freelancer')
];

export const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Job validation rules
export const createJobValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Job title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Job description is required')
        .isLength({ max: 5000 })
        .withMessage('Description cannot exceed 5000 characters'),
    body('category')
        .isIn([
            'Web Development',
            'Mobile Development',
            'Design',
            'Writing',
            'Marketing',
            'Data Science',
            'Video & Animation',
            'Music & Audio'
        ])
        .withMessage('Invalid category'),
    body('budget')
        .isFloat({ min: 1 })
        .withMessage('Budget must be at least $1'),
    body('duration')
        .trim()
        .notEmpty()
        .withMessage('Duration is required'),
    body('skills')
        .isArray({ min: 1 })
        .withMessage('At least one skill is required')
];

// Proposal validation rules
export const createProposalValidation = [
    body('coverLetter')
        .trim()
        .notEmpty()
        .withMessage('Cover letter is required')
        .isLength({ max: 2000 })
        .withMessage('Cover letter cannot exceed 2000 characters'),
    body('proposedBudget')
        .isFloat({ min: 1 })
        .withMessage('Proposed budget must be at least $1'),
    body('proposedDuration')
        .trim()
        .notEmpty()
        .withMessage('Proposed duration is required')
];

// Payment validation
export const createPaymentValidation = [
    body('jobId')
        .isMongoId()
        .withMessage('Valid job ID is required'),
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be at least $0.01')
];

// Common param validations
export const mongoIdParam = (paramName = 'id') => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`)
];

// Pagination validation
export const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
