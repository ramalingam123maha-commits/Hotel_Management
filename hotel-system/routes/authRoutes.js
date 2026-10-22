const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Guest = require('../models/Guest');
const Staff = require('../models/Staff');
const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Guest Registration
router.post('/guest/register', [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const existingGuest = await Guest.findOne({ email: req.body.email });
    if (existingGuest) return res.status(400).json({ error: 'Guest already exists' });

    const guest = new Guest(req.body);
    await guest.save();
    res.status(201).json({ message: 'Guest registered successfully', guest: { id: guest._id, email: guest.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guest Login
router.post('/guest/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const guest = await Guest.findOne({ email: req.body.email });
    if (!guest) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await guest.comparePassword(req.body.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: guest._id, type: 'guest', email: guest.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, guest: { id: guest._id, firstName: guest.firstName, lastName: guest.lastName, email: guest.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff Login
router.post('/staff/login', [
  body('employeeId').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const staff = await Staff.findOne({ employeeId: req.body.employeeId });
    if (!staff) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await staff.comparePassword(req.body.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: staff._id, type: 'staff', department: staff.department },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, staff: { id: staff._id, firstName: staff.firstName, lastName: staff.lastName, department: staff.department } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Token
router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
