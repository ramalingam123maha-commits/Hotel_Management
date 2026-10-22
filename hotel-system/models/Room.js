const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    unique: true,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Single', 'Double', 'Suite', 'Deluxe', 'Presidential'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance', 'Cleaning', 'Reserved'],
    default: 'Available'
  },
  amenities: [String],
  images: [String],
  currentGuest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest'
  },
  lastCleaned: Date,
  maintenanceNotes: String,
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
