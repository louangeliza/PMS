const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { createRequest, updateRequest, deleteRequest, getRequests, approveRequest, rejectRequest } = require('../controllers/requestController');

router.use(authenticate);

// User routes
router.post('/', createRequest);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);

// Admin routes
router.get('/', getRequests);
router.post('/:id/approve', authorizeRoles('admin'), approveRequest);
router.post('/:id/reject', authorizeRoles('admin'), rejectRequest);

module.exports = router;
