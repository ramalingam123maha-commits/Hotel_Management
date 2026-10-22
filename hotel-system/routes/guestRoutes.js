const express = require('express');
const { body, validationResult } = require('express-validator');
const Guest = require('../models/Guest');
const Booking = require('../models/Booking');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all guests (staff only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'staff') return res.status(403).json({ error: 'Access denied' });

    const { page = 1, limit = 10 } = req.query;
    const guests = await Guest.find()
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Guest.countDocuments();
    res.json({ guests, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get guest by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).select('-password');
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get guest bookings
router.get('/:id/bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ guestId: req.params.id })
      .populate('roomId')
      .sort({ checkInDate: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update guest profile
router.put('/:id', [
  body('email').optional().isEmail()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get guest profile
router.get('/:id/profile', verifyToken, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).select('-password');
    const bookings = await Booking.find({ guestId: req.params.id }).countDocuments();
    
    res.json({
      ...guest.toObject(),
      totalBookings: bookings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
