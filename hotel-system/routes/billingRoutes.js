const express = require('express');
const { body, validationResult } = require('express-validator');
const Bill = require('../models/Bill');
const Booking = require('../models/Booking');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all bills
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.paymentStatus = status;

    const bills = await Bill.find(filter)
      .populate('guestId', 'firstName lastName email')
      .populate('bookingId', 'bookingNumber checkInDate checkOutDate')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Bill.countDocuments(filter);
    res.json({ bills, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bill by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('guestId')
      .populate('bookingId');

    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add charges to bill
router.post('/:id/add-charge', [
  body('description').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('type').notEmpty()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    bill.additionalCharges.push({
      description: req.body.description,
      amount: req.body.amount,
      type: req.body.type
    });

    // Recalculate total
    let total = bill.roomCharges;
    bill.additionalCharges.forEach(charge => total += charge.amount);
    bill.discounts.forEach(discount => total -= discount.amount);
    
    bill.totalAmount = total;
    bill.balanceDue = total - bill.amountPaid;

    await bill.save();
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add discount to bill
router.post('/:id/add-discount', [
  body('description').notEmpty(),
  body('amount').isFloat({ min: 0 })
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    bill.discounts.push({
      description: req.body.description,
      amount: req.body.amount
    });

    // Recalculate total
    let total = bill.roomCharges;
    bill.additionalCharges.forEach(charge => total += charge.amount);
    bill.discounts.forEach(discount => total -= discount.amount);
    
    bill.totalAmount = total;
    bill.balanceDue = total - bill.amountPaid;

    await bill.save();
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process payment
router.post('/:id/payment', [
  body('amountPaid').isFloat({ min: 0 }),
  body('paymentMethod').notEmpty()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    bill.amountPaid += req.body.amountPaid;
    bill.balanceDue = bill.totalAmount - bill.amountPaid;
    bill.paymentMethod = req.body.paymentMethod;
    bill.paidDate = new Date();

    if (bill.balanceDue <= 0) {
      bill.paymentStatus = 'Paid';
    } else if (bill.amountPaid > 0) {
      bill.paymentStatus = 'Partial';
    }

    await bill.save();

    req.io.emit('payment_received', {
      billId: bill._id,
      amount: req.body.amountPaid,
      paymentStatus: bill.paymentStatus
    });

    res.json({ message: 'Payment recorded successfully', bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get guest bills
router.get('/guest/:guestId', verifyToken, async (req, res) => {
  try {
    const bills = await Bill.find({ guestId: req.params.guestId })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
