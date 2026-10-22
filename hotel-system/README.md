# Hotel Management System

A comprehensive hotel management solution with real-time updates using WebSocket technology for seamless coordination of room bookings, guest check-ins/check-outs, staff management, and billing operations.

## Features

### Room Management
- Inventory tracking for all room types (Single, Double, Suite, Deluxe, Presidential)
- Real-time room status updates (Available, Occupied, Maintenance, Cleaning)
- Room amenities and features catalog
- Maintenance scheduling and history

### Booking Management
- Create and manage reservations with date validation
- Automatic capacity checking
- Room availability search for specific date ranges
- Booking confirmation and modification
- Special requests tracking
- No-show management

### Guest Management
- Guest registration and login
- Booking history for each guest
- Loyalty program tracking
- Guest preferences and notes
- Emergency contact information
- ID verification tracking

### Check-in/Check-out Operations
- Fast check-in process with room assignment
- Guest information verification
- Automatic room status updates
- Express check-out functionality
- Real-time synchronization across all staff devices

### Billing & Payments
- Automatic bill generation on check-out
- Additional charges management (room service, minibar, etc.)
- Discount application
- Multiple payment methods (Cash, Credit Card, Bank Transfer, Check)
- Payment tracking and receipts
- Partial payment handling

### Staff Coordination
- Staff member management by department
- Real-time task assignment
- Shift and status management
- Task completion tracking
- Performance ratings
- Activity logging

### Real-Time WebSocket Features
- Instant room status updates across the system
- Live booking notifications
- Guest check-in/check-out alerts
- Staff task assignments with real-time notifications
- Payment confirmations
- System-wide activity feed

## Technology Stack

**Backend:**
- Node.js with Express.js
- MongoDB for data persistence
- Socket.io for real-time WebSocket communication
- JWT for authentication
- Bcrypt for password hashing

**Frontend:**
- HTML5, CSS3, JavaScript
- Socket.io client for real-time updates
- Responsive design

## Installation & Setup

1. **Clone the repository:**
```bash
cd hotel-system
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and payment credentials
```

4. **Start the server:**
```bash
npm start
# For development:
npm run dev
```

5. **Access the application:**
- Guest Portal: `http://localhost:5001`
- Staff Portal: `http://localhost:5001`

## Database Models

### Room
- Room number, floor, type, capacity
- Nightly rate, amenities list
- Current status and last maintenance date
- Current guest reference

### Booking
- Booking number, guest and room references
- Check-in/check-out dates
- Number of guests
- Payment method and status
- Special requests

### Guest
- Personal information and contact details
- Identification verification (type, number, expiry)
- Booking history and loyalty points
- Preferences and emergency contacts
- Account balance

### Bill
- Bill number and booking reference
- Room charges calculation
- Additional charges tracking
- Discounts applied
- Payment status and history
- Tax calculation

### Staff
- Employee ID, name, contact
- Department assignment
- Shift information
- Task assignments with status
- Performance ratings

## API Endpoints

### Authentication
- `POST /api/auth/guest/register` - Register new guest
- `POST /api/auth/guest/login` - Guest login
- `POST /api/auth/staff/login` - Staff login
- `GET /api/auth/verify` - Verify JWT token

### Rooms
- `GET /api/rooms` - Get all rooms with filters
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room details
- `PATCH /api/rooms/:id/status` - Update room status
- `POST /api/rooms/available` - Search available rooms for dates

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/check-in` - Check in guest
- `PATCH /api/bookings/:id/check-out` - Check out guest
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Guests
- `GET /api/guests` - Get all guests
- `GET /api/guests/:id` - Get guest details
- `GET /api/guests/:id/bookings` - Get guest booking history
- `PUT /api/guests/:id` - Update guest profile
- `GET /api/guests/:id/profile` - Get guest profile summary

### Staff
- `GET /api/staff` - Get all staff members
- `POST /api/staff` - Add new staff member
- `GET /api/staff/:id` - Get staff details
- `PATCH /api/staff/:id/status` - Update staff status
- `POST /api/staff/:id/assign-task` - Assign task to staff
- `PATCH /api/staff/:id/complete-task/:taskIndex` - Mark task complete

### Billing
- `GET /api/billing` - Get all bills
- `GET /api/billing/:id` - Get bill details
- `POST /api/billing/:id/add-charge` - Add charge to bill
- `POST /api/billing/:id/add-discount` - Apply discount
- `POST /api/billing/:id/payment` - Record payment
- `GET /api/billing/guest/:guestId` - Get guest bills

## Key Functionalities

### For Guests
1. **Booking Management**
   - Search available rooms
   - Create reservations
   - Modify bookings
   - Cancel reservations
   - View booking history

2. **Self-Service Portal**
   - Check booking status
   - Request services
   - View bills
   - Make payments online
   - Manage preferences

### For Staff
1. **Room Operations**
   - View room status
   - Update room condition
   - Assign housekeeping tasks
   - Track maintenance

2. **Guest Services**
   - Check-in/check-out management
   - Guest communication
   - Special request handling
   - Feedback collection

3. **Billing Operations**
   - Create and verify bills
   - Process payments
   - Generate receipts
   - Track outstanding payments

### For Management
1. **Dashboard Analytics**
   - Occupancy rate
   - Revenue tracking
   - Guest satisfaction metrics
   - Staff performance

2. **Operations Management**
   - Booking calendar
   - Staff scheduling
   - Maintenance planning
   - Inventory management

## WebSocket Events

**Client to Server:**
- `room_status_changed` - Update room status
- `booking_created` - New booking
- `booking_cancelled` - Booking cancellation
- `guest_checked_in` - Guest check-in
- `guest_checked_out` - Guest check-out
- `task_assigned` - Staff task assignment
- `staff_status_changed` - Staff status update

**Server to Client:**
- `room_status_update` - Room status changed
- `booking_update` - Booking event
- `check_in_update` - Check-in notification
- `check_out_update` - Check-out notification
- `staff_task_update` - Task assignment
- `staff_status_update` - Staff status change
- `payment_received` - Payment confirmation

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure payment handling
- Guest privacy protection
- Staff authorization levels

## Real-Time Synchronization

All staff members and management see:
- Instant room status updates
- Live booking confirmations
- Guest arrivals/departures
- Task assignments
- Payment confirmations
- System alerts

## Performance Optimization

- Efficient database indexing
- Connection pooling
- Real-time caching
- Pagination for large data sets
- WebSocket event optimization

## Future Enhancements

- Integration with payment gateways (Stripe, PayPal)
- Email and SMS notifications
- Mobile app for staff
- Advanced analytics and reporting
- Dynamic pricing system
- Channel manager integration
- Guest feedback and reviews
- Housekeeping app
- Energy management system

## Contributing

This is a demonstration project. Feel free to modify and extend as needed.

## License

MIT License
