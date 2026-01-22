import React from "react";
import { Shield, User, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-lg mb-8">
          <div className="px-8 py-12">
            <div className="flex items-center">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <div className="ml-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome to OpenAcademy!
                </h1>
                <p className="text-purple-100 text-lg">
                  Hello, {user?.firstName || "Admin"}!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Admin Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <User className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admin Information
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 w-16">
                  Name:
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {user?.firstName || "Not Available"}
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-500 dark:text-gray-400 w-14">
                  Email:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {user?.email || "Not Available"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Quick Overview
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full text-sm font-medium">
                  Active Administrator
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Role</span>
                <span className="text-gray-900 dark:text-white font-medium capitalize">
                  {user?.role || "Admin"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional sections can be added here */}
      </div>
    </div>
  );
};

export default AdminDashboard;
