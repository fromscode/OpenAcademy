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

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
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
    education: "",
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  // Flatten backend teacher shape (handles nested user fields)
  const flattenTeacher = (t) => {
    const user = t?.user || {};
    return {
      id: t?.id ?? user?.id,
      firstName: user?.firstName ?? t?.firstName ?? "",
      middleName: user?.middleName ?? t?.middleName ?? "",
      lastName: user?.lastName ?? t?.lastName ?? "",
      email: user?.email ?? t?.email ?? "",
      phoneNumber: user?.phoneNumber ?? t?.phoneNumber ?? "",
      education: t?.education ?? "",
      role: user?.role ?? "TEACHER",
      createdAt: t?.createdAt ?? user?.createdAt,
    };
  };

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllTeachers();
      const list = (response?.data ?? response ?? []).map(flattenTeacher);
      setTeachers(list);
    } catch (err) {
      setError(err.message || "Failed to load teachers");
      console.error("Error loading teachers:", err);
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
      label: "Teacher ID",
      render: (value) => (
        <span className="font-medium text-primary-600">{value}</span>
      ),
    },
    {
      key: "firstName",
      label: "Name",
      render: (value, teacher) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {`${teacher.firstName || ""} ${teacher.lastName || ""}`}
          </div>
          <div className="text-sm text-gray-500">{teacher.email}</div>
        </div>
      ),
    },
    { key: "phoneNumber", label: "Phone" },
    { key: "education", label: "Education" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, teacher) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(teacher);
            }}
            className="p-1 text-gray-600 hover:text-primary-600"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(teacher);
            }}
            className="p-1 text-gray-600 hover:text-primary-600"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(teacher.id);
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
    setSelectedTeacher(null);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      education: "",
    });
    setShowModal(true);
  };

  const handleEdit = (teacher) => {
    setModalType("edit");
    setSelectedTeacher(teacher);
    setFormData({
      firstName: teacher.firstName || "",
      middleName: teacher.middleName || "",
      lastName: teacher.lastName || "",
      email: teacher.email || "",
      password: "",
      phoneNumber: teacher.phoneNumber || "",
      education: teacher.education || "",
    });
    setShowModal(true);
  };

  const handleView = (teacher) => {
    setModalType("view");
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const handleDelete = async (teacherId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this teacher? This action cannot be undone."
      )
    ) {
      try {
        setSubmitting(true);
        await adminAPI.deleteTeacher(teacherId);
        setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
        showSuccessMessage("Teacher deleted successfully");
      } catch (err) {
        setError(err.message || "Failed to delete teacher");
        console.error("Error deleting teacher:", err);
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
        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.password ||
          !formData.phoneNumber
        ) {
          setError("Please fill in all required fields");
          setSubmitting(false);
          return;
        }
        const response = await adminAPI.createTeacher(formData);
        const created = flattenTeacher(response?.data ?? response);
        setTeachers([...teachers, created]);
        showSuccessMessage("Teacher created successfully");
      } else if (modalType === "edit") {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        const response = await adminAPI.updateTeacher(
          selectedTeacher.id,
          updateData
        );
        const updated = flattenTeacher(response?.data ?? response);
        setTeachers(
          teachers.map((t) => (t.id === selectedTeacher.id ? updated : t))
        );
        showSuccessMessage("Teacher updated successfully");
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Failed to save teacher");
      console.error("Error saving teacher:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            Teachers
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage teacher profiles and information
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Teachers Table */}
      <DataTable
        data={teachers}
        columns={columns}
        searchable
        sortable
        pagination
      />

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === "create"
            ? "Add New Teacher"
            : modalType === "edit"
            ? "Edit Teacher"
            : "Teacher Details"
        }
        size="lg"
      >
        {modalType === "view" ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {`${selectedTeacher?.firstName || ""} ${
                  selectedTeacher?.lastName || ""
                }`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedTeacher?.firstName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedTeacher?.lastName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedTeacher?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedTeacher?.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Education
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedTeacher?.education || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teacher ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedTeacher?.id || "N/A"}
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
                <label htmlFor="education" className="form-label">
                  Education
                </label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  className="form-input"
                  value={formData.education}
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
                  ? "Create Teacher"
                  : "Update Teacher"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Teachers;
