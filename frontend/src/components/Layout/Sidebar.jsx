import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  MessageSquare,
  Settings,
  GraduationCap,
  UserCheck,
  Calendar,
  Award,
  User,
  X,
  Video,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            icon: Home,
            label: "Dashboard",
            path: "/dashboard/admin/dashboard",
          },
          { icon: Users, label: "Students", path: "/dashboard/admin/students" },
          {
            icon: UserCheck,
            label: "Teachers",
            path: "/dashboard/admin/teachers",
          },
          {
            icon: BookOpen,
            label: "Courses",
            path: "/dashboard/admin/courses",
          },
          {
            icon: FileText,
            label: "Assignments",
            path: "/dashboard/admin/assignments",
          },
          {
            icon: BarChart3,
            label: "Reports",
            path: "/dashboard/admin/reports",
          },
          {
            icon: MessageSquare,
            label: "Messages",
            path: "/dashboard/messages",
          },
          { icon: Settings, label: "Settings", path: "/dashboard/settings" },
        ];
      case "teacher":
        return [
          {
            icon: Home,
            label: "Dashboard",
            path: "/dashboard/teacher/dashboard",
          },
          {
            icon: BookOpen,
            label: "Manage Courses",
            path: "/dashboard/teacher/courses",
          },
          {
            icon: Award,
            label: "Grade Submissions",
            path: "/dashboard/teacher/grade-submissions",
          },
          {
            icon: MessageSquare,
            label: "Messages",
            path: "/dashboard/messages",
          },
        ];
      case "student":
        return [
          {
            icon: Home,
            label: "Dashboard",
            path: "/dashboard/student/dashboard",
          },
          {
            icon: Video,
            label: "Start Meeting",
            path: "https://deeppati2005.github.io/mumble/",
            external: true,
          },
          {
            icon: BookOpen,
            label: "My Courses",
            path: "/dashboard/student/courses",
          },
          {
            icon: FileText,
            label: "Assignments",
            path: "/dashboard/student/assignments",
          },
          // Schedule removed from student menu
          {
            icon: MessageSquare,
            label: "Messages",
            path: "/dashboard/messages",
          },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } relative`}
      >
        {/* Mobile close button (no header/border) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 lg:hidden"
        >
          <X className="h-6 w-6" />
        </button>

        <nav className="px-4 pt-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  {item.external ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="flex items-center px-4 py-2 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white font-medium"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
