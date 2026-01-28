import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { adminAPI } from "../../services/api";

const ManageAdmin = () => {
  const [createData, setCreateData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [updateEmail, setUpdateEmail] = useState("");
  const [updateData, setUpdateData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));
  };

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmittingCreate(true);
    try {
      const required = [
        createData.firstName,
        createData.lastName,
        createData.email,
        createData.password,
        createData.phoneNumber,
      ];
      if (required.some((v) => !v || !String(v).trim())) {
        setError("Please fill in all required fields for creating admin.");
        return;
      }
      await adminAPI.createAdmin(createData);
      showSuccess("Admin created successfully");
      setCreateData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
      });
    } catch (err) {
      setError(err.message || "Failed to create admin");
      console.error("Create admin error:", err);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const onUpdateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmittingUpdate(true);
    try {
      if (!updateEmail || !String(updateEmail).trim()) {
        setError("Admin email is required to update.");
        return;
      }
      // Build payload with only non-empty fields
      const payload = Object.fromEntries(
        Object.entries(updateData).filter(
          ([_, v]) => v != null && String(v).trim() !== ""
        )
      );
      await adminAPI.updateAdmin(updateEmail.trim(), payload);
      showSuccess("Admin updated successfully");
      setUpdateEmail("");
      setUpdateData({
        firstName: "",
        middleName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        password: "",
      });
    } catch (err) {
      setError(err.message || "Failed to update admin");
      console.error("Update admin error:", err);
    } finally {
      setSubmittingUpdate(false);
    }
  };

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
            Manage Admin
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Create a new admin or update an existing admin
          </p>
        </div>
      </div>

      {/* Create Admin Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Admin
        </h2>
        <form onSubmit={onCreateSubmit} className="space-y-4">
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
                value={createData.firstName}
                onChange={handleCreateChange}
                required
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
                value={createData.lastName}
                onChange={handleCreateChange}
                required
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
                value={createData.middleName}
                onChange={handleCreateChange}
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
                className="form-input"
                value={createData.email}
                onChange={handleCreateChange}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={createData.password}
                onChange={handleCreateChange}
                required
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
                value={createData.phoneNumber}
                onChange={handleCreateChange}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={submittingCreate}
            >
              {submittingCreate ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>

      {/* Update Admin Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Update Admin
        </h2>
        <form onSubmit={onUpdateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="adminEmail" className="form-label">
                Admin Email *
              </label>
              <input
                type="email"
                id="adminEmail"
                name="adminEmail"
                className="form-input"
                value={updateEmail}
                onChange={(e) => setUpdateEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="firstNameUpdate" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstNameUpdate"
                name="firstName"
                className="form-input"
                value={updateData.firstName}
                onChange={handleUpdateChange}
              />
            </div>
            <div>
              <label htmlFor="emailUpdate" className="form-label">
                New Email
              </label>
              <input
                type="email"
                id="emailUpdate"
                name="email"
                className="form-input"
                value={updateData.email}
                onChange={handleUpdateChange}
              />
            </div>
            <div>
              <label htmlFor="passwordUpdate" className="form-label">
                New Password
              </label>
              <input
                type="password"
                id="passwordUpdate"
                name="password"
                className="form-input"
                value={updateData.password}
                onChange={handleUpdateChange}
              />
            </div>
            <div>
              <label htmlFor="lastNameUpdate" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastNameUpdate"
                name="lastName"
                className="form-input"
                value={updateData.lastName}
                onChange={handleUpdateChange}
              />
            </div>
            <div>
              <label htmlFor="middleNameUpdate" className="form-label">
                Middle Name
              </label>
              <input
                type="text"
                id="middleNameUpdate"
                name="middleName"
                className="form-input"
                value={updateData.middleName}
                onChange={handleUpdateChange}
              />
            </div>
            <div>
              <label htmlFor="phoneNumberUpdate" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumberUpdate"
                name="phoneNumber"
                className="form-input"
                value={updateData.phoneNumber}
                onChange={handleUpdateChange}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={submittingUpdate}
            >
              {submittingUpdate ? "Updating..." : "Update Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageAdmin;
