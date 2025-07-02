import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Modal } from "react-bootstrap";
import Button from "./../../../components/common/Button";
import axiosInstance from "./../../../services/axiosInstance"; // Import the custom axios instance
import styles from "./ViewDepartment.module.css";

function Department() {
  const [departments, setDepartments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [editDepartment, setEditDepartment] = useState(null);

  // Fetch existing departments
  useEffect(() => {
    axiosInstance
      .get("/department/") // Relative path since baseURL is set in axiosInstance
      .then((response) => {
        console.log("API Data:", response.data);
        setDepartments(response.data.data || response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Add a new department
  const handleAddDepartment = async () => {
    try {
      const response = await axiosInstance.post("/department/", {
        departmentName: newDepartmentName,
      });
      console.log("POST Response:", response.data);
      setDepartments((prev) => [...(prev || []), response.data.data]);
      setNewDepartmentName("");
      setShowAddModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit a department
  const handleEditDepartment = async () => {
    if (editDepartment && editDepartment._id) {
      try {
        const response = await axiosInstance.put(
          `/department/${editDepartment._id}`,
          { departmentName: newDepartmentName }
        );
        console.log("PUT Response:", response.data);
        setDepartments((prev) =>
          prev.map((dept) =>
            dept._id === editDepartment._id ? response.data.data : dept
          )
        );
        setNewDepartmentName("");
        setEditDepartment(null);
        setShowEditModal(false);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Delete a department
  const handleDeleteDepartment = async (id) => {
    try {
      await axiosInstance.delete(`/department/${id}`);
      console.log("DELETE Response:", `Deleted department with id ${id}`);
      setDepartments((prev) => prev.filter((dept) => dept._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!departments) return <div>No department data found.</div>;

  return (
    <div className={styles.containerBackground}>
      <Container className={styles.departmentContainer}>
        <Row className={`${styles.header} align-items-center mb-4`}>
          <Col>
            <h2 className={styles.title}>Manage Departments</h2>
            <p className={`${styles.subtitle} text-muted`}>Organize and manage company departments.</p>
          </Col>
          <Col xs="auto">
            <Button
              variant="primary"
              size="sm"
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              + Add Department
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className={`${styles.tableHeader} d-flex justify-content-between text-muted mb-2`}>
              <span>Department Name</span>
              <span>Actions</span>
            </div>
            {departments.map((department) => (
              <Row
                key={department._id}
                className={`${styles.departmentCard} align-items-center py-2 border-bottom`}
              >
                <Col>{department.departmentName}</Col>
                <Col xs="auto">
                  <span
                    className={`${styles.actionIcon} me-2`}
                    onClick={() => {
                      setEditDepartment(department);
                      setNewDepartmentName(department.departmentName);
                      setShowEditModal(true);
                    }}
                  >
                    ✎
                  </span>
                  <span
                    className={styles.actionIcon}
                    onClick={() => handleDeleteDepartment(department._id)}
                  >
                    🗑
                  </span>
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
      </Container>

      {/* Add Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>Add New Department</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <p className={styles.modalDescription}>
            Enter the name of the new department here. Click Add when finished.
          </p>
          <Form>
            <Form.Group controlId="departmentName">
              <Form.Control
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="e.g. Engineering Department"
                className={styles.modalInput}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddModal(false)}
            className={styles.modalCancelButton}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddDepartment}
            disabled={!newDepartmentName.trim()}
            className={styles.modalAddButton}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditDepartment(null);
          setNewDepartmentName("");
        }}
        centered
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>Edit Department</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <p className={styles.modalDescription}>
            Edit the name of the department here. Click Save when finished.
          </p>
          <Form>
            <Form.Group controlId="editDepartmentName">
              <Form.Control
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="e.g. Engineering Department"
                className={styles.modalInput}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setShowEditModal(false);
              setEditDepartment(null);
              setNewDepartmentName("");
            }}
            className={styles.modalCancelButton}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleEditDepartment}
            disabled={!newDepartmentName.trim() || !editDepartment}
            className={styles.modalAddButton}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Department;