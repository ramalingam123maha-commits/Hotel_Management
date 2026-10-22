const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/guests', require('./routes/guestRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));

// WebSocket Events
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Room status updates
  socket.on('room_status_changed', (data) => {
    io.emit('room_status_update', data);
  });

  // Booking updates
  socket.on('booking_created', (data) => {
    io.emit('booking_update', { type: 'created', data });
  });

  socket.on('booking_cancelled', (data) => {
    io.emit('booking_update', { type: 'cancelled', data });
  });

  // Check-in/out updates
  socket.on('guest_checked_in', (data) => {
    io.emit('check_in_update', data);
  });

  socket.on('guest_checked_out', (data) => {
    io.emit('check_out_update', data);
  });

  // Staff coordination
  socket.on('task_assigned', (data) => {
    io.emit('staff_task_update', data);
  });

  socket.on('staff_status_changed', (data) => {
    io.emit('staff_status_update', data);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Hotel Management System running on port ${PORT}`);
});

module.exports = { io };
