import api from './api';

const MOCK_ATTENDANCE = [
  { _id: '1', date: '2026-08-22', checkIn: '2026-08-22T09:00:00.000Z', checkOut: null, status: 'present' },
  { _id: '2', date: '2026-08-21', checkIn: '2026-08-21T09:05:00.000Z', checkOut: '2026-08-21T17:30:00.000Z', status: 'present' },
  { _id: '3', date: '2026-08-20', checkIn: '2026-08-20T09:45:00.000Z', checkOut: '2026-08-20T18:00:00.000Z', status: 'late' },
  { _id: '4', date: '2026-08-19', checkIn: '2026-08-19T09:00:00.000Z', checkOut: '2026-08-19T17:15:00.000Z', status: 'present' },
  { _id: '5', date: '2026-08-18', checkIn: null, checkOut: null, status: 'leave' },
  { _id: '6', date: '2026-08-15', checkIn: '2026-08-15T08:55:00.000Z', checkOut: '2026-08-15T17:00:00.000Z', status: 'present' },
  { _id: '7', date: '2026-08-14', checkIn: '2026-08-14T09:02:00.000Z', checkOut: '2026-08-14T17:20:00.000Z', status: 'present' },
];

export async function checkIn() {
  try {
    const res = await api.post('/api/attendance/checkin');
    return res.data;
  } catch (err) {
    if (!err.response) {
      return { success: true, message: 'Checked in (Demo Mode)', data: { checkIn: new Date().toISOString() } };
    }
    throw err;
  }
}

export async function checkOut() {
  try {
    const res = await api.post('/api/attendance/checkout');
    return res.data;
  } catch (err) {
    if (!err.response) {
      return { success: true, message: 'Checked out (Demo Mode)', data: { checkOut: new Date().toISOString() } };
    }
    throw err;
  }
}

export async function getMyAttendance() {
  try {
    const res = await api.get('/api/attendance/my');
    return res.data;
  } catch (err) {
    if (!err.response) return MOCK_ATTENDANCE;
    throw err;
  }
}

export async function getAdminAttendance() {
  try {
    const res = await api.get('/api/admin/attendance');
    return res.data;
  } catch (err) {
    if (!err.response) {
      return [
        ...MOCK_ATTENDANCE.map((r) => ({ ...r, employee: { name: 'Kasim', email: 'kasim@company.com' } })),
        { _id: 'a1', date: '2026-08-22', checkIn: '09:10', checkOut: null, status: 'present', employee: { name: 'Sarah Connor', email: 'sarah@company.com' } },
        { _id: 'a2', date: '2026-08-22', checkIn: null, checkOut: null, status: 'absent', employee: { name: 'John Doe', email: 'john@company.com' } },
        { _id: 'a3', date: '2026-08-21', checkIn: '09:00', checkOut: '17:00', status: 'present', employee: { name: 'Emily Davis', email: 'emily@company.com' } },
      ];
    }
    throw err;
  }
}
