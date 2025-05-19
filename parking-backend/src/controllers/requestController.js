const db = require('../config/db');
const { logAction } = require('../services/logService');
const { sendApprovalEmail } = require('../services/emailService');

const createRequest = async (req, res) => {
  const { vehicle_id } = req.body;
  
  try {
    // Verify vehicle belongs to user
    const vehicle = await db.query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [vehicle_id, req.user.id]);
    if (vehicle.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    // Check for existing pending request for this vehicle
    const existingRequest = await db.query(
      'SELECT * FROM slot_requests WHERE vehicle_id = $1 AND status = $2',
      [vehicle_id, 'pending']
    );
    
    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'A pending request already exists for this vehicle' });
    }

    // Create new request
    const newRequest = await db.query(
      'INSERT INTO slot_requests (user_id, vehicle_id, status) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, vehicle_id, 'pending']
    );

    // Log action
    await logAction(req.user.id, 'request_create', `Created slot request for vehicle ${vehicle.rows[0].plate_number}`);

    res.status(201).json(newRequest.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRequest = async (req, res) => {
  const { id } = req.params;
  const { vehicle_id } = req.body;
  
  try {
    // Verify request belongs to user and is pending
    const request = await db.query(
      'SELECT * FROM slot_requests WHERE id = $1 AND user_id = $2 AND status = $3',
      [id, req.user.id, 'pending']
    );
    
    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found, access denied, or not pending' });
    }

    // Verify new vehicle belongs to user
    const vehicle = await db.query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [vehicle_id, req.user.id]);
    if (vehicle.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    const updatedRequest = await db.query(
      'UPDATE slot_requests SET vehicle_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [vehicle_id, id]
    );

    // Log action
    await logAction(req.user.id, 'request_update', `Updated slot request for vehicle ${vehicle.rows[0].plate_number}`);

    res.json(updatedRequest.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verify request belongs to user and is pending
    const request = await db.query(
      'SELECT * FROM slot_requests WHERE id = $1 AND user_id = $2 AND status = $3',
      [id, req.user.id, 'pending']
    );
    
    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found, access denied, or not pending' });
    }

    await db.query('DELETE FROM slot_requests WHERE id = $1', [id]);

    // Log action
    await logAction(req.user.id, 'request_delete', 'Deleted slot request');

    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRequests = async (req, res) => {
  const { page = 1, limit = 10, search = '', status } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    let query = `
      SELECT sr.*, v.plate_number, v.vehicle_type, v.size, u.name as user_name, u.email as user_email, ps.slot_number
      FROM slot_requests sr
      JOIN vehicles v ON sr.vehicle_id = v.id
      JOIN users u ON sr.user_id = u.id
      LEFT JOIN parking_slots ps ON sr.slot_id = ps.id
    `;
    
    const queryParams = [];
    let whereClauses = [];
    let paramCount = 1;

    // For regular users, only show their own requests
    if (req.user.role === 'user') {
      whereClauses.push(`sr.user_id = $${paramCount}`);
      queryParams.push(req.user.id);
      paramCount++;
    }

    if (search) {
      whereClauses.push(`(v.plate_number ILIKE $${paramCount} OR u.name ILIKE $${paramCount} OR v.vehicle_type ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      whereClauses.push(`sr.status = $${paramCount}`);
      queryParams.push(status);
      paramCount++;
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Get total count for pagination
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total, 10);

    // Add pagination
    query += ` ORDER BY sr.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const requests = await db.query(query, queryParams);

    // Log action
    await logAction(req.user.id, 'requests_list_view', 'Viewed requests list');

    res.json({
      data: requests.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const approveRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get the request
    const request = await db.query(
      'SELECT sr.*, v.plate_number, v.vehicle_type, v.size, u.email FROM slot_requests sr JOIN vehicles v ON sr.vehicle_id = v.id JOIN users u ON sr.user_id = u.id WHERE sr.id = $1',
      [id]
    );
    
    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    // Find an available compatible slot
    const slot = await db.query(
      `SELECT * FROM parking_slots 
       WHERE status = 'available' 
       AND vehicle_type = $1 
       AND size = $2 
       ORDER BY slot_number ASC 
       LIMIT 1`,
      [request.rows[0].vehicle_type, request.rows[0].size]
    );

    if (slot.rows.length === 0) {
      return res.status(400).json({ error: 'No available slots matching vehicle requirements' });
    }

    // Update the slot to unavailable
    await db.query(
      'UPDATE parking_slots SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['unavailable', slot.rows[0].id]
    );

    // Update the request
    const updatedRequest = await db.query(
      'UPDATE slot_requests SET status = $1, slot_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['approved', slot.rows[0].id, id]
    );

    // Send approval email
    await sendApprovalEmail(
      request.rows[0].email,
      slot.rows[0].slot_number,
      request.rows[0].plate_number,
      request.rows[0].vehicle_type
    );

    // Log action
    await logAction(req.user.id, 'request_approve', `Approved request for vehicle ${request.rows[0].plate_number}`);

    res.json(updatedRequest.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rejectRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get the request
    const request = await db.query('SELECT * FROM slot_requests WHERE id = $1', [id]);
    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    // Update the request
    const updatedRequest = await db.query(
      'UPDATE slot_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['rejected', id]
    );

    // Log action
    await logAction(req.user.id, 'request_reject', `Rejected request ${id}`);

    res.json(updatedRequest.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createRequest, updateRequest, deleteRequest, getRequests, approveRequest, rejectRequest };
