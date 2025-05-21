const createParkingLot = async (req, res) => {
  try {
    const { code, name, total_spaces, location, feePerHour } = req.body;

    // Validate required fields
    if (!code || !name || !total_spaces || !location || !feePerHour) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate numeric fields
    if (isNaN(total_spaces) || total_spaces <= 0) {
      return res.status(400).json({ error: 'Total spaces must be a positive number' });
    }

    if (isNaN(feePerHour) || feePerHour < 0) {
      return res.status(400).json({ error: 'Fee per hour must be a non-negative number' });
    }

    // Check if parking lot code already exists
    const existingLot = await ParkingLot.findOne({ code });
    if (existingLot) {
      return res.status(400).json({ error: 'Parking lot code already exists' });
    }

    // Create new parking lot with available_spaces equal to total_spaces initially
    const parkingLot = new ParkingLot({
      code,
      name,
      total_spaces,
      available_spaces: total_spaces, // Initially all spaces are available
      location,
      feePerHour
    });

    await parkingLot.save();
    res.status(201).json(parkingLot);
  } catch (error) {
    console.error('Error creating parking lot:', error);
    res.status(500).json({ error: 'Failed to create parking lot' });
  }
}; 