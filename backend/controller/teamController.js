import {
    getAllTeams,
    createTeam,
    getTeamsByHr,
    assignHrToTeam,
    removeHrFromTeam
} from '../models/teamModel.js';
import { pool } from '../config/postgresdb.js';

export const getTeams = async (req, res) => {
    try {
        const teams = await getAllTeams();
        return res.json({ success: true, data: teams });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const addTeam = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Team name required" });
        const team = await createTeam(name);
        return res.status(201).json({ success: true, data: team });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getHrTeams = async (req, res) => {
    try {
        // Find which teams are assigned to the requesting HR user
        const teams = await getTeamsByHr(req.user.id);
        return res.json({ success: true, data: teams });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const assignTeam = async (req, res) => {
    try {
        const { hrId } = req.params;
        const { teamId } = req.body;
        if (!hrId || !teamId) return res.status(400).json({ success: false, message: "Missing hrId or teamId" });
        
        await assignHrToTeam(hrId, teamId);
        return res.json({ success: true, message: "Team assigned successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const unassignTeam = async (req, res) => {
    try {
        const { hrId, teamId } = req.params;
        await removeHrFromTeam(hrId, teamId);
        return res.json({ success: true, message: "Team unassigned successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getHrTeamAssignments = async (req, res) => {
    try {
        const assignments = await pool.query(`
            SELECT hta.hr_user_id, hta.team_id, t.name as team_name, u.name as hr_name
            FROM hr_team_assignments hta
            JOIN teams t ON t.id = hta.team_id
            JOIN users u ON u.id = hta.hr_user_id
        `);
        return res.json({ success: true, data: assignments.rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
