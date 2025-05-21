const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { register, login, getProfile, updateProfile } = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - password
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: User's first name.
 *                 example: John
 *               lastname:
 *                 type: string
 *                 description: User's last name.
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique).
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (minimum 6 characters).
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [client, admin]
 *                 default: client
 *                 description: User's role.
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The auto-generated ID of the user.
 *                 firstname:
 *                   type: string
 *                   description: User's first name.
 *                 lastname:
 *                   type: string
 *                   description: User's last name.
 *                 email:
 *                   type: string
 *                   description: User's email address.
 *                 role:
 *                   type: string
 *                   description: User's role.
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time the user was created.
 *       400:
 *         description: Bad request (e.g., user already exists, missing fields, invalid email format)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User already exists
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user and get JWT token
 *     description: |
 *       Use this endpoint to get a JWT token for authentication.
 *       After getting the token:
 *       1. Click the "Authorize" button at the top of the page
 *       2. Enter your token (without "Bearer " prefix)
 *       3. Click "Authorize"
 *       4. Now you can use protected endpoints
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful - Returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication. Use this token in the "Authorize" button.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request (e.g., missing fields, invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */
router.post('/login', login);

// Protected routes (requires authentication)
router.use(authenticate);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: User's first name.
 *               lastname:
 *                 type: string
 *                 description: User's last name.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique).
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's new password (minimum 6 characters).
 *             example:
 *               firstname: John
 *               lastname: Doe
 *               email: john.doe.updated@example.com
 *               password: newpassword123
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (e.g., email already in use, password too short, no updates provided)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/profile', updateProfile);

module.exports = router;

