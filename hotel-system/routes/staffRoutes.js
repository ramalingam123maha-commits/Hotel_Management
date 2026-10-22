const express = require('express');
const { body, validationResult } = require('express-validator');
const Staff = require('../models/Staff');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all staff (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'staff') return res.status(403).json({ error: 'Access denied' });

    const { department, status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;

    const staff = await Staff.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Staff.countDocuments(filter);
    res.json({ staff, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get staff by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create staff member (admin only)
router.post('/', [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('department').notEmpty(),
  body('employeeId').notEmpty()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const existingStaff = await Staff.findOne({ $or: [{ email: req.body.email }, { employeeId: req.body.employeeId }] });
    if (existingStaff) return res.status(400).json({ error: 'Staff member already exists' });

    const staff = new Staff(req.body);
    await staff.save();

    req.io.emit('staff_member_added', staff);
    res.status(201).json({ message: 'Staff member added successfully', staff: { id: staff._id, employeeId: staff.employeeId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update staff status
router.patch('/:id/status', [
  body('status').isIn(['On Duty', 'Off Duty', 'On Leave', 'Unavailable'])
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).select('-password');

    req.io.emit('staff_status_changed', { staffId: staff._id, status: staff.status });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign task to staff
router.post('/:id/assign-task', verifyToken, async (req, res) => {
  try {
    const { roomId, taskType, priority, dueTime, notes } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          assignments: {
            roomId,
            taskType,
            priority,
            dueTime,
            notes,
            completed: false
          }
        }
      },
      { new: true }
    ).select('-password');

    req.io.emit('task_assigned', {
      staffId: staff._id,
      staffName: `${staff.firstName} ${staff.lastName}`,
      roomId,
      taskType,
      priority
    });

    res.json({ message: 'Task assigned successfully', staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete task
router.patch('/:id/complete-task/:taskIndex', verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff || !staff.assignments[req.params.taskIndex]) {
      return res.status(404).json({ error: 'Task not found' });
    }

    staff.assignments[req.params.taskIndex].completed = true;
    await staff.save();

    req.io.emit('task_completed', {
      staffId: staff._id,
      taskIndex: req.params.taskIndex
    });

    res.json({ message: 'Task marked as completed', staff: staff.select('-password') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get staff assignments
router.get('/:id/assignments', verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    const assignments = staff.assignments.filter(a => !a.completed);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
