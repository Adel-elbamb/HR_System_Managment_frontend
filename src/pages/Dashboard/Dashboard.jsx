import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { getAllEmployees, deleteEmployee } from '../../services/employee.services';
import { getAttendences } from '../../services/Attendence.services';
import axiosInstance from "../../services/axiosInstance";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const getLastWorkingDay = (dateStr, holidayDates) => {
    let date = new Date(dateStr);
    for (let i = 0; i < 10; i++) { 
      date.setDate(date.getDate() - 1);
      const checkStr = date.toISOString().slice(0, 10);
      if (!holidayDates.includes(checkStr)) {
        return checkStr;
      }
    }
    return null;
  };
  const getLastWorkingDayOrToday = (holidayDates) => {
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const tryDate = new Date(now);
    tryDate.setDate(now.getDate() - i);
    const dateStr = tryDate.toISOString().slice(0, 10);
    if (!holidayDates.includes(dateStr)) return dateStr;
  }
  return now.toISOString().slice(0, 10);
};
  const fetchData = async () => {
    try {
      setLoading(true);

      const [employeeRes, attendanceRes, departmentRes, holidaysRes] = await Promise.all([
        getAllEmployees(),
        getAttendences(),
        axiosInstance.get("/department/"),
        axiosInstance.get("/holiday/")
      ]);
      const holidays = holidaysRes?.data?.holiday || holidaysRes?.data || [];
      const holidayDates = holidays.map(h => h.date);
      const employeesData = employeeRes?.data || [];
      const attendance = attendanceRes || [];
      console.log("Attendance Data:", attendance);
      const departmentsData = departmentRes?.data?.data || departmentRes?.data || [];

      const now = new Date();
      const todayStr = getLastWorkingDayOrToday(holidayDates);

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = getLastWorkingDay(todayStr, holidayDates);

      const getDateStr = (dateStr) => {
        if (!dateStr) return null;
        const match = dateStr.match(/\d{2}\/\d{2}\/\d{4}$/);
        return match ? match[0].split('/').reverse().join('-') : null;
      };

      // Employees
      const employeesToday = employeesData.filter(emp =>
        emp.createdAt?.slice(0, 10) === todayStr
      ).length;

      const employeesYesterday = employeesData.filter(emp =>
        emp.createdAt?.slice(0, 10) === yesterdayStr
      ).length;

      // Attendance
      const presentToday = attendance.filter(att =>
        getDateStr(att.date) === todayStr && att.status === 'present'
      ).length;
      console.log("Present Today:", presentToday);
      const presentYesterday = attendance.filter(att =>
        getDateStr(att.date) === yesterdayStr && att.status === 'present'
      ).length;
      console.log("Present Yesterday:", presentYesterday);
      const onLeave = attendance.filter(att =>
        getDateStr(att.date) === todayStr && att.status === 'On Leave'
      ).length;
      console.log("On Leave Today:", onLeave);
      const leaveYesterday = attendance.filter(att =>
        getDateStr(att.date) === yesterdayStr && att.status === 'On Leave'
      ).length;
      console.log("On Leave Yesterday:", leaveYesterday);
      // Departments
      const departmentsToday = departmentsData.filter(dep =>
        dep.createdAt?.slice(0, 10) === todayStr
      ).length;

      const departmentsYesterday = departmentsData.filter(dep =>
        dep.createdAt?.slice(0, 10) === yesterdayStr
      ).length;

      const departmentsCountNow = departmentsData.length;

      const calcChange = (current, previous) => {
        if (previous === 0) return current === 0 ? 0 : 100;
        return Math.round(((current - previous) / previous) * 100);
      };

      const statsData = {
        totalEmployees: employeesData.length,
        presentToday,
        onLeave,
        departments: departmentsCountNow,
        totalChange: calcChange(employeesToday, employeesYesterday),
        presentChange: calcChange(presentToday, presentYesterday),
        leaveChange: calcChange(onLeave, leaveYesterday),
        departmentsChange: calcChange(departmentsToday, departmentsYesterday)
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
      setEmployees([]);
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
                    <div className="fw-semibold text-dark">{emp.firstName} {emp.lastName}</div>
                    <div className="text-muted small">{emp.department || 'No Department'}</div>
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
