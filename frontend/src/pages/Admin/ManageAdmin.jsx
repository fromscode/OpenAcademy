import React, { useEffect, useState } from "react";
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

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
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
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const flattenAdmin = (a) => {
    const user = a?.user || {};
    return {
      id: a?.id ?? user?.id,
      firstName: user?.firstName ?? a?.firstName ?? "",
      middleName: user?.middleName ?? a?.middleName ?? "",
      lastName: user?.lastName ?? a?.lastName ?? "",
      email: user?.email ?? a?.email ?? "",
      phoneNumber: user?.phoneNumber ?? a?.phoneNumber ?? "",
      role: user?.role ?? "ADMIN",
    };
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllAdmins();
      const list = (response?.data ?? response ?? []).map(flattenAdmin);
      setAdmins(list);
    } catch (err) {
      setError(err.message || "Failed to load admins");
      console.error("Error loading admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType("create");
    setSelectedAdmin(null);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setModalType("edit");
    setSelectedAdmin(admin);
    setFormData({
      firstName: admin.firstName || "",
      middleName: admin.middleName || "",
      lastName: admin.lastName || "",
      email: "", // new email optional
      password: "", // new password optional
      phoneNumber: admin.phoneNumber || "",
    });
    setShowModal(true);
  };

  const handleView = (admin) => {
    setModalType("view");
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleDelete = async (adminId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this admin? This action cannot be undone."
      )
    ) {
      try {
        setSubmitting(true);
        await adminAPI.deleteAdmin(adminId);
        setAdmins((prev) => prev.filter((a) => a.id !== adminId));
        showSuccessMessage("Admin deleted successfully");
      } catch (err) {
        setError(err.message || "Failed to delete admin");
        console.error("Error deleting admin:", err);
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
        const required = [
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password,
          formData.phoneNumber,
        ];
        if (required.some((v) => !v || !String(v).trim())) {
          setError("Please fill in all required fields");
          setSubmitting(false);
          return;
        }
        const response = await adminAPI.createAdmin(formData);
        const created = flattenAdmin(response?.data ?? response);
        setAdmins([...admins, created]);
        showSuccessMessage("Admin created successfully");
      } else if (modalType === "edit") {
        const filtered = Object.fromEntries(
          Object.entries(formData).filter(
            ([key, v]) =>
              key !== "middleName" && v != null && String(v).trim() !== ""
          )
        );
        // Include middleName even if blank to allow clearing it
        const payload = {
          ...filtered,
          middleName: formData.middleName ?? undefined,
        };
        const response = await adminAPI.updateAdmin(
          selectedAdmin.email,
          payload
        );
        const updated = flattenAdmin(response?.data ?? response);
        setAdmins(admins.map((a) => (a.id === selectedAdmin.id ? updated : a)));
        showSuccessMessage("Admin updated successfully");
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Failed to save admin");
      console.error("Error saving admin:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "Admin ID",
      render: (value) => (
        <span className="font-medium text-primary-600">{value}</span>
      ),
    },
    {
      key: "firstName",
      label: "Name",
      render: (value, admin) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {`${admin.firstName || ""}${
              admin.middleName ? " " + admin.middleName : ""
            } ${admin.lastName || ""}`}
          </div>
          <div className="text-sm text-gray-500">{admin.email}</div>
        </div>
      ),
    },
    { key: "phoneNumber", label: "Phone" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, admin) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(admin);
            }}
            className="p-1 text-gray-600 hover:text-primary-600"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(admin);
            }}
            className="p-1 text-gray-600 hover:text-primary-600"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(admin.id);
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

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admins
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage admin accounts
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Admin</span>
        </button>
      </div>

      {/* Admins Table */}
      <DataTable
        data={admins}
        columns={columns}
        searchable={true}
        sortable={true}
        pagination={true}
      />

      {/* Modal for Create/Edit/View */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === "create"
            ? "Add New Admin"
            : modalType === "edit"
            ? "Edit Admin"
            : "Admin Details"
        }
        size="lg"
      >
        {modalType === "view" ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{`${
                selectedAdmin?.firstName || ""
              } ${selectedAdmin?.lastName || ""}`}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedAdmin?.firstName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedAdmin?.lastName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Middle Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedAdmin?.middleName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedAdmin?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedAdmin?.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Admin ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {selectedAdmin?.id || "N/A"}
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
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required={modalType === "create"}
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
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required={modalType === "create"}
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
                  onChange={(e) =>
                    setFormData({ ...formData, middleName: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="email" className="form-label">
                  {modalType === "create" ? "Email *" : "New Email"}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required={modalType === "create"}
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">
                  {modalType === "create" ? "Password *" : "New Password"}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={modalType === "create"}
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="form-input"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  required={modalType === "create"}
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
                  ? "Create Admin"
                  : "Update Admin"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageAdmin;
