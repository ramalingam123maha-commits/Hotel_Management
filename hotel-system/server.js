const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer, WebSocket } = require('ws');
let seq = 1;
const fresh = () => ({ rooms: [101, 102, 201, 202].map((n, i) => ({ id: seq++, number: n, type: i < 2 ? 'single' : 'double', rate: i < 2 ? 80 : 130, status: 'available' })), reservations: [], staff: [], tasks: [] });
let db = fresh();
const server = http.createServer(handle);
const wss = new WebSocketServer({ server, path: '/ws' });
const broadcast = (type, data) => { const m = JSON.stringify({ type, data }); wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(m)); };
wss.on('connection', ws => ws.send(JSON.stringify({ type: 'snapshot', data: db })));
const day = 864e5, nights = r => Math.max(1, Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / day));
const bill = r => { const room = db.rooms.find(x => x.id === r.roomId); const n = nights(r); const sub = n * room.rate + r.charges.reduce((a, c) => a + c.amount, 0); return { reservationId: r.id, nights: n, roomTotal: n * room.rate, charges: r.charges, tax: +(sub * .1).toFixed(2), total: +(sub * 1.1).toFixed(2) }; };
const overlap = (a, b) => a.checkIn < b.checkOut && b.checkIn < a.checkOut;
const valid = d => /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d));

function route(m, u, b) {
  let x;
  if (m === 'GET' && u === '/api/state') return [200, db];
  if (m === 'POST' && u === '/api/reservations') {
    const roomId = +b.roomId;
    if (!b.guest || !valid(b.checkIn) || !valid(b.checkOut) || b.checkOut <= b.checkIn) return [400, { error: 'guest and valid checkIn < checkOut (YYYY-MM-DD) required' }];
    if (!db.rooms.some(r => r.id === roomId)) return [404, { error: 'Room not found' }];
    if (db.reservations.some(r => r.roomId === roomId && r.status !== 'cancelled' && r.status !== 'checked-out' && overlap(r, b))) return [409, { error: 'Room not available for those dates' }];
    const r = { id: seq++, roomId, guest: String(b.guest), checkIn: b.checkIn, checkOut: b.checkOut, status: 'reserved', charges: [] };
    db.reservations.push(r); broadcast('reservation', r); return [201, r];
  }
  if ((x = u.match(/^\/api\/reservations\/(\d+)\/(checkin|checkout|cancel|charge|bill)$/))) {
    const r = db.reservations.find(r => r.id === +x[1]); if (!r) return [404, { error: 'Not found' }];
    const room = db.rooms.find(r2 => r2.id === r.roomId), a = x[2];
    if (a === 'bill' && m === 'GET') return [200, bill(r)];
    if (m !== 'POST') return [405, { error: 'Method not allowed' }];
    if (a === 'checkin') { if (r.status !== 'reserved') return [409, { error: 'Not in reserved state' }]; r.status = 'checked-in'; room.status = 'occupied'; }
    else if (a === 'checkout') { if (r.status !== 'checked-in') return [409, { error: 'Not checked in' }]; r.status = 'checked-out'; room.status = 'cleaning'; r.finalBill = bill(r); }
    else if (a === 'cancel') { if (r.status !== 'reserved') return [409, { error: 'Cannot cancel' }]; r.status = 'cancelled'; }
    else { const amt = +b.amount; if (r.status !== 'checked-in' || !(amt > 0)) return [400, { error: 'Need checked-in guest and positive amount' }]; r.charges.push({ description: String(b.description || 'Charge'), amount: amt }); }
    broadcast('reservation', r); broadcast('room', room); return [200, r];
  }
  if (m === 'POST' && u === '/api/staff') { if (!b.name) return [400, { error: 'name required' }]; const s = { id: seq++, name: String(b.name), role: String(b.role || 'staff') }; db.staff.push(s); broadcast('staff', s); return [201, s]; }
  if (m === 'POST' && u === '/api/tasks') {
    if (!b.description || !db.staff.some(s => s.id === +b.staffId)) return [400, { error: 'description and valid staffId required' }];
    const t = { id: seq++, description: String(b.description), staffId: +b.staffId, roomId: b.roomId ? +b.roomId : null, status: 'open' }; db.tasks.push(t); broadcast('task', t); return [201, t];
  }
  if ((x = u.match(/^\/api\/tasks\/(\d+)\/complete$/)) && m === 'POST') {
    const t = db.tasks.find(t => t.id === +x[1]); if (!t) return [404, { error: 'Not found' }];
    t.status = 'done'; const room = db.rooms.find(r => r.id === t.roomId);
    if (room && room.status === 'cleaning') { room.status = 'available'; broadcast('room', room); }
    broadcast('task', t); return [200, t];
  }
  return [404, { error: 'Not found' }];
}
function handle(req, res) {
  const u = req.url.split('?')[0];
  if (!u.startsWith('/api/')) {
    const pub = path.join(__dirname, 'public'), f = path.join(pub, u === '/' ? 'index.html' : u);
    if (!f.startsWith(pub + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript' }[path.extname(f)] || 'text/plain' }); return fs.createReadStream(f).pipe(res);
  }
  let raw = ''; req.on('data', d => { raw += d; if (raw.length > 1e6) req.destroy(); });
  req.on('end', () => {
    let b = {}; try { if (raw) b = JSON.parse(raw); } catch { res.writeHead(400); return res.end('{"error":"Invalid JSON"}'); }
    const [c, body] = route(req.method, u, b); res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body));
  });
}
module.exports = { server, reset: () => { db = fresh(); } };
if (require.main === module) server.listen(process.env.PORT || 3000, () => console.log('Hotel system running'));
