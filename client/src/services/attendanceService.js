import api from './api';

export async function checkIn() {
  const res = await api.post('/api/attendance/checkin');
  return res.data;
}

export async function checkOut() {
  const res = await api.post('/api/attendance/checkout');
  return res.data;
}

export async function getMyAttendance() {
  const res = await api.get('/api/attendance/my');
  return res.data;
}

export async function getAdminAttendance() {
  const res = await api.get('/api/admin/attendance');
  return res.data;
}
