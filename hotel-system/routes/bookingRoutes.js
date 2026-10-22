const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Bill = require('../models/Bill');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all bookings
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('guestId', 'firstName lastName email phone')
      .populate('roomId', 'roomNumber type pricePerNight')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ checkInDate: -1 });

    const total = await Booking.countDocuments(filter);
    res.json({ bookings, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get booking by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guestId')
      .populate('roomId');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking
router.post('/', [
  body('guestId').notEmpty(),
  body('roomId').notEmpty(),
  body('checkInDate').notEmpty(),
  body('checkOutDate').notEmpty(),
  body('numberOfGuests').isInt({ min: 1 })
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { guestId, roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

    // Check room availability
    const existingBooking = await Booking.findOne({
      roomId,
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) },
      status: { $in: ['Confirmed', 'Checked In'] }
    });

    if (existingBooking) return res.status(400).json({ error: 'Room not available for these dates' });

    const room = await Room.findById(roomId);
    const guest = await Guest.findById(guestId);

    if (!room || !guest) return res.status(404).json({ error: 'Room or Guest not found' });

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalCost = numberOfNights * room.pricePerNight;

    const bookingNumber = `BK${Date.now()}`;

    const booking = new Booking({
      bookingNumber,
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfNights,
      roomRate: room.pricePerNight,
      totalCost,
      specialRequests
    });

    await booking.save();

    // Create bill
    const billNumber = `BILL${Date.now()}`;
    const bill = new Bill({
      billNumber,
      bookingId: booking._id,
      guestId,
      roomCharges: totalCost,
      totalAmount: totalCost,
      balanceDue: totalCost,
      paymentMethod: 'Pending'
    });
    await bill.save();

    req.io.emit('booking_created', booking);
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check-in
router.patch('/:id/check-in', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Checked In' },
      { new: true }
    ).populate('roomId');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Update room status
    await Room.findByIdAndUpdate(booking.roomId._id, { status: 'Occupied' });

    req.io.emit('guest_checked_in', { bookingId: booking._id, guestId: booking.guestId });
    res.json({ message: 'Guest checked in successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check-out
router.patch('/:id/check-out', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Checked Out' },
      { new: true }
    ).populate('roomId');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Update room status to cleaning
    await Room.findByIdAndUpdate(booking.roomId._id, { status: 'Cleaning' });

    // Update guest total stays and spent
    const guest = await Guest.findById(booking.guestId);
    guest.totalStays += 1;
    guest.totalSpent += booking.totalCost;
    guest.lastStayDate = new Date();
    guest.loyaltyPoints += Math.floor(booking.totalCost / 10);
    await guest.save();

    req.io.emit('guest_checked_out', { bookingId: booking._id, roomId: booking.roomId._id });
    res.json({ message: 'Guest checked out successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel booking
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Update bill status
    const bill = await Bill.findOne({ bookingId: booking._id });
    if (bill) {
      bill.paymentStatus = 'Refunded';
      await bill.save();
    }

    req.io.emit('booking_cancelled', booking);
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
