import {
    getLeavesByUser,
    getAllLeaves,
    createLeave,
    updateLeaveStatus,
} from '../models/leaveModel.js';

// Normalize DB row to camelCase for client compatibility
function normalizeLeave(l) {
    if (!l) return null;
    return {
        id:          l.id,
        userId:      l.user_id,
        leaveType:   l.leave_type,
        startDate:   l.start_date,
        endDate:     l.end_date,
        reason:      l.reason,
        status:      l.status,
        approvedBy:  l.approved_by,
        createdAt:   l.created_at,
        updatedAt:   l.updated_at,
        // Admin-join fields
        name:        l.name,
        email:       l.email,
        department:  l.department,
    };
}

// POST /api/leave/apply
export const applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        if (!leaveType || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'leaveType, startDate and endDate are required' });
        }
        const leave = await createLeave({ userId: req.user.id, leaveType, startDate, endDate, reason });
        return res.status(201).json({ success: true, data: normalizeLeave(leave) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to submit leave request' });
    }
};

// GET /api/leave/my
export const getMyLeaves = async (req, res) => {
    try {
        const leaves = await getLeavesByUser(req.user.id);
        return res.status(200).json({ success: true, data: leaves.map(normalizeLeave) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
    }
};

// GET /api/admin/leave
export const getAdminLeaves = async (req, res) => {
    try {
        const leaves = await getAllLeaves(req.user.id, req.user.role);
        return res.status(200).json({ success: true, data: leaves.map(normalizeLeave) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
    }
};

// PUT /api/admin/leave/:id/approve
export const approveLeave = async (req, res) => {
    try {
        const leave = await updateLeaveStatus(req.params.id, 'approved', req.user.id);
        if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
        return res.status(200).json({ success: true, data: normalizeLeave(leave) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to approve leave' });
    }
};

// PUT /api/admin/leave/:id/reject
export const rejectLeave = async (req, res) => {
    try {
        const leave = await updateLeaveStatus(req.params.id, 'rejected', req.user.id);
        if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
        return res.status(200).json({ success: true, data: normalizeLeave(leave) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to reject leave' });
    }
};

