const db = require('../config/db');
const { logAction } = require('../services/logService');

const addVehicle = async (req, res) => {
  const { plate_number, vehicle_type, size, attributes } = req.body;
  
  try {
    const newVehicle = await db.query(
      'INSERT INTO vehicles (user_id, plate_number, vehicle_type, size, attributes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, plate_number, vehicle_type, size, attributes || {}]
    );

    // Log action
    await logAction(req.user.id, 'vehicle_add', `Added vehicle ${plate_number}`);

    res.status(201).json(newVehicle.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Vehicle with this plate number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { plate_number, vehicle_type, size, attributes } = req.body;
  
  try {
    // Verify vehicle belongs to user
    const vehicle = await db.query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (vehicle.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    const updatedVehicle = await db.query(
      'UPDATE vehicles SET plate_number = $1, vehicle_type = $2, size = $3, attributes = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [plate_number, vehicle_type, size, attributes || {}, id]
    );

    // Log action
    await logAction(req.user.id, 'vehicle_update', `Updated vehicle ${plate_number}`);

    res.json(updatedVehicle.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Vehicle with this plate number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verify vehicle belongs to user
    const vehicle = await db.query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (vehicle.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    await db.query('DELETE FROM vehicles WHERE id = $1', [id]);

    // Log action
    await logAction(req.user.id, 'vehicle_delete', `Deleted vehicle ${vehicle.rows[0].plate_number}`);

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserVehicles = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    let query = 'SELECT * FROM vehicles WHERE user_id = $1';
    const queryParams = [req.user.id];
    let paramCount = 2;

    if (search) {
      query += ` AND (plate_number ILIKE $${paramCount} OR vehicle_type ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // Get total count for pagination
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total, 10);

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const vehicles = await db.query(query, queryParams);

    // Log action
    await logAction(req.user.id, 'vehicle_list_view', 'Viewed vehicle list');

    res.json({
      data: vehicles.rows,
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

module.exports = { addVehicle, updateVehicle, deleteVehicle, getUserVehicles };
