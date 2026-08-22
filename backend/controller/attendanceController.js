import {
    getTodayAttendance,
    getAllAttendanceForUser,
    getAllAttendanceAdmin,
    createCheckIn,
    createCheckOut,
} from '../models/attendanceModel.js';

// Normalize DB row to camelCase so the client gets what it expects
function normalizeRecord(r) {
    if (!r) return null;
    return {
        id:         r.id,
        userId:     r.user_id,
        date:       r.date,
        checkIn:    r.check_in,
        checkOut:   r.check_out,
        status:     r.status,
        createdAt:  r.created_at,
        updatedAt:  r.updated_at,
        // Admin-join fields (present on admin queries)
        name:       r.name,
        email:      r.email,
        department: r.department,
        position:   r.position,
    };
}

// POST /api/attendance/checkin
export const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const existing = await getTodayAttendance(userId);
        if (existing?.check_in) {
            return res.status(400).json({ success: false, message: 'Already checked in today' });
        }
        const record = await createCheckIn(userId);
        return res.status(201).json({ success: true, data: normalizeRecord(record) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to check in' });
    }
};

// POST /api/attendance/checkout
export const checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const existing = await getTodayAttendance(userId);
        if (!existing?.check_in) {
            return res.status(400).json({ success: false, message: 'You have not checked in today' });
        }
        if (existing?.check_out) {
            return res.status(400).json({ success: false, message: 'Already checked out today' });
        }
        const record = await createCheckOut(userId);
        return res.status(200).json({ success: true, data: normalizeRecord(record) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to check out' });
    }
};

// GET /api/attendance/my
export const getMyAttendance = async (req, res) => {
    try {
        const records = await getAllAttendanceForUser(req.user.id);
        return res.status(200).json({ success: true, data: records.map(normalizeRecord) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
    }
};

// GET /api/admin/attendance
export const getAdminAttendance = async (req, res) => {
    try {
        const records = await getAllAttendanceAdmin(req.user.id, req.user.role);
        return res.status(200).json({ success: true, data: records.map(normalizeRecord) });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
    }
};

