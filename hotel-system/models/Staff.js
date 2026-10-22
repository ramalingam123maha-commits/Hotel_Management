const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone: String,
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: ['Housekeeping', 'Front Desk', 'Kitchen', 'Maintenance', 'Security', 'Management'],
    required: true
  },
  position: String,
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'Flexible'],
    default: 'Flexible'
  },
  status: {
    type: String,
    enum: ['On Duty', 'Off Duty', 'On Leave', 'Unavailable'],
    default: 'Off Duty'
  },
  salary: Number,
  joinDate: Date,
  hireDate: Date,
  assignments: [
    {
      roomId: mongoose.Schema.Types.ObjectId,
      taskType: String,
      priority: String,
      dueTime: Date,
      completed: Boolean,
      notes: String
    }
  ],
  performanceRating: {
    type: Number,
    min: 1,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
staffSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Staff', staffSchema);
