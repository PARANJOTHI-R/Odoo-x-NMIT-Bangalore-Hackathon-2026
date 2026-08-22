import api from './api';

export async function applyLeave(data) {
  const res = await api.post('/api/leave/apply', data);
  return res.data;
}

export async function getMyLeaves() {
  const res = await api.get('/api/leave/my');
  return res.data;
}

export async function getAdminLeaves() {
  const res = await api.get('/api/admin/leave');
  return res.data;
}

export async function approveLeave(id) {
  const res = await api.put(`/api/admin/leave/${id}/approve`);
  return res.data;
}

export async function rejectLeave(id) {
  const res = await api.put(`/api/admin/leave/${id}/reject`);
  return res.data;
}
