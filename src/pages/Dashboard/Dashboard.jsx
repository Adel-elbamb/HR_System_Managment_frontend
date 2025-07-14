import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import axiosInstance from '../../services/axiosInstance';
import { deleteEmployee } from "../../services/employee.services";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [employeesRes, attendanceRes] = await Promise.all([
        axiosInstance.get('/employee'),
        axiosInstance.get('/attendance')
      ]);

      const employeesData = employeesRes.data.data || [];
      const attendanceData = attendanceRes.data.data || [];

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      const employeesToday = employeesData.filter(emp => {
        const dateStr = new Date(emp.createdAt).toISOString().slice(0, 10);
        return dateStr === todayStr;
      }).length;

      const employeesYesterday = employeesData.filter(emp => {
        const dateStr = new Date(emp.createdAt).toISOString().slice(0, 10);
        return dateStr === yesterdayStr;
      }).length;

      const presentToday = attendanceData.filter(att => {
        const dateStr = new Date(att.date).toISOString().slice(0, 10);
        return dateStr === todayStr && att.status === 'present';
      }).length;

      const onLeave = attendanceData.filter(att => {
        const dateStr = new Date(att.date).toISOString().slice(0, 10);
        return dateStr === todayStr && att.status === 'On Leave';
      }).length;

      const presentYesterday = attendanceData.filter(att => {
        const dateStr = new Date(att.date).toISOString().slice(0, 10);
        return dateStr === yesterdayStr && att.status === 'present';
      }).length;

      const leaveYesterday = attendanceData.filter(att => {
        const dateStr = new Date(att.date).toISOString().slice(0, 10);
        return dateStr === yesterdayStr && att.status === 'On Leave';
      }).length;

      const totalEmployees = employeesData.length;
      const departments = new Set(employeesData.map(emp => emp.department)).size;

      const calcChange = (current, previous) => {
        if (previous === 0) return current === 0 ? 0 : 100;
        return Math.round(((current - previous) / previous) * 100);
      };

      const statsData = {
        totalEmployees,
        presentToday,
        onLeave,
        departments,
        totalChange: calcChange(employeesToday, employeesYesterday),
        presentChange: calcChange(presentToday, presentYesterday),
        leaveChange: calcChange(onLeave, leaveYesterday),
        departmentsChange: 0
      };

      setStats(statsData);
      setEmployees(employeesData.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        departments: 0,
        totalChange: 0,
        presentChange: 0,
        leaveChange: 0,
        departmentsChange: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    await deleteEmployee(id);
    fetchData();
  };

  if (loading) {
    return (
      <div className={`container-fluid py-4 ${styles.dashboard}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className={`container-fluid py-4 ${styles.dashboard}`}>
        <div className="row g-4 mb-4 justify-content-center mx-4">
          {stats && (
            <>
              <div className="col-xl-3 col-lg-3 col-md-6 p-0">
                <DashboardCard title="Total Employees" value={stats.totalEmployees} icon="people" change={stats.totalChange} />
              </div>
              <div className="col-xl-3 col-lg-3 col-md-6 p-0">
                <DashboardCard title="Present Today" value={stats.presentToday} icon="calendar-check" change={stats.presentChange} />
              </div>
              <div className="col-xl-3 col-lg-3 col-md-6 p-0">
                <DashboardCard title="On Leave" value={stats.onLeave} icon="calendar-x" change={stats.leaveChange} />
              </div>
              <div className="col-xl-3 col-lg-3 col-md-6 p-0">
                <DashboardCard title="Departments" value={stats.departments} icon="building" change={stats.departmentsChange} />
              </div>
            </>
          )}
        </div>

        <div className={`p-4 mx-4 ${styles.recentEmployees}`}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>Recent Employees</h5>
            <a className={`btn btn-primary ${styles.addButton}`} href="/add-employee">
              <i className="bi bi-plus-lg me-2"></i> Add Employee
            </a>
          </div>
          {employees.length > 0 ? (
            employees.map((emp) => (
              <div key={emp._id} className={`d-flex align-items-center justify-content-between p-3 ${styles.employeeCard}`}>
                <div className="d-flex align-items-center gap-3">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${styles.userIcon}`}>
                    <i className="bi bi-person fs-4 text-white"></i>
                  </div>
                  <div>
                    <div className="fw-semibold text-dark">{emp.name}</div>
                    <div className="text-muted small">{emp.department?.departmentName || 'No Department'}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className={styles.statusBadge}>Active</span>
                  <span className="text-muted small">{new Date(emp.createdAt).toLocaleDateString()}</span>
                  <a href={`/employee/${emp._id}`}><i className={`bi bi-eye ${styles.actionIcon}`} title="View Details"></i></a>
                  <a href={`/edit-employee/${emp._id}`}><i className={`bi bi-pencil ${styles.actionIcon}`} title="Edit Employee"></i></a>
                  <button
                    className="btn btn-sm btn-light border"
                    title="Delete"
                    onClick={() => handleDelete(emp._id)}
                  >
                    <i className="fas fa-trash text-danger"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <i className="bi bi-people"></i>
              </div>
              <p className="mb-0">No employees found</p>
              <small className="text-muted">Add your first employee to get started</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, change }) => (
  <div className={`${styles.statCard} p-4`}>
    <div className="text-muted small mb-2">{title}</div>
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div className="fs-3 fw-bold text-dark">{value}</div>
      <div className={styles.statIcon}>
        <i className={`bi bi-${icon}`}></i>
      </div>
    </div>
    <div className={`small ${change >= 0 ? 'text-success' : 'text-danger'}`}>
      <i className={`bi bi-${change >= 0 ? 'arrow-up' : 'arrow-down'} me-1`}></i>
      {change >= 0 ? `+${change}%` : `${change}%`} from yesterday
    </div>
  </div>
);

export default Dashboard;
