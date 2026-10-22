const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true,
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  roomCharges: Number,
  additionalCharges: [
    {
      description: String,
      amount: Number,
      type: String
    }
  ],
  taxAmount: Number,
  taxRate: Number,
  totalAmount: Number,
  amountPaid: {
    type: Number,
    default: 0
  },
  balanceDue: Number,
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Refunded'],
    default: 'Pending'
  },
  discounts: [
    {
      description: String,
      amount: Number
    }
  ],
  notes: String,
  dueDate: Date,
  paidDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
