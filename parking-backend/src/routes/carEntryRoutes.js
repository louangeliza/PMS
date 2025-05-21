const express = require('express');
const router = express.Router();
const { addCarEntry, generateExitBill, getOutgoingCarEntries, getIncomingCarEntries, getChargesReport, getAllCarEntriesByDateRange, getClientCarEntries } = require('../controllers/carEntr'); // Import controller functions
const { authenticate, authorizeRoles } = require('../middleware/auth'); // Import authenticate and authorizeRoles

/**
 * @swagger
 * tags:
 *   name: Car Entries
 *   description: Car entry and exit management, and related reports
 */

// Admin-only routes (except for the POST / route which is also for clients)
// Apply authenticate and authorize middleware to specific routes where needed,
// or use router.use with role checks within the controller for more granular control.

// Let's refine the routes to be more explicit about access control.

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /entries:
 *   post:
 *     summary: Register a new car entry (Generate Entry Ticket) (Admin and Client)
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plateNo
 *               - parkingCode
 *               - entryTime
 *             properties:
 *               plateNo:
 *                 type: string
 *                 description: The license plate number of the car.
 *                 example: ABC-123
 *               parkingCode:
 *                 type: string
 *                 description: The code of the parking lot.
 *                 example: P1
 *               entryTime:
 *                 type: string
 *                 format: date-time
 *                 description: The entry time of the car.
 *                 example: 2023-10-27T10:00:00Z
 *     responses:
 *       201:
 *         description: Car entry registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarEntry' # Assuming you have a schema definition for CarEntry
 *       400:
 *         description: Bad request (e.g., missing fields, parking lot full, car already parked)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user is not an admin or client)
 *       404:
 *         description: Parking lot not found
 *       500:
 *         description: Server error
 */
// Route to add a new car entry (Generate Entry Ticket) - Accessible by Admin and Client
router.post('/', authorizeRoles('admin', 'client'), addCarEntry);

/**
 * @swagger
 * /entries/{id}/exit:
 *   patch:
 *     summary: Generate exit bill and update car entry/parking lot (Admin only)
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the car entry.
 *     responses:
 *       200:
 *         description: Exit bill generated and car entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarEntry'
 *       400:
 *         description: Bad request (e.g., car already exited, invalid entry time)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user is not an admin)
 *       404:
 *         description: Car entry not found
 *       500:
 *         description: Server error
 */
// Admin-only route to generate an exit bill and update car entry/parking lot
router.patch('/:id/exit', authorizeRoles('admin'), generateExitBill);

/**
 * @swagger
 * /entries/outgoing:
 *   get:
 *     summary: Get outgoing car entries by date range (Admin only)
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for the report (YYYY-MM-DD).
 *         example: 2023-10-20
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for the report (YYYY-MM-DD).
 *         example: 2023-10-27
 *     responses:
 *       200:
 *         description: Outgoing car entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarEntry'
 *       400:
 *         description: Bad request (e.g., missing or invalid date parameters)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user is not an admin)
 *       500:
 *         description: Server error
 */
// Admin-only route to get outgoing car entries by date range
router.get('/outgoing', authorizeRoles('admin'), getOutgoingCarEntries);

/**
 * @swagger
 * /entries/incoming:
 *   get:
 *     summary: Get incoming car entries by date range (Admin only)
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for the report (YYYY-MM-DD).
 *         example: 2023-10-20
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for the report (YYYY-MM-DD).
 *         example: 2023-10-27
 *     responses:
 *       200:
 *         description: Incoming car entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarEntry'
 *       400:
 *         description: Bad request (e.g., missing or invalid date parameters)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user is not an admin)
 *       500:
 *         description: Server error
 */
// View Incoming Cars Report (Date Range Filter)
router.get('/incoming', authorizeRoles('admin'), getIncomingCarEntries);

/**
 * @swagger
 * /entries/charges:
 *   get:
 *     summary: Get total charges between two dates (Admin only)
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for the report (YYYY-MM-DD).
 *         example: 2023-10-20
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for the report (YYYY-MM-DD).
 *         example: 2023-10-27
 *     responses:
 *       200:
 *         description: Total charges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCharge:
 *                   type: number
 *                   format: float
 *                   description: The sum of charges within the specified date range.
 *                   example: 150.75
 *       400:
 *         description: Bad request (e.g., missing or invalid date parameters)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user is not an admin)
 *       500:
 *         description: Server error
 */
// Show Charges Between Two Dates
router.get('/charges', authorizeRoles('admin'), getChargesReport);

/**
 * @swagger
 * /entries/all:
 *   get:
 *     summary: Get all car entries between two dates (Admin only)
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for the report (YYYY-MM-DD).
 *         example: 2023-10-20
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for the report (YYYY-MM-DD).
 *         example: 2023-10-27
 *     responses:
 *       200:
 *         description: All car entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarEntry'
 *       400:
 *         description: Bad request (e.g., missing or invalid date parameters)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user is not an admin)
 *       500:
 *         description: Server error
 */
// Show All Cars Between Two Dates
router.get('/all', authorizeRoles('admin'), getAllCarEntriesByDateRange);

/**
 * @swagger
 * /entries/my-entries:
 *   get:
 *     summary: Get authenticated client's car entry history (Client only)
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client car entry history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarEntry'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user is not a client)
 *       500:
 *         description: Server error
 */
// Route for clients to view their own car entries
router.get('/my-entries', authorizeRoles('client'), getClientCarEntries);

module.exports = router; 