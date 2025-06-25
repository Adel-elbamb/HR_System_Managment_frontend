import { useState, useEffect } from "react";
import { Container, Row, Col, Table, Form } from "react-bootstrap";
import Button from "./../../components/common/Button";
import axiosInstance from "./../../services/axiosInstance"; 
import styles from "./Payroll.module.css";

function Payroll() {
  const [payroll, setPayroll] = useState(null);
  const [filteredPayroll, setFilteredPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Fetch payroll data
  useEffect(() => {
    axiosInstance
      .get("/payroll")
      .then((response) => {
        console.log("API Data:", response.data);
        const payrollData = response.data.data.payroll || [];
        setPayroll(payrollData);
        setFilteredPayroll(payrollData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter payroll data based on search term and date
  useEffect(() => {
    if (!payroll) return;

    const filtered = payroll.filter((record) => {
      const fullName = record.employeeId
        ? `${record.employeeId.firstName} ${record.employeeId.lastName}`.toLowerCase()
        : "";
      const matchesName = fullName.includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (selectedMonth || selectedYear) {
        const recordDate = new Date(record.date);
        const recordMonth = recordDate.getMonth() + 1; // Months are 0-based in JS
        const recordYear = recordDate.getFullYear();
        matchesDate =
          (!selectedMonth || recordMonth === parseInt(selectedMonth)) &&
          (!selectedYear || recordYear === parseInt(selectedYear));
      }

      return matchesName && matchesDate;
    });

    setFilteredPayroll(filtered);
  }, [payroll, searchTerm, selectedMonth, selectedYear]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!filteredPayroll || filteredPayroll.length === 0) return <div>No payroll data found.</div>;

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className={styles.pageBackground}>
      <Container className={styles.payrollContainer}>
        <Row className={`${styles.header} align-items-center mb-4`}>
          <Col>
            <h2 className={styles.title}>Payroll Management</h2>
            <p className={`${styles.subtitle} text-muted`}>Manage employee payroll records.</p>
          </Col>
          <Col xs="auto">
            <Button
              variant="primary"
              size="sm"
              className={styles.addButton}
            >
              + Add Payroll Record
            </Button>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="searchName">
                    <Form.Control
                      type="text"
                      placeholder="Search by employee name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="searchMonth">
                    <Form.Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={styles.searchInput}
                    >
                      <option value="">Select Month</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="searchYear">
                    <Form.Select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className={styles.searchInput}
                    >
                      <option value="">Select Year</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table responsive className={styles.payrollTable}>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Salary</th>
                  <th>Bonus</th>
                  <th>Deduction</th>
                  <th>Days of Absence</th>
                  <th>Hourly Discount</th>
                  <th>Net Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayroll.map((record) => (
                  <tr key={record._id} className={styles.tableRow}>
                    <td>
                      {record.employeeId
                        ? `${record.employeeId.firstName} ${record.employeeId.lastName}`
                        : "N/A"}
                    </td>
                    <td>{record.salary || "N/A"}</td>
                    <td>{record.totalBonusAmount || 0}</td>
                    <td>{record.totalDeduction || 0}</td>
                    <td>{record.absentDays || 0}</td>
                    <td>{record.totalOvertime ? `$${record.totalOvertime}/hr` : "$0/hr"}</td>
                    <td>{record.netSalary ? `$${record.netSalary.toFixed(2)}` : "$0.00"}</td>
                    <td>
                      <span className={`${styles.actionIcon} me-2`}>✎</span>
                      <span className={styles.actionIcon}>🗑</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Payroll;