import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./pages/Landing/LandingPage";
import Login from "./pages/Auth/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCourses from "./pages/Admin/Courses";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import ManageCourses from "./pages/Teacher/ManageCourses";
import GradeSubmissions from "./pages/Teacher/GradeSubmissions";
import TeacherAssignments from "./pages/Teacher/Assignments";
import StudentDashboard from "./pages/Student/StudentDashboard";
import Courses from "./pages/Student/Courses";
import Assignments from "./pages/Student/Assignments";
import Grades from "./pages/Student/Grades";
import Messages from "./pages/Messages/Messages";
import Settings from "./pages/Settings/Settings";
import DashboardLayout from "./components/Layout/DashboardLayout";
import LoadingSpinner from "./components/Common/LoadingSpinner";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = `/dashboard/${user.role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = `/dashboard/${user.role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              {/* Landing Page */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                }
              />

              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Protected Routes with Dashboard Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Admin Routes */}
                <Route
                  path="admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/courses"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminCourses />
                    </ProtectedRoute>
                  }
                />

                {/* Teacher Routes */}
                <Route
                  path="teacher/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["teacher"]}>
                      <TeacherDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/courses"
                  element={
                    <ProtectedRoute allowedRoles={["teacher"]}>
                      <ManageCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/grade-submissions"
                  element={
                    <ProtectedRoute allowedRoles={["teacher"]}>
                      <GradeSubmissions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/assignments"
                  element={
                    <ProtectedRoute allowedRoles={["teacher"]}>
                      <TeacherAssignments />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/courses"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Courses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/assignments"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Assignments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/grades"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Grades />
                    </ProtectedRoute>
                  }
                />
                {/** Schedule route removed for students **/}

                {/* Shared Routes */}
                <Route
                  path="messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Direct role-based routes for backward compatibility */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <DashboardLayout>
                      <StudentDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <DashboardLayout>
                      <TeacherDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
