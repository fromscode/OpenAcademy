import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  FileText,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { courseAPI, assignmentAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Modal from "../../components/Common/Modal";
import { formatDateDDMMYYYY } from "../../utils/date";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showDeadlinesModal, setShowDeadlinesModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all courses
      const allCourses = await courseAPI.getAllCourses();

      // Filter courses taught by this instructor
      const currentInstructorId = user?.id;
      const instructorCourses = allCourses.filter((course) => {
        const courseInstructorId =
          course.instructorId ?? course.instructor?.id ?? null;
        return (
          courseInstructorId !== null &&
          String(courseInstructorId) === String(currentInstructorId)
        );
      });
      setTeacherCourses(instructorCourses);

      // Get assignments for each course
      const allAssignments = [];
      const allSubmissions = [];

      for (const course of instructorCourses) {
        try {
          const assignments = await courseAPI.getCourseAssignments(course.id);
          // annotate with course info for UI
          const annotated = (assignments || []).map((a) => ({
            ...a,
            courseId: course.id,
            courseName: course.title,
          }));
          allAssignments.push(...annotated);

          // Get submissions for each assignment
          for (const assignment of assignments) {
            try {
              const assignmentSubmissions =
                await assignmentAPI.getAssignmentSubmissions(assignment.id);
              allSubmissions.push(...assignmentSubmissions);
            } catch (err) {
              console.error(
                `Failed to fetch submissions for assignment ${assignment.id}:`,
                err
              );
            }
          }
        } catch (err) {
          console.error(
            `Failed to fetch assignments for course ${course.id}:`,
            err
          );
        }
      }

      setTeacherAssignments(allAssignments);
      setSubmissions(allSubmissions);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Assignment creation is available inside Manage Courses page

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate pending submissions (submissions without grades)
  const pendingSubmissions = submissions.filter(
    (submission) => submission.grade === null || submission.grade === undefined
  );

  const stats = [
    {
      name: "My Courses",
      value: teacherCourses.length,
      icon: BookOpen,
      color: "bg-blue-500",
      change: "",
      changeType: "neutral",
    },
    {
      name: "Total Assignments",
      value: teacherAssignments.length,
      icon: FileText,
      color: "bg-purple-500",
      change: "",
      changeType: "neutral",
    },
    {
      name: "Pending Grading",
      value: pendingSubmissions.length,
      icon: Award,
      color: "bg-orange-500",
      change: "",
      changeType: "neutral",
    },
    {
      name: "Total Submissions",
      value: submissions.length,
      icon: CheckCircle,
      color: "bg-green-500",
      change: "",
      changeType: "neutral",
    },
  ];

  const recentSubmissions = submissions
    .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
    .slice(0, 5);

  const allSubmissions = submissions.sort(
    (a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
  );

  const upcomingDeadlines = teacherAssignments
    .filter((assignment) => new Date(assignment.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const allDeadlines = teacherAssignments
    .filter((assignment) => new Date(assignment.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const renderSubmission = (submission) => {
    const assignment = teacherAssignments.find(
      (a) => a.id === (submission.assignmentId ?? submission.assignment?.id)
    );
    const studentName =
      submission.student?.firstName && submission.student?.lastName
        ? `${submission.student.firstName} ${submission.student.lastName}`
        : submission.student?.name ||
          submission.student?.firstName ||
          submission.studentName ||
          "Student";
    const avatarUrl =
      submission.student?.avatar ||
      submission.student?.profileImageUrl ||
      submission.studentAvatar ||
      submission.avatar ||
      null;
    const initials = (name) => {
      if (!name || typeof name !== "string") return "";
      const parts = name.trim().split(/\s+/);
      const first = parts[0]?.[0] || "";
      const second = parts[1]?.[0] || "";
      return (first + second).toUpperCase() || first.toUpperCase();
    };
    const status = submission.grade != null ? "graded" : "submitted";
    const submittedDate =
      submission.submittedAt ||
      submission.submissionDate ||
      submission.createdAt;

    return (
      <div
        key={submission.id}
        className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
      >
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={studentName}
              className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const sibling = e.currentTarget.nextElementSibling;
                if (sibling) sibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 flex items-center justify-center text-xs font-semibold"
            style={{ display: avatarUrl ? "none" : "flex" }}
          >
            {initials(studentName)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
            {assignment?.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {studentName} •{" "}
            {submittedDate ? formatDateDDMMYYYY(submittedDate) : ""}
          </p>
        </div>
        <div className="flex-shrink-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              status === "graded"
                ? "bg-green-100 text-green-800"
                : status === "submitted"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    );
  };

  const renderDeadline = (assignment) => {
    const daysUntilDue = Math.ceil(
      (new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    const isUrgent = daysUntilDue <= 3;

    return (
      <div
        key={assignment.id}
        className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
      >
        <div className="flex-shrink-0">
          {isUrgent ? (
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          ) : (
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
            {assignment.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {assignment.courseName} • Due{" "}
            {formatDateDDMMYYYY(assignment.dueDate)}
          </p>
        </div>
        <div className="flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isUrgent
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {daysUntilDue} days
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
            </div>
            <div className="sm:ml-6 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                Good morning, Professor {user?.firstName || user?.name}!
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="flex-shrink-0 mb-2 sm:mb-0">
                  <div className={`p-2 sm:p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="sm:ml-4 lg:ml-5 w-full flex-1 text-center sm:text-left">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline justify-center sm:justify-start">
                      <div className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-1 sm:ml-2 flex items-baseline text-xs sm:text-sm font-semibold ${
                          stat.changeType === "increase"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/dashboard/teacher/courses"
            className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 text-center sm:text-left"
          >
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2 mx-auto sm:mx-0" />
            <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              Manage Courses
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              View and edit course content
            </p>
          </Link>

          <Link
            to="/dashboard/teacher/grade-submissions"
            className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 text-center sm:text-left"
          >
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2 mx-auto sm:mx-0" />
            <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              Grade Submissions
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Review and grade student work
            </p>
          </Link>

          <Link
            to="/dashboard/teacher/courses"
            className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 text-center sm:text-left"
          >
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2 mx-auto sm:mx-0" />
            <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              View Courses
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Manage course information
            </p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              Recent Submissions
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowSubmissionsModal(true);
              }}
              className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 cursor-pointer"
            >
              View all
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map(renderSubmission)
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                No recent submissions
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              Upcoming Deadlines
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowDeadlinesModal(true);
              }}
              className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 cursor-pointer"
            >
              View all
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map(renderDeadline)
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                No upcoming deadlines
              </p>
            )}
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
          My Courses
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {teacherCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                  {course.title}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                  {course.courseCode}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {course.startDate && course.endDate
                  ? `${formatDateDDMMYYYY(
                      course.startDate
                    )} - ${formatDateDDMMYYYY(course.endDate)}`
                  : ""}
              </p>
              {/* View-only: no manage controls here */}
            </div>
          ))}
        </div>
      </div>

      {/* All Submissions Modal */}
      <Modal
        isOpen={showSubmissionsModal}
        onClose={() => setShowSubmissionsModal(false)}
        title="All Submissions"
        size="xl"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {allSubmissions.length > 0 ? (
            allSubmissions.map(renderSubmission)
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No submissions yet
            </p>
          )}
        </div>
      </Modal>

      {/* All Deadlines Modal */}
      <Modal
        isOpen={showDeadlinesModal}
        onClose={() => setShowDeadlinesModal(false)}
        title="All Upcoming Deadlines"
        size="xl"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {allDeadlines.length > 0 ? (
            allDeadlines.map(renderDeadline)
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No upcoming deadlines
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
