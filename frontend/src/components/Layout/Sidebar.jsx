import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  UserCheck,
  Award,
  User,
  X,
  Video,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuSections = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            title: "Overview",
            items: [
              {
                icon: LayoutDashboard,
                label: "Dashboard",
                path: "/dashboard/admin/dashboard",
              },
            ],
          },
          {
            title: "Management",
            items: [
              {
                icon: Users,
                label: "Students",
                path: "/dashboard/admin/students",
              },
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
                icon: User,
                label: "Manage Admin",
                path: "/dashboard/admin/manage-admin",
              },
            ],
          },
          {
            title: "Communication",
            items: [
              {
                icon: Video,
                label: "Start Meeting",
                path: "https://mumble-zx9f.onrender.com",
                external: true,
              },
              {
                icon: MessageSquare,
                label: "Messages",
                path: "/dashboard/messages",
              },
            ],
          },
        ];
      case "teacher":
        return [
          {
            title: "Overview",
            items: [
              {
                icon: LayoutDashboard,
                label: "Dashboard",
                path: "/dashboard/teacher/dashboard",
              },
            ],
          },
          {
            title: "Teaching",
            items: [
              {
                icon: BookOpen,
                label: "Manage Courses",
                path: "/dashboard/teacher/courses",
              },
              {
                icon: FileText,
                label: "Assignments",
                path: "/dashboard/teacher/assignments",
              },
              {
                icon: Award,
                label: "Grade Submissions",
                path: "/dashboard/teacher/grade-submissions",
              },
            ],
          },
          {
            title: "Communication",
            items: [
              {
                icon: Video,
                label: "Start Meeting",
                path: "https://mumble-zx9f.onrender.com",
                external: true,
              },
              {
                icon: MessageSquare,
                label: "Messages",
                path: "/dashboard/messages",
              },
            ],
          },
        ];
      case "student":
        return [
          {
            title: "Overview",
            items: [
              {
                icon: LayoutDashboard,
                label: "Dashboard",
                path: "/dashboard/student/dashboard",
              },
            ],
          },
          {
            title: "Learning",
            items: [
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
            ],
          },
          {
            title: "Communication",
            items: [
              {
                icon: Video,
                label: "Start Meeting",
                path: "https://mumble-zx9f.onrender.com",
                external: true,
              },
              {
                icon: MessageSquare,
                label: "Messages",
                path: "/dashboard/messages",
              },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const menuSections = getMenuSections();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">OpenAcademy</span>
              <span className="text-xs text-gray-400 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="overflow-y-auto h-[calc(100vh-4rem)] py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          <nav className="px-4 space-y-6">
            {menuSections.map((section, idx) => (
              <div key={idx}>
                <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
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
                            className="group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md hover:translate-x-1"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 group-hover:bg-blue-600 transition-colors">
                                <Icon className="w-5 h-5" />
                              </div>
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <Link
                            to={item.path}
                            onClick={onClose}
                            className={`group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md hover:translate-x-1"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                                  isActive
                                    ? "bg-white/20"
                                    : "bg-gray-800 group-hover:bg-blue-600"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <span className="font-medium">{item.label}</span>
                            </div>
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                            {!isActive && (
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
