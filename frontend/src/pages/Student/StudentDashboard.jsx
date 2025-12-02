import React, { useState, useEffect } from "react";
import { GraduationCap, User, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { dashboardAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardAPI.getStudentDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-lg mb-8">
          <div className="px-8 py-12">
            <div className="flex items-center">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-blue-600" />
              </div>
              <div className="ml-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {dashboardData?.welcomeMessage || "Welcome to OpenAcademy!"}
                </h1>
                <p className="text-blue-100 text-lg">
                  Hello,{" "}
                  {dashboardData?.studentName || user?.firstName || "Student"}!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Student Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Student Information
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 w-16">
                  Name:
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {dashboardData?.studentName ||
                    user?.firstName ||
                    "Not Available"}
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-500 dark:text-gray-400 w-14">
                  Email:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {dashboardData?.studentEmail ||
                    user?.email ||
                    "Not Available"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Quick Overview
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full text-sm font-medium">
                  Active Student
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Role</span>
                <span className="text-gray-900 dark:text-white font-medium capitalize">
                  {user?.role || "Student"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="max-w-md mx-auto">
            <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              More Features Coming Soon!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We're working hard to bring you courses, assignments, grades, and
              much more. Stay tuned for exciting updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
