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
// Modal removed with create-assignment quick action

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // No inline create-assignment on dashboard; handled in Manage Courses

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

  const upcomingDeadlines = teacherAssignments
    .filter((assignment) => new Date(assignment.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow">
        <div className="px-6 py-8">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-white">
                Good morning, Professor {user?.firstName || user?.name}!
              </h1>
              <p className="text-primary-100 mt-2">
                You have {pendingSubmissions.length} submissions waiting for
                your review.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
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
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/dashboard/teacher/courses"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <BookOpen className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Manage Courses
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and edit course content
            </p>
          </Link>

          <Link
            to="/dashboard/teacher/grade-submissions"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <Award className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Grade Submissions
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review and grade student work
            </p>
          </Link>

          <Link
            to="/dashboard/teacher/courses"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <Users className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              View Courses
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage course information
            </p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Submissions
            </h3>
            <Link
              to="/teacher/grading"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => {
                const assignment = teacherAssignments.find(
                  (a) =>
                    a.id ===
                    (submission.assignmentId ?? submission.assignment?.id)
                );
                const studentName =
                  submission.student?.firstName ||
                  submission.student?.name ||
                  "Student";
                const avatar = undefined;
                const status =
                  submission.grade != null ? "graded" : "submitted";
                const submittedDate =
                  submission.submittedAt ||
                  submission.submissionDate ||
                  submission.createdAt;

                return (
                  <div
                    key={submission.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {assignment?.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {studentName} •{" "}
                        {submittedDate
                          ? new Date(submittedDate).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent submissions
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Upcoming Deadlines
            </h3>
            <Link
              to="/teacher/assignments"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((assignment) => {
                const daysUntilDue = Math.ceil(
                  (new Date(assignment.dueDate) - new Date()) /
                    (1000 * 60 * 60 * 24)
                );
                const isUrgent = daysUntilDue <= 3;

                return (
                  <div
                    key={assignment.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {isUrgent ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {assignment.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {assignment.courseName} • Due{" "}
                        {new Date(assignment.dueDate).toLocaleDateString()}
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
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No upcoming deadlines
              </p>
            )}
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          My Courses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {course.title}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {course.courseCode}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {course.startDate && course.endDate
                  ? `${new Date(
                      course.startDate
                    ).toLocaleDateString()} - ${new Date(
                      course.endDate
                    ).toLocaleDateString()}`
                  : ""}
              </p>
              {/* View-only: no manage controls here */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
