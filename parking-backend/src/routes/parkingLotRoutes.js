const express = require('express');
const router = express.Router();
const { addParkingLot, getParkingLots } = require('../controllers/parkingLotController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Parking
 *   description: Parking lot management
 */

/**
 * @swagger
 * /parking:
 *   post:
 *     summary: Add a new parking lot (Admin only)
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - total_spaces
 *               - location
 *               - feePerHour
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique code for the parking lot.
 *                 example: P1
 *               name:
 *                 type: string
 *                 description: Name of the parking lot.
 *                 example: Main Parking Area
 *               total_spaces:
 *                 type: number
 *                 description: Total number of parking spaces.
 *                 example: 100
 *               available_spaces:
 *                 type: number
 *                 description: Number of available parking spaces (set automatically by backend).
 *                 example: 100
 *               location:
 *                 type: string
 *                 description: Location of the parking lot.
 *                 example: Downtown
 *               feePerHour:
 *                 type: number
 *                 format: float
 *                 description: Hourly fee for parking.
 *                 example: 5.50
 *     responses:
 *       201:
 *         description: Parking lot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingLot'
 *       400:
 *         description: Bad request (e.g., missing fields, duplicate code)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user is not an admin)
 *       500:
 *         description: Server error
 */
router.post('/', authorizeRoles('admin'), addParkingLot);

/**
 * @swagger
 * /parking:
 *   get:
 *     summary: Get all parking lots (Admin and Client)
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of parking lots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParkingLot'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */
router.get('/', authorizeRoles('admin', 'client'), getParkingLots);

module.exports = router;