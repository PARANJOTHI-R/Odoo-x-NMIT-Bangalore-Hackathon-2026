import api from './api';

export async function getProfile() {
  const res = await api.get('/api/employee/profile');
  return res.data;
}

export async function updateProfile(data) {
  const res = await api.put('/api/employee/profile', data);
  return res.data;
}

export async function getAdminEmployees() {
  const res = await api.get('/api/admin/employees');
  return res.data;
}

export async function updateEmployee(id, data) {
  const res = await api.put(`/api/admin/employees/${id}`, data);
  return res.data;
}
