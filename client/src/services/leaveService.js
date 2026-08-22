import api from './api';

const MOCK_LEAVES = [
  {
    _id: 'l1',
    leaveType: 'annual',
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    reason: 'Annual family vacation',
    status: 'approved',
    createdAt: '2026-08-10',
    employee: { name: 'Kasim', email: 'kasim@company.com' },
  },
  {
    _id: 'l2',
    leaveType: 'sick',
    startDate: '2026-08-18',
    endDate: '2026-08-18',
    reason: 'Fever and rest',
    status: 'approved',
    createdAt: '2026-08-17',
    employee: { name: 'Kasim', email: 'kasim@company.com' },
  },
  {
    _id: 'l3',
    leaveType: 'casual',
    startDate: '2026-08-28',
    endDate: '2026-08-29',
    reason: 'Personal urgent work',
    status: 'pending',
    createdAt: '2026-08-21',
    employee: { name: 'Kasim', email: 'kasim@company.com' },
  },
  {
    _id: 'l4',
    leaveType: 'annual',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    reason: 'Attending tech conference',
    status: 'pending',
    createdAt: '2026-08-22',
    employee: { name: 'Sarah Connor', email: 'sarah@company.com' },
  },
];

export async function applyLeave(data) {
  try {
    const res = await api.post('/api/leave/apply', data);
    return res.data;
  } catch (err) {
    if (!err.response) {
      return { success: true, message: 'Leave applied (Demo Mode)', data: { ...data, status: 'pending' } };
    }
    throw err;
  }
}

export async function getMyLeaves() {
  try {
    const res = await api.get('/api/leave/my');
    return res.data;
  } catch (err) {
    if (!err.response) return MOCK_LEAVES;
    throw err;
  }
}

export async function getAdminLeaves() {
  try {
    const res = await api.get('/api/admin/leave');
    return res.data;
  } catch (err) {
    if (!err.response) return MOCK_LEAVES;
    throw err;
  }
}

export async function approveLeave(id) {
  try {
    const res = await api.put(`/api/admin/leave/${id}/approve`);
    return res.data;
  } catch (err) {
    if (!err.response) return { success: true, message: 'Leave approved (Demo Mode)' };
    throw err;
  }
}

export async function rejectLeave(id) {
  try {
    const res = await api.put(`/api/admin/leave/${id}/reject`);
    return res.data;
  } catch (err) {
    if (!err.response) return { success: true, message: 'Leave rejected (Demo Mode)' };
    throw err;
  }
}
