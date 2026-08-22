import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAdminPayroll, updateEmployeePayroll } from '../../services/payrollService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatDate';
import { Edit2, Save, X } from 'lucide-react';

export default function AdminPayrollPage() {
  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ basicSalary: '', allowances: '', deductions: '' });
  const [saving, setSaving] = useState(false);

  const loadPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminPayroll();
      const data = res?.data ?? res ?? [];
      setPayrollList(Array.isArray(data) ? data : []);
    } catch {
      setPayrollList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  function startEdit(item) {
    const id = item._id ?? item.id ?? item.userId;
    setEditingId(id);
    setFormData({
      basicSalary: item.basicSalary ?? item.basic ?? 0,
      allowances: item.allowances ?? 0,
      deductions: item.deductions ?? 0,
    });
  }

  async function handleSave(userId) {
    setSaving(true);
    try {
      await updateEmployeePayroll(userId, {
        basicSalary: Number(formData.basicSalary),
        allowances: Number(formData.allowances),
        deductions: Number(formData.deductions),
      });
      toast.success('Payroll updated successfully');
      setEditingId(null);
      loadPayroll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update payroll');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-header-title">Payroll Management</h1>
        <p className="page-header-sub">Manage salary structures and employee payments</p>
      </div>

      {loading ? (
        <LoadingSpinner overlay label="Loading payroll information..." />
      ) : (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 16 }}>Employee Payroll List</h2>
          {payrollList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No payroll data available</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Basic Salary</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollList.map((item, index) => {
                    const id = item._id ?? item.id ?? item.userId ?? index;
                    const isEditing = editingId === id;
                    const basic = isEditing ? Number(formData.basicSalary) : (item.basicSalary ?? item.basic ?? 0);
                    const allow = isEditing ? Number(formData.allowances) : (item.allowances ?? 0);
                    const ded = isEditing ? Number(formData.deductions) : (item.deductions ?? 0);
                    const net = basic + allow - ded;

                    return (
                      <tr key={id}>
                        <td style={{ fontWeight: 500 }}>
                          {item.employee?.name ?? item.name ?? item.user?.name ?? 'Employee'}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="form-control"
                              style={{ width: 110, padding: '4px 8px' }}
                              value={formData.basicSalary}
                              onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                            />
                          ) : (
                            formatCurrency(basic)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="form-control"
                              style={{ width: 100, padding: '4px 8px' }}
                              value={formData.allowances}
                              onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                            />
                          ) : (
                            formatCurrency(allow)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="form-control"
                              style={{ width: 100, padding: '4px 8px' }}
                              value={formData.deductions}
                              onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                            />
                          ) : (
                            <span style={{ color: 'var(--error)' }}>-{formatCurrency(ded)}</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(net)}</td>
                        <td>
                          <span className={`badge ${item.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                            {item.status ?? 'Pending'}
                          </span>
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="flex-gap">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleSave(item.userId ?? id)}
                                disabled={saving}
                                type="button"
                              >
                                {saving ? <LoadingSpinner size="sm" /> : <Save size={14} />}
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditingId(null)}
                                type="button"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => startEdit(item)}
                              type="button"
                            >
                              <Edit2 size={14} /> Edit
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
      )}
    </div>
  );
}
