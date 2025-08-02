import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
// TODO: Remove mock data imports when backend is ready
import {
  mockCourses,
  mockAssignments,
  mockSubmissions,
} from "../../data/mockData";

const StudentDashboard = () => {
  const { user } = useAuth();

  // TODO: Replace with actual API calls to fetch student data
  // For now using mock data - replace these with API calls:
  // - coursesAPI.getByStudent(user.id)
  // - assignmentsAPI.getByStudent(user.id)
  // - submissionsAPI.getByStudent(user.id)

  // Get student's courses (TEMPORARY - using mock data)
  const studentCourses = mockCourses.filter(
    (course) => course.students.includes(user?.id || 1) // Use actual user ID when available
  );

  // Get student's assignments (TEMPORARY - using mock data)
  const studentAssignments = mockAssignments.filter((assignment) =>
    studentCourses.some((course) => course.id === assignment.courseId)
  );

  // Get student's submissions (TEMPORARY - using mock data)
  const studentSubmissions = mockSubmissions.filter(
    (submission) => submission.studentId === (user?.id || 1) // Use actual user ID when available
  );

  const upcomingAssignments = studentAssignments
    .filter((assignment) => new Date(assignment.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const recentGrades = studentSubmissions
    .filter((submission) => submission.grade !== null)
    .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
    .slice(0, 5);

  const stats = [
    {
      name: "Enrolled Courses",
      value: studentCourses.length,
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      name: "Pending Assignments",
      value: upcomingAssignments.length,
      icon: FileText,
      color: "bg-orange-500",
    },
    {
      name: "Completed Assignments",
      value: studentSubmissions.length,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      name: "Average Grade",
      value:
        recentGrades.length > 0
          ? Math.round(
              recentGrades.reduce((sum, grade) => sum + grade.grade, 0) /
                recentGrades.length
            )
          : "N/A",
      icon: Award,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow">
        <div className="px-6 py-8">
          <div className="flex items-center">
            <img
              className="h-16 w-16 rounded-full object-cover border-4 border-white"
              src={user?.avatar}
              alt={user?.name}
            />
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-primary-100 mt-2">
                Ready to continue your learning journey? You have{" "}
                {upcomingAssignments.length} upcoming assignments.
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
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
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
            to="/student/courses"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
          >
            <BookOpen className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              My Courses
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View enrolled courses and materials
            </p>
          </Link>

          <Link
            to="/student/assignments"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
          >
            <FileText className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Assignments
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Submit and track assignments
            </p>
          </Link>

          <Link
            to="/student/grades"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
          >
            <Award className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Grades
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View grades and feedback
            </p>
          </Link>

          <Link
            to="/student/schedule"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
          >
            <Calendar className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Schedule
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View class schedule and events
            </p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Upcoming Assignments
            </h3>
            <Link
              to="/student/assignments"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingAssignments.length > 0 ? (
              upcomingAssignments.map((assignment) => {
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
                      <p className="text-sm text-gray-500">
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
              <p className="text-gray-500 text-center py-4">
                No upcoming assignments
              </p>
            )}
          </div>
        </div>

        {/* Recent Grades */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Grades
            </h3>
            <Link
              to="/student/grades"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentGrades.length > 0 ? (
              recentGrades.map((submission) => {
                const assignment = studentAssignments.find(
                  (a) => a.id === submission.assignmentId
                );
                const gradePercentage =
                  (submission.grade / (assignment?.totalPoints || 100)) * 100;

                return (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {assignment?.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted{" "}
                        {new Date(
                          submission.submissionDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          gradePercentage >= 90
                            ? "bg-green-100 text-green-800"
                            : gradePercentage >= 80
                            ? "bg-blue-100 text-blue-800"
                            : gradePercentage >= 70
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {submission.grade}/{assignment?.totalPoints || 100}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                No grades available
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
          {studentCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {course.title}
                </h4>
                <span className="text-xs text-gray-500">{course.code}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {course.teacherName}
              </p>
              <p className="text-xs text-gray-500 mb-3">{course.schedule}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {course.credits} credits
                </span>
                <Link
                  to={`/student/courses/${course.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
