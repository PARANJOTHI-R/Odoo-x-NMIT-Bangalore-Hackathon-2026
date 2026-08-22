import api from './api';

const MOCK_EMPLOYEES = [
  { _id: 'emp-1', name: 'Kasim', email: 'kasim@company.com', department: 'Engineering', position: 'Frontend Developer', role: 'employee', isActive: true },
  { _id: 'emp-2', name: 'Sarah Connor', email: 'sarah@company.com', department: 'Engineering', position: 'Tech Lead', role: 'employee', isActive: true },
  { _id: 'emp-3', name: 'John Doe', email: 'john@company.com', department: 'Marketing', position: 'Content Strategist', role: 'employee', isActive: true },
  { _id: 'emp-4', name: 'Emily Davis', email: 'emily@company.com', department: 'Design', position: 'UI/UX Designer', role: 'employee', isActive: true },
  { _id: 'emp-5', name: 'Alex Morgan', email: 'alex@company.com', department: 'Human Resources', position: 'HR Manager', role: 'admin', isActive: true },
  { _id: 'emp-6', name: 'Michael Scott', email: 'michael@company.com', department: 'Sales', position: 'Regional Manager', role: 'employee', isActive: false },
];

export async function getProfile() {
  try {
    const res = await api.get('/api/employee/profile');
    return res.data;
  } catch (err) {
    if (!err.response) return MOCK_EMPLOYEES[0];
    throw err;
  }
}

export async function updateProfile(data) {
  try {
    const res = await api.put('/api/employee/profile', data);
    return res.data;
  } catch (err) {
    if (!err.response) return { success: true, message: 'Profile updated (Demo Mode)', data };
    throw err;
  }
}

export async function getAdminEmployees() {
  try {
    const res = await api.get('/api/admin/employees');
    return res.data;
  } catch (err) {
    if (!err.response) return MOCK_EMPLOYEES;
    throw err;
  }
}

export async function updateEmployee(id, data) {
  try {
    const res = await api.put(`/api/admin/employees/${id}`, data);
    return res.data;
  } catch (err) {
    if (!err.response) return { success: true, message: 'Employee updated (Demo Mode)', data };
    throw err;
  }
}
