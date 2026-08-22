import { useState } from 'react';
import { Search, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateEmployee } from '../../services/profileService';
import LoadingSpinner from '../common/LoadingSpinner';

function RoleBadge({ role }) {
  return (
    <span className={`badge ${role === 'admin' ? 'badge-info' : 'badge-default'}`}>
      {role ?? 'employee'}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`badge ${active !== false ? 'badge-success' : 'badge-error'}`}>
      {active !== false ? 'Active' : 'Inactive'}
    </span>
  );
}

/**
 * EmployeeTable — searchable, editable employee list.
 *
 * @param {object[]} employees — from GET /api/admin/employees
 * @param {boolean}  loading
 * @param {Function} onUpdate — called after successful edit
 */
export default function EmployeeTable({ employees = [], loading = false, onUpdate }) {
  const [query,      setQuery]      = useState('');
  const [editingId,  setEditingId]  = useState(null);
  const [editData,   setEditData]   = useState({});
  const [saving,     setSaving]     = useState(false);

  const filtered = employees.filter((e) => {
    const q = query.toLowerCase();
    return (
      (e.name       ?? '').toLowerCase().includes(q) ||
      (e.email      ?? '').toLowerCase().includes(q) ||
      (e.department ?? '').toLowerCase().includes(q) ||
      (e.role       ?? '').toLowerCase().includes(q)
    );
  });

  function startEdit(emp) {
    setEditingId(emp._id ?? emp.id);
    setEditData({
      name:       emp.name       ?? '',
      department: emp.department ?? '',
      position:   emp.position   ?? '',
      role:       emp.role       ?? 'employee',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      await updateEmployee(id, editData);
      toast.success('Employee updated');
      setEditingId(null);
      onUpdate?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Search bar */}
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <Search className="search-icon" size={15} aria-hidden="true" />
        <input
          id="employee-search-input"
          type="search"
          className="form-control"
          placeholder="Search employees…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search employees"
        />
      </div>

      {loading ? (
        <LoadingSpinner overlay label="Loading employees…" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No employees found</div>
          <div className="empty-state-desc">
            {query ? 'Try a different search term.' : 'No employee records available yet.'}
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const id      = emp._id ?? emp.id;
                const editing = editingId === id;

                return (
                  <tr key={id}>
                    {/* Employee info */}
                    <td>
                      <div className="flex-gap">
                        <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                          {(emp.name ?? 'E')[0].toUpperCase()}
                        </div>
                        <div>
                          {editing ? (
                            <input
                              className="form-control"
                              style={{ padding: '4px 8px', fontSize: 13 }}
                              value={editData.name}
                              onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                              aria-label="Employee name"
                            />
                          ) : (
                            <>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name ?? '—'}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{emp.email ?? '—'}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td>
                      {editing ? (
                        <input
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: 13 }}
                          value={editData.department}
                          onChange={(e) => setEditData((d) => ({ ...d, department: e.target.value }))}
                          placeholder="Department"
                          aria-label="Department"
                        />
                      ) : (
                        <span style={{ fontSize: 14 }}>{emp.department ?? '—'}</span>
                      )}
                    </td>

                    {/* Position */}
                    <td>
                      {editing ? (
                        <input
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: 13 }}
                          value={editData.position}
                          onChange={(e) => setEditData((d) => ({ ...d, position: e.target.value }))}
                          placeholder="Position"
                          aria-label="Position"
                        />
                      ) : (
                        <span style={{ fontSize: 14 }}>{emp.position ?? '—'}</span>
                      )}
                    </td>

                    {/* Role */}
                    <td>
                      {editing ? (
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: 13 }}
                          value={editData.role}
                          onChange={(e) => setEditData((d) => ({ ...d, role: e.target.value }))}
                          aria-label="Role"
                        >
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <RoleBadge role={emp.role} />
                      )}
                    </td>

                    {/* Status */}
                    <td><StatusBadge active={emp.isActive ?? emp.active} /></td>

                    {/* Actions */}
                    <td>
                      {editing ? (
                        <div className="flex-gap">
                          <button
                            id={`save-employee-${id}`}
                            className="btn btn-success btn-sm"
                            onClick={() => saveEdit(id)}
                            disabled={saving}
                            type="button"
                          >
                            {saving ? <LoadingSpinner size="sm" /> : <Check size={14} />}
                          </button>
                          <button
                            id={`cancel-employee-${id}`}
                            className="btn btn-secondary btn-sm"
                            onClick={cancelEdit}
                            type="button"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`edit-employee-${id}`}
                          className="btn btn-ghost btn-sm"
                          onClick={() => startEdit(emp)}
                          type="button"
                          aria-label={`Edit ${emp.name}`}
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
