import { formatCurrency, formatDate } from '../../utils/formatDate';

/**
 * SalaryCard — displays payslip summary with gradient design.
 *
 * @param {object} payroll  — salary record from API
 */
export default function SalaryCard({ payroll }) {
  const basic      = payroll?.basicSalary   ?? payroll?.basic       ?? 0;
  const allowances = payroll?.allowances    ?? payroll?.bonuses      ?? 0;
  const deductions = payroll?.deductions    ?? payroll?.tax          ?? 0;
  const net        = payroll?.netSalary     ?? payroll?.net          ?? (basic + allowances - deductions);
  const period     = payroll?.period        ?? payroll?.payPeriod    ?? '';
  const status     = payroll?.status;

  return (
    <div className="salary-card">
      <div className="salary-card-label">Net Salary</div>
      <div className="salary-card-amount">{formatCurrency(net)}</div>

      <div className="salary-breakdown">
        <div className="salary-breakdown-item">
          <div className="salary-breakdown-label">Basic</div>
          <div className="salary-breakdown-value">{formatCurrency(basic)}</div>
        </div>
        <div className="salary-breakdown-item">
          <div className="salary-breakdown-label">Allowances</div>
          <div className="salary-breakdown-value">{formatCurrency(allowances)}</div>
        </div>
        <div className="salary-breakdown-item">
          <div className="salary-breakdown-label">Deductions</div>
          <div className="salary-breakdown-value" style={{ color: '#fca5a5' }}>
            -{formatCurrency(deductions)}
          </div>
        </div>
        <div className="salary-breakdown-item">
          <div className="salary-breakdown-label">Status</div>
          <div className="salary-breakdown-value" style={{ fontSize: 13 }}>
            {status ? (
              <span style={{ color: status === 'paid' ? '#6ee7b7' : '#fca5a5' }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            ) : '—'}
          </div>
        </div>
      </div>

      {period && (
        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>
          Pay Period: {formatDate(period)}
        </div>
      )}
    </div>
  );
}
