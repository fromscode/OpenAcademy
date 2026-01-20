import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  Award,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Courses = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);

  // No courses - will be loaded from backend API
  const studentCourses = [];

  const handleCourseClick = (course) => {
    setSelectedCourse(selectedCourse?.id === course.id ? null : course);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your enrolled courses
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Enrolled Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {studentCourses.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Credits
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {studentCourses.reduce(
                    (sum, course) => sum + course.credits,
                    0
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Active Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {studentCourses.filter((c) => c.status === "active").length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentCourses.map((course) => (
            <div
              key={course.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer ${
                selectedCourse?.id === course.id
                  ? "border-blue-500 dark:border-blue-400 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              }`}
              onClick={() => handleCourseClick(course)}
            >
              {/* Course Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {course.code}
                </p>
              </div>

              {/* Course Details */}
              <div className="p-6 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4 mr-2" />
                  <span>{course.teacherName}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{course.schedule}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Award className="h-4 w-4 mr-2" />
                  <span>{course.credits} Credits</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{course.students.length} Students</span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedCourse?.id === course.id && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Start Date:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(course.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        End Date:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(course.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {studentCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Courses Enrolled
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You are not enrolled in any courses yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
