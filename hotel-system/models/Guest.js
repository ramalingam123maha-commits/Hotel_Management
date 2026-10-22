const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const guestSchema = new mongoose.Schema({
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
  address: String,
  city: String,
  state: String,
  country: String,
  postalCode: String,
  idType: String,
  idNumber: String,
  idExpiry: Date,
  dateOfBirth: Date,
  guestType: {
    type: String,
    enum: ['Walk-in', 'Online Booking', 'Corporate'],
    default: 'Online Booking'
  },
  totalStays: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  preferences: String,
  emergencyContact: String,
  emergencyPhone: String,
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastStayDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
guestSchema.pre('save', async function(next) {
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
guestSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Guest', guestSchema);
