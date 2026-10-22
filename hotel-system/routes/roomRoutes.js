const express = require('express');
const Room = require('../models/Room');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const rooms = await Room.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Room.countDocuments(filter);
    res.json({ rooms, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('currentGuest');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create room (staff only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'staff') return res.status(403).json({ error: 'Access denied' });

    const room = new Room(req.body);
    await room.save();
    req.io.emit('room_created', room);
    res.status(201).json({ message: 'Room created successfully', room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update room
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    req.io.emit('room_updated', room);
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update room status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    req.io.emit('room_status_changed', { roomId: room._id, status: room.status });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available rooms for dates
router.post('/available', async (req, res) => {
  try {
    const { checkInDate, checkOutDate, type } = req.body;
    const Booking = require('../models/Booking');

    const bookedRooms = await Booking.find({
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) },
      status: { $in: ['Confirmed', 'Checked In'] }
    }).select('roomId');

    const bookedRoomIds = bookedRooms.map(b => b.roomId);

    const filter = {
      isActive: true,
      status: { $in: ['Available', 'Reserved'] },
      _id: { $nin: bookedRoomIds }
    };

    if (type) filter.type = type;

    const availableRooms = await Room.find(filter);
    res.json(availableRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
