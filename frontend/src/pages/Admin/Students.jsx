import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../../components/Common/DataTable";
import Modal from "../../components/Common/Modal";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalType, setModalType] = useState("create"); // 'create', 'edit', 'view'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    enrollmentDate: "",
    status: "active",
  });

  const columns = [
    {
      key: "studentId",
      label: "Student ID",
      render: (value) => (
        <span className="font-medium text-primary-600">{value}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value, student) => (
        <div className="flex items-center">
          <img
            className="h-8 w-8 rounded-full object-cover mr-3"
            src={student.avatar}
            alt={value}
          />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {value}
            </div>
            <div className="text-sm text-gray-500">{student.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "enrollmentDate",
      label: "Enrollment Date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
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
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(student);
            }}
            className="p-1 text-gray-600 hover:text-primary-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(student.id);
            }}
            className="p-1 text-gray-600 hover:text-red-600"
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
      name: "",
      email: "",
      studentId: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      enrollmentDate: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setModalType("edit");
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      enrollmentDate: student.enrollmentDate,
      status: student.status,
    });
    setShowModal(true);
  };

  const handleView = (student) => {
    setModalType("view");
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleDelete = (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((s) => s.id !== studentId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modalType === "create") {
      const newStudent = {
        id: Date.now(),
        ...formData,
        avatar:
          "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
        courses: [],
      };
      setStudents([...students, newStudent]);
    } else if (modalType === "edit") {
      setStudents(
        students.map((s) =>
          s.id === selectedStudent.id ? { ...s, ...formData } : s
        )
      );
    }

    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
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
            <div className="flex items-center space-x-4 mb-6">
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={selectedStudent?.avatar}
                alt={selectedStudent?.name}
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedStudent?.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedStudent?.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {selectedStudent?.studentId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                  {selectedStudent?.phone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                  {selectedStudent?.dateOfBirth
                    ? new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                  {selectedStudent?.address}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enrollment Date
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                  {selectedStudent?.enrollmentDate
                    ? new Date(
                        selectedStudent.enrollmentDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedStudent?.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedStudent?.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="studentId" className="form-label">
                  Student ID *
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  required
                  className="form-input"
                  value={formData.studentId}
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
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="enrollmentDate" className="form-label">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  id="enrollmentDate"
                  name="enrollmentDate"
                  className="form-input"
                  value={formData.enrollmentDate}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="form-input"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-input"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {modalType === "create" ? "Create Student" : "Update Student"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Students;
