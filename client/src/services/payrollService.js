import api from './api';

export async function getMyPayroll() {
  const res = await api.get('/api/payroll/my');
  return res.data;
}

export async function getAdminPayroll() {
  const res = await api.get('/api/admin/payroll');
  return res.data;
}

export async function updateEmployeePayroll(userId, data) {
  const res = await api.put(`/api/admin/payroll/${userId}`, data);
  return res.data;
}
