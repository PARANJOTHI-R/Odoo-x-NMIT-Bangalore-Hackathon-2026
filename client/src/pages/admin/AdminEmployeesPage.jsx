import { useEffect, useState, useCallback } from 'react';
import { getAdminEmployees } from '../../services/profileService';
import EmployeeTable from '../../components/admin/EmployeeTable';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getAdminEmployees();
      const data = res?.data ?? res ?? [];
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-header-title">Employee Management</h1>
        <p className="page-header-sub">View and manage all employees in your organisation</p>
      </div>
      <div className="card">
        <EmployeeTable employees={employees} loading={loading} onUpdate={load} />
      </div>
    </div>
  );
}
