import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [hrUsers, setHrUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);

  const [selectedHr, setSelectedHr] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [teamsRes, employeesRes, assignRes] = await Promise.all([
        api.get('/api/teams'),
        api.get('/api/admin/employees'), // We filter this for HRs
        api.get('/api/teams/assignments')
      ]);
      setTeams(teamsRes.data?.data || []);
      setHrUsers((employeesRes.data?.data || []).filter(u => u.role === 'hr'));
      setAssignments(assignRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreateTeam(e) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreating(true);
    try {
      await api.post('/api/teams', { name: newTeamName });
      toast.success('Team created');
      setNewTeamName('');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!selectedHr || !selectedTeam) return;
    setAssigning(true);
    try {
      await api.post(`/api/teams/hr/${selectedHr}/assign`, { teamId: selectedTeam });
      toast.success('Assigned HR to team');
      setSelectedHr('');
      setSelectedTeam('');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign HR');
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassign(hrId, teamId) {
    try {
      await api.delete(`/api/teams/hr/${hrId}/assign/${teamId}`);
      toast.success('Unassigned HR from team');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to unassign');
    }
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-header-title">Teams & HR Allocation</h1>
        <p className="page-header-sub">Manage teams and assign HR managers to them</p>
      </div>

      {loading ? (
        <LoadingSpinner overlay />
      ) : (
        <div className="content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Create Team */}
            <div className="card">
              <h2 className="card-title">Create Team</h2>
              <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <input
                  className="form-control"
                  placeholder="Team Name (e.g. Engineering)"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={creating || !newTeamName}>
                  <Plus size={16} /> Add Team
                </button>
              </form>
            </div>

            {/* Existing Teams List */}
            <div className="card">
              <h2 className="card-title">All Teams</h2>
              {teams.length === 0 ? (
                <div style={{ marginTop: 16, color: 'var(--text-secondary)' }}>No teams created yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {teams.map(t => (
                    <li key={t.id} style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8, fontWeight: 500 }}>
                      {t.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Assign HR to Team */}
            <div className="card">
              <h2 className="card-title">Assign HR to Team</h2>
              <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <select className="form-control" value={selectedHr} onChange={e => setSelectedHr(e.target.value)}>
                  <option value="">Select HR Manager...</option>
                  {hrUsers.map(hr => (
                    <option key={hr.id} value={hr.id}>{hr.name} ({hr.email})</option>
                  ))}
                </select>
                <select className="form-control" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                  <option value="">Select Team...</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary" disabled={assigning || !selectedHr || !selectedTeam}>
                  <ShieldCheck size={16} /> Assign to Team
                </button>
              </form>
            </div>

            {/* Current Assignments */}
            <div className="card">
              <h2 className="card-title">Current HR Assignments</h2>
              {assignments.length === 0 ? (
                <div style={{ marginTop: 16, color: 'var(--text-secondary)' }}>No HR assignments yet.</div>
              ) : (
                <div className="table-wrapper" style={{ marginTop: 16 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>HR Manager</th>
                        <th>Team</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(a => (
                        <tr key={`${a.hr_user_id}-${a.team_id}`}>
                          <td style={{ fontWeight: 500 }}>{a.hr_name}</td>
                          <td><span className="badge badge-info">{a.team_name}</span></td>
                          <td>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ color: 'var(--error)' }}
                              onClick={() => handleUnassign(a.hr_user_id, a.team_id)}
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
