const API_URL = 'http://localhost:5001/api';
const socket = io('http://localhost:5001');
let token = localStorage.getItem('token');
let userRole = localStorage.getItem('userRole');
let userId = localStorage.getItem('userId');

document.addEventListener('DOMContentLoaded', () => {
  if (token && userRole) {
    showDashboard();
    setupWebSocket();
    loadDashboardStats();
  }
});

// Tab switching
function switchTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tab + '-login').classList.add('active');
}

function toggleRegister() {
  document.getElementById('guest-login').classList.toggle('hidden');
  document.getElementById('register-form').classList.toggle('hidden');
}

// Guest Registration
async function registerGuest(e) {
  e.preventDefault();
  const data = {
    firstName: document.getElementById('reg-firstname').value,
    lastName: document.getElementById('reg-lastname').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
    phone: document.getElementById('reg-phone').value
  };

  try {
    const res = await fetch(`${API_URL}/auth/guest/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Registration failed');
    alert('Registration successful! Please login.');
    toggleRegister();
  } catch (err) {
    document.getElementById('register-error').textContent = err.message;
  }
}

// Login functions
async function loginGuest(e) {
  e.preventDefault();
  const email = document.getElementById('guest-email').value;
  const password = document.getElementById('guest-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/guest/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    token = data.token;
    userRole = 'guest';
    userId = data.guest.id;

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userId', userId);

    showDashboard();
    setupWebSocket();
  } catch (err) {
    document.getElementById('guest-error').textContent = err.message;
  }
}

async function loginStaff(e) {
  e.preventDefault();
  const employeeId = document.getElementById('staff-id').value;
  const password = document.getElementById('staff-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    token = data.token;
    userRole = 'staff';
    userId = data.staff.id;

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userId', userId);

    showDashboard();
    setupWebSocket();
  } catch (err) {
    document.getElementById('staff-error').textContent = err.message;
  }
}

function logout() {
  token = null;
  userRole = null;
  userId = null;
  localStorage.clear();
  document.getElementById('login-container').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  
  const userInfo = userRole === 'staff' ? 'Staff Member' : 'Guest';
  document.getElementById('user-info').textContent = `Logged in as: ${userInfo}`;

  // Hide staff/admin only menu items for guests
  if (userRole === 'guest') {
    document.getElementById('menu-rooms').style.display = 'none';
    document.getElementById('menu-guests').style.display = 'none';
    document.getElementById('menu-staff').style.display = 'none';
    document.getElementById('menu-billing').style.display = 'none';
    document.getElementById('add-room-btn').style.display = 'none';
    document.getElementById('add-booking-btn').style.display = 'none';
    document.getElementById('add-staff-btn').style.display = 'none';
  }
}

// WebSocket Setup
function setupWebSocket() {
  socket.on('room_status_changed', (data) => {
    showNotification(`Room ${data.roomId} status: ${data.status}`);
    loadRooms();
  });

  socket.on('guest_checked_in', (data) => {
    showNotification('Guest checked in successfully');
    loadBookings();
  });

  socket.on('guest_checked_out', (data) => {
    showNotification('Guest checked out successfully');
    loadRooms();
  });

  socket.on('payment_received', (data) => {
    showNotification(`Payment received: $${data.amount}`);
  });
}

function showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'real-time-update';
  notif.textContent = message;
  document.body.appendChild(notif);
  
  setTimeout(() => notif.remove(), 3000);
}

// Page navigation
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');

  if (page === 'dashboard') loadDashboardStats();
  if (page === 'rooms') loadRooms();
  if (page === 'bookings') loadBookings();
  if (page === 'guests' && userRole === 'staff') loadGuests();
  if (page === 'staff' && userRole === 'staff') loadStaff();
  if (page === 'billing') loadBills();
  if (page === 'profile') loadProfile();
}

// Dashboard stats
async function loadDashboardStats() {
  try {
    const [roomsRes, bookingsRes, billsRes] = await Promise.all([
      fetch(`${API_URL}/rooms`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_URL}/bookings`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_URL}/billing`, { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    const roomsData = await roomsRes.json();
    const bookingsData = await bookingsRes.json();
    const billsData = await billsRes.json();

    const occupied = roomsData.rooms.filter(r => r.status === 'Occupied').length;
    const available = roomsData.rooms.filter(r => r.status === 'Available').length;
    const today = new Date().toDateString();
    const todayCheckIns = bookingsData.bookings.filter(b => new Date(b.checkInDate).toDateString() === today && b.status === 'Confirmed').length;
    const todayCheckOuts = bookingsData.bookings.filter(b => new Date(b.checkOutDate).toDateString() === today && b.status === 'Checked In').length;
    const pendingBills = billsData.bills.filter(b => b.paymentStatus === 'Pending').length;

    document.getElementById('occupied-count').textContent = occupied;
    document.getElementById('available-count').textContent = available;
    document.getElementById('checkin-count').textContent = todayCheckIns;
    document.getElementById('checkout-count').textContent = todayCheckOuts;
    document.getElementById('pending-bills').textContent = pendingBills;
  } catch (err) {
    console.error(err);
  }
}

// Rooms Management
async function loadRooms() {
  try {
    const res = await fetch(`${API_URL}/rooms`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById('rooms-tbody');
    tbody.innerHTML = '';

    data.rooms.forEach(room => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${room.roomNumber}</td>
        <td>${room.type}</td>
        <td>${room.floor}</td>
        <td>$${room.pricePerNight}</td>
        <td><span class="status-badge ${room.status.toLowerCase()}">${room.status}</span></td>
        <td>
          <button onclick="viewRoom('${room._id}')">View</button>
          <button onclick="editRoom('${room._id}')">Edit</button>
        </td>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

function filterRooms() {
  // Filter implementation
}

function openAddRoomModal() {
  document.getElementById('add-room-modal').classList.remove('hidden');
}

async function addRoom(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    roomNumber: form.children[0].value,
    floor: parseInt(form.children[1].value),
    type: form.children[2].value,
    capacity: parseInt(form.children[3].value),
    pricePerNight: parseFloat(form.children[4].value),
    status: 'Available'
  };

  try {
    const res = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Failed to create room');
    alert('Room created successfully!');
    closeModal('add-room-modal');
    loadRooms();
  } catch (err) {
    alert(err.message);
  }
}

// Bookings Management
async function loadBookings() {
  try {
    const res = await fetch(`${API_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById('bookings-tbody');
    tbody.innerHTML = '';

    data.bookings.forEach(booking => {
      const row = tbody.insertRow();
      const checkInDate = new Date(booking.checkInDate).toLocaleDateString();
      const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString();
      
      row.innerHTML = `
        <td>${booking.bookingNumber}</td>
        <td>${booking.guestId?.firstName} ${booking.guestId?.lastName}</td>
        <td>${booking.roomId?.roomNumber}</td>
        <td>${checkInDate}</td>
        <td>${checkOutDate}</td>
        <td>${booking.status}</td>
        <td>$${booking.totalCost}</td>
        <td>
          ${booking.status === 'Confirmed' ? `<button class="checkin" onclick="checkInGuest('${booking._id}')">Check In</button>` : ''}
          ${booking.status === 'Checked In' ? `<button onclick="checkOutGuest('${booking._id}')">Check Out</button>` : ''}
        </td>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

function openAddBookingModal() {
  loadBookingSelects();
  document.getElementById('add-booking-modal').classList.remove('hidden');
}

async function loadBookingSelects() {
  const guestRes = await fetch(`${API_URL}/guests`, { headers: { 'Authorization': `Bearer ${token}` } });
  const guests = (await guestRes.json()).guests || [];

  const guestSelect = document.getElementById('booking-guest');
  guestSelect.innerHTML = '<option value="">Select Guest</option>';
  guests.forEach(g => {
    const option = document.createElement('option');
    option.value = g._id;
    option.textContent = `${g.firstName} ${g.lastName}`;
    guestSelect.appendChild(option);
  });
}

async function checkInGuest(bookingId) {
  try {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/check-in`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Check-in failed');
    alert('Guest checked in successfully!');
    loadBookings();
  } catch (err) {
    alert(err.message);
  }
}

async function checkOutGuest(bookingId) {
  try {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/check-out`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Check-out failed');
    alert('Guest checked out successfully!');
    loadBookings();
  } catch (err) {
    alert(err.message);
  }
}

// Guests Management
async function loadGuests() {
  try {
    const res = await fetch(`${API_URL}/guests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById('guests-tbody');
    tbody.innerHTML = '';

    data.guests.forEach(guest => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${guest.firstName} ${guest.lastName}</td>
        <td>${guest.email}</td>
        <td>${guest.phone}</td>
        <td>${guest.totalStays}</td>
        <td>$${guest.totalSpent}</td>
        <td>
          <button onclick="viewGuest('${guest._id}')">View</button>
        </td>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

// Staff Management
async function loadStaff() {
  try {
    const res = await fetch(`${API_URL}/staff`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById('staff-tbody');
    tbody.innerHTML = '';

    data.staff.forEach(staff => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${staff.employeeId}</td>
        <td>${staff.firstName} ${staff.lastName}</td>
        <td>${staff.department}</td>
        <td>${staff.shift}</td>
        <td>${staff.status}</td>
        <td>
          <button onclick="editStaff('${staff._id}')">Edit</button>
        </td>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

function openAddStaffModal() {
  document.getElementById('add-staff-modal').classList.remove('hidden');
}

async function addStaff(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    firstName: form.children[0].value,
    lastName: form.children[1].value,
    employeeId: form.children[2].value,
    email: form.children[3].value,
    password: form.children[4].value,
    department: form.children[5].value
  };

  try {
    const res = await fetch(`${API_URL}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Failed to add staff');
    alert('Staff member added successfully!');
    closeModal('add-staff-modal');
    loadStaff();
  } catch (err) {
    alert(err.message);
  }
}

// Billing Management
async function loadBills() {
  try {
    const res = await fetch(`${API_URL}/billing`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById('bills-tbody');
    tbody.innerHTML = '';

    data.bills.forEach(bill => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${bill.billNumber}</td>
        <td>${bill.guestId?.firstName} ${bill.guestId?.lastName}</td>
        <td>${bill.bookingId?.bookingNumber}</td>
        <td>$${bill.totalAmount}</td>
        <td>$${bill.amountPaid}</td>
        <td>$${bill.balanceDue}</td>
        <td>${bill.paymentStatus}</td>
        <td>
          <button onclick="viewBill('${bill._id}')">View</button>
        </td>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

// Profile
async function loadProfile() {
  try {
    if (userRole === 'guest') {
      const res = await fetch(`${API_URL}/guests/${userId}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const guest = await res.json();
      displayGuestProfile(guest);
    }
  } catch (err) {
    console.error(err);
  }
}

function displayGuestProfile(guest) {
  const content = document.getElementById('profile-content');
  content.innerHTML = `
    <p><strong>Name:</strong> ${guest.firstName} ${guest.lastName}</p>
    <p><strong>Email:</strong> ${guest.email}</p>
    <p><strong>Phone:</strong> ${guest.phone}</p>
    <p><strong>Total Stays:</strong> ${guest.totalStays}</p>
    <p><strong>Total Spent:</strong> $${guest.totalSpent}</p>
    <p><strong>Loyalty Points:</strong> ${guest.loyaltyPoints}</p>
  `;
}

// Modal functions
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function viewRoom(roomId) {
  alert('View room details - implementation pending');
}

function editRoom(roomId) {
  alert('Edit room - implementation pending');
}

function viewGuest(guestId) {
  alert('View guest - implementation pending');
}

function editStaff(staffId) {
  alert('Edit staff - implementation pending');
}

function viewBill(billId) {
  alert('View bill - implementation pending');
}
