import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getMyPayroll } from '../../services/payrollService';
import SalaryCard from '../../components/employee/SalaryCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatCurrency } from '../../utils/formatDate';

function PayrollHistoryRow({ payroll }) {
  const net    = payroll?.netSalary ?? payroll?.net ?? 0;
  const period = payroll?.period ?? payroll?.payPeriod ?? payroll?.month ?? '';
  const status = payroll?.status;

  const badgeCls = status === 'paid' ? 'badge-success' : status === 'pending' ? 'badge-warning' : 'badge-default';

  return (
    <tr>
      <td style={{ fontWeight: 500 }}>{period ? formatDate(period) : '—'}</td>
      <td>{formatCurrency(payroll?.basicSalary ?? payroll?.basic ?? 0)}</td>
      <td>{formatCurrency(payroll?.allowances ?? 0)}</td>
      <td style={{ color: 'var(--error)' }}>-{formatCurrency(payroll?.deductions ?? 0)}</td>
      <td style={{ fontWeight: 600 }}>{formatCurrency(net)}</td>
      <td>
        {status && <span className={`badge ${badgeCls}`}>{status}</span>}
      </td>
    </tr>
  );
}

export default function PayrollPage() {
  const { user }       = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPayroll()
      .then((res) => {
        const d = res?.data ?? res ?? [];
        setData(Array.isArray(d) ? d : [d]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest    = data[0] ?? null;
  const history   = data.slice(1);

  const totalEarned = data.reduce((sum, p) => sum + (p?.netSalary ?? p?.net ?? 0), 0);

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-header-title">Payroll</h1>
        <p className="page-header-sub">Your salary information and payment history</p>
      </div>

      {loading ? (
        <LoadingSpinner overlay label="Loading payroll…" />
      ) : data.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon"><CreditCard size={28} /></div>
          <div className="empty-state-title">No payroll data</div>
          <div className="empty-state-desc">Your salary records will appear here once processed by the admin.</div>
        </div>
      ) : (
        <div className="content-grid">
          {/* Left — current payslip + history */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {latest && (
              <div>
                <h2 className="card-title" style={{ marginBottom: 12 }}>Current Payslip</h2>
                <SalaryCard payroll={latest} />
              </div>
            )}

            {/* History table */}
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 16 }}>Payment History</h2>
              {history.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="empty-state-title" style={{ fontSize: 13 }}>No previous records</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Pay Period</th>
                        <th>Basic</th>
                        <th>Allowances</th>
                        <th>Deductions</th>
                        <th>Net Pay</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((p, i) => (
                        <PayrollHistoryRow key={p._id ?? p.id ?? i} payroll={p} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right — summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', color: 'white', border: 'none' }}>
              <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Earned (YTD)
              </div>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1, marginBottom: 12 }}>
                {formatCurrency(totalEarned)}
              </div>
              <div style={{ fontSize: 13, opacity: 0.75, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={14} />
                Across {data.length} pay period{data.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 14 }}>Payslip Details</h2>
              {latest && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Employee',   value: user?.name ?? '—' },
                    { label: 'Email',      value: user?.email ?? '—' },
                    { label: 'Department', value: user?.department ?? '—' },
                    { label: 'Position',   value: user?.position ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
