import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import DataTable from "../../components/Common/DataTable";
import Modal from "../../components/Common/Modal";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { adminAPI } from "../../services/api";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalType, setModalType] = useState("create"); // 'create', 'edit', 'view'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  // Load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Flatten backend student shape (handles nested user fields)
  const flattenStudent = (s) => {
    const user = s?.user || {};
    return {
      id: s?.id ?? user?.id,
      firstName: user?.firstName ?? s?.firstName ?? "",
      middleName: user?.middleName ?? s?.middleName ?? "",
      lastName: user?.lastName ?? s?.lastName ?? "",
      email: user?.email ?? s?.email ?? "",
      phoneNumber: user?.phoneNumber ?? s?.phoneNumber ?? "",
      dateOfBirth: s?.dateOfBirth ?? user?.dateOfBirth ?? "",
      role: user?.role ?? "STUDENT",
      createdAt: s?.createdAt ?? user?.createdAt,
      studentCode: s?.studentId ?? s?.studentCode ?? null,
    };
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllStudents();
      const list = (response?.data ?? response ?? []).map(flattenStudent);
      setStudents(list);
    } catch (err) {
      setError(err.message || "Failed to load students");
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const columns = [
    {
      key: "id",
      label: "Student ID",
      render: (value) => (
        <span className="font-medium text-primary-600">{value}</span>
      ),
    },
    {
      key: "firstName",
      label: "Name",
      render: (value, student) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {`${student.firstName || ""} ${student.lastName || ""}`}
          </div>
          <div className="text-sm text-gray-500">{student.email}</div>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone",
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "N/A"),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, student) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(student);
            }}
            className="p-1 text-gray-600 hover:text-primary-600"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(student);
            }}
            className="p-1 text-gray-600 hover:text-primary-600"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(student.id);
            }}
            className="p-1 text-gray-600 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleCreate = () => {
    setModalType("create");
    setSelectedStudent(null);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      dateOfBirth: "",
    });
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setModalType("edit");
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName || "",
      middleName: student.middleName || "",
      lastName: student.lastName || "",
      email: student.email || "",
      password: "", // Don't show password on edit
      phoneNumber: student.phoneNumber || "",
      dateOfBirth: student.dateOfBirth || "",
    });
    setShowModal(true);
  };

  const handleView = (student) => {
    setModalType("view");
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this student? This action cannot be undone."
      )
    ) {
      try {
        setSubmitting(true);
        await adminAPI.deleteStudent(studentId);
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        showSuccessMessage("Student deleted successfully");
      } catch (err) {
        setError(err.message || "Failed to delete student");
        console.error("Error deleting student:", err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (modalType === "create") {
        // Validate required fields
        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.password ||
          !formData.dateOfBirth
        ) {
          setError("Please fill in all required fields");
          setSubmitting(false);
          return;
        }

        const response = await adminAPI.createStudent(formData);
        const created = flattenStudent(response?.data ?? response);
        setStudents([...students, created]);
        showSuccessMessage("Student created successfully");
      } else if (modalType === "edit") {
        // For edit, don't include password if not provided
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }

        const response = await adminAPI.updateStudent(
          selectedStudent.id,
          updateData
        );
        const updated = flattenStudent(response?.data ?? response);
        setStudents(
          students.map((s) => (s.id === selectedStudent.id ? updated : s))
        );
        showSuccessMessage("Student updated successfully");
      }

      setShowModal(false);
    } catch (err) {
      setError(err.message || "Failed to save student");
      console.error("Error saving student:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </h3>
            <div className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 flex items-start">
          <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Success
            </h3>
            <div className="text-sm text-green-700 dark:text-green-300 mt-1">
              {successMessage}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Students
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage student profiles and enrollment information
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Students Table */}
      <DataTable
        data={students}
        columns={columns}
        searchable={true}
        sortable={true}
        pagination={true}
      />

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === "create"
            ? "Add New Student"
            : modalType === "edit"
            ? "Edit Student"
            : "Student Details"
        }
        size="lg"
      >
        {modalType === "view" ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {`${selectedStudent?.firstName || ""} ${
                  selectedStudent?.lastName || ""
                }`}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedStudent?.firstName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedStudent?.lastName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedStudent?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedStudent?.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Birth
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedStudent?.dateOfBirth
                      ? new Date(
                          selectedStudent.dateOfBirth
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedStudent?.id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="middleName" className="form-label">
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  className="form-input"
                  value={formData.middleName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  disabled={modalType === "edit"}
                  className="form-input disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-300 disabled:cursor-not-allowed"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {modalType === "create" && (
                <div>
                  <label htmlFor="password" className="form-label">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              )}

              {modalType === "edit" && (
                <div>
                  <label htmlFor="password" className="form-label">
                    Password (leave empty to keep current)
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="New password (optional)"
                  />
                </div>
              )}

              <div>
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  required
                  className="form-input"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Processing..."
                  : modalType === "create"
                  ? "Create Student"
                  : "Update Student"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Students;
