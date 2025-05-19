const db = require('../config/db');
const { logAction } = require('../services/logService');
const { sendApprovalEmail } = require('../services/emailService');

const addSlots = async (req, res) => {
  const { slots } = req.body;
  
  if (!Array.isArray(slots)) {
    return res.status(400).json({ error: 'Slots must be provided as an array' });
  }

  try {
    const insertedSlots = [];
    
    for (const slot of slots) {
      const { slot_number, size, vehicle_type, location } = slot;
      
      const newSlot = await db.query(
        'INSERT INTO parking_slots (slot_number, size, vehicle_type, location) VALUES ($1, $2, $3, $4) RETURNING *',
        [slot_number, size, vehicle_type, location]
      );
      
      insertedSlots.push(newSlot.rows[0]);
    }

    await logAction(req.user.id, 'slots_bulk_add', `Added ${slots.length} parking slots`);
    res.status(201).json(insertedSlots);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'One or more slot numbers already exist' });
    }
    res.status(500).json({ error: err.message });
  }
};

const updateSlot = async (req, res) => {
  const { id } = req.params;
  const { slot_number, size, vehicle_type, status, location } = req.body;
  
  try {
    const updatedSlot = await db.query(
      'UPDATE parking_slots SET slot_number = $1, size = $2, vehicle_type = $3, status = $4, location = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [slot_number, size, vehicle_type, status, location, id]
    );

    if (updatedSlot.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    await logAction(req.user.id, 'slot_update', `Updated slot ${slot_number}`);
    res.json(updatedSlot.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Slot with this number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

const deleteSlot = async (req, res) => {
  const { id } = req.params;
  
  try {
    const slot = await db.query('SELECT * FROM parking_slots WHERE id = $1', [id]);
    if (slot.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    await db.query('DELETE FROM parking_slots WHERE id = $1', [id]);
    await logAction(req.user.id, 'slot_delete', `Deleted slot ${slot.rows[0].slot_number}`);
    res.json({ message: 'Slot deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSlots = async (req, res) => {
  const { page = 1, limit = 10, search = '', status, vehicle_type, size } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    let query = 'SELECT * FROM parking_slots';
    const queryParams = [];
    let whereClauses = [];
    let paramCount = 1;

    if (req.user.role === 'user') {
      whereClauses.push('status = $1');
      queryParams.push('available');
      paramCount++;
    }

    if (search) {
      whereClauses.push(`slot_number ILIKE $${paramCount}`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      whereClauses.push(`status = $${paramCount}`);
      queryParams.push(status);
      paramCount++;
    }

    if (vehicle_type) {
      whereClauses.push(`vehicle_type ILIKE $${paramCount}`);
      queryParams.push(`%${vehicle_type}%`);
      paramCount++;
    }

    if (size) {
      whereClauses.push(`size = $${paramCount}`);
      queryParams.push(size);
      paramCount++;
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total, 10);

    query += ` ORDER BY slot_number ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const slots = await db.query(query, queryParams);
    await logAction(req.user.id, 'slots_list_view', 'Viewed slots list');

    res.json({
      data: slots.rows,
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

const getAvailableSlotsForVehicle = async (req, res) => {
  const { vehicleId } = req.params;
  
  try {
    const vehicle = await db.query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [vehicleId, req.user.id]);
    if (vehicle.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    const slots = await db.query(
      `SELECT * FROM parking_slots 
       WHERE status = 'available' 
       AND vehicle_type = $1 
       AND size = $2`,
      [vehicle.rows[0].vehicle_type, vehicle.rows[0].size]
    );

    res.json(slots.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  addSlots, 
  updateSlot, 
  deleteSlot, 
  getSlots, 
  getAvailableSlotsForVehicle 
};
