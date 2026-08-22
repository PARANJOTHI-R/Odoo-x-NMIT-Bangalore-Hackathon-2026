import api from './api';

const MOCK_PAYROLL = [
  {
    _id: 'p1',
    period: '2026-07-31',
    basicSalary: 85000,
    allowances: 12000,
    deductions: 5500,
    netSalary: 91500,
    status: 'paid',
    employee: { name: 'Kasim', email: 'kasim@company.com' },
  },
  {
    _id: 'p2',
    period: '2026-06-30',
    basicSalary: 85000,
    allowances: 12000,
    deductions: 5500,
    netSalary: 91500,
    status: 'paid',
    employee: { name: 'Kasim', email: 'kasim@company.com' },
  },
  {
    _id: 'p3',
    period: '2026-05-31',
    basicSalary: 85000,
    allowances: 10000,
    deductions: 5000,
    netSalary: 90000,
    status: 'paid',
    employee: { name: 'Kasim', email: 'kasim@company.com' },
  },
];

const MOCK_ADMIN_PAYROLL = [
  {
    _id: 'ap1',
    userId: 'emp-1',
    basicSalary: 85000,
    allowances: 12000,
    deductions: 5500,
    netSalary: 91500,
    status: 'paid',
    employee: { name: 'Kasim', email: 'kasim@company.com' },
  },
  {
    _id: 'ap2',
    userId: 'emp-2',
    basicSalary: 95000,
    allowances: 15000,
    deductions: 6200,
    netSalary: 103800,
    status: 'paid',
    employee: { name: 'Sarah Connor', email: 'sarah@company.com' },
  },
  {
    _id: 'ap3',
    userId: 'emp-3',
    basicSalary: 72000,
    allowances: 8000,
    deductions: 4500,
    netSalary: 75500,
    status: 'pending',
    employee: { name: 'John Doe', email: 'john@company.com' },
  },
  {
    _id: 'ap4',
    userId: 'emp-4',
    basicSalary: 90000,
    allowances: 11000,
    deductions: 5800,
    netSalary: 95200,
    status: 'paid',
    employee: { name: 'Emily Davis', email: 'emily@company.com' },
  },
];

export async function getMyPayroll() {
  try {
    const res = await api.get('/api/payroll/my');
    return res.data;
  } catch (err) {
    if (!err.response) return MOCK_PAYROLL;
    throw err;
  }
}

export async function getAdminPayroll() {
  try {
    const res = await api.get('/api/admin/payroll');
    return res.data;
  } catch (err) {
    if (!err.response) return MOCK_ADMIN_PAYROLL;
    throw err;
  }
}

export async function updateEmployeePayroll(userId, data) {
  try {
    const res = await api.put(`/api/admin/payroll/${userId}`, data);
    return res.data;
  } catch (err) {
    if (!err.response) return { success: true, message: 'Payroll updated (Demo Mode)' };
    throw err;
  }
}
