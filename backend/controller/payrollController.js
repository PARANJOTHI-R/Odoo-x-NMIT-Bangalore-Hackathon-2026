import { getPayrollByUser, getAllPayroll, upsertPayroll } from '../models/payrollModel.js';

// Normalize DB row to camelCase for client compatibility
function normalizePayroll(p) {
    if (!p) return null;
    
    // Calculate net if not in DB directly
    const basic = Number(p.basic_salary) || 0;
    const allowances = Number(p.allowances) || 0;
    const deductions = Number(p.deductions) || 0;
    const net = basic + allowances - deductions;

    return {
        id:          p.id,
        userId:      p.user_id,
        period:      `${p.year}-${String(p.month).padStart(2, '0')}-01`, // Create a date string for 'period'
        month:       p.month,
        year:        p.year,
        basicSalary: basic,
        allowances:  allowances,
        deductions:  deductions,
        netSalary:   net,
        status:      p.status,
        paidOn:      p.paid_on,
        createdAt:   p.created_at,
        updatedAt:   p.updated_at,
        // Admin-join fields
        name:        p.name,
        email:       p.email,
        department:  p.department,
        position:    p.position,
    };
}

// GET /api/payroll/my
export const getMyPayroll = async (req, res) => {
    try {
        const records = await getPayrollByUser(req.user.id);
        return res.status(200).json({ success: true, data: records.map(normalizePayroll) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch payroll records' });
    }
};

// GET /api/admin/payroll
export const getAdminPayroll = async (req, res) => {
    try {
        const records = await getAllPayroll(req.user.id, req.user.role);
        return res.status(200).json({ success: true, data: records.map(normalizePayroll) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch payroll records' });
    }
};

// PUT /api/admin/payroll/:userId
export const updateEmployeePayroll = async (req, res) => {
    try {
        const { userId } = req.params;
        const { month, year, basicSalary, allowances, deductions, status, paidOn } = req.body;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'month and year are required' });
        }

        const record = await upsertPayroll(userId, { month, year, basicSalary, allowances, deductions, status, paidOn });
        return res.status(200).json({ success: true, data: normalizePayroll(record) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update payroll record' });
    }
};

