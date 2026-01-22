import { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Calendar,
  Search,
  Eye,
  TrendingUp,
} from "lucide-react";
import { courseAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Modal from "../../components/Common/Modal";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseAssignments, setCourseAssignments] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allCourses = await courseAPI.getAllCourses();
      setCourses(allCourses);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseAssignments = async (courseId) => {
    try {
      const assignments = await courseAPI.getCourseAssignments(courseId);
      setCourseAssignments(assignments);
    } catch (err) {
      console.error("Failed to fetch course assignments:", err);
      setCourseAssignments([]);
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    fetchCourseAssignments(course.id);
  };

  const closeCourseModal = () => {
    setSelectedCourse(null);
    setCourseAssignments([]);
  };

  const getFilteredCourses = () => {
    if (!searchTerm) return courses;

    return courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredCourses = getFilteredCourses();

  // Calculate stats
  const activeCourses = courses.filter((c) => {
    const now = new Date();
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return start <= now && now <= end;
  }).length;

  const upcomingCourses = courses.filter(
    (c) => new Date(c.startDate) > new Date()
  ).length;

  const completedCourses = courses.filter(
    (c) => new Date(c.endDate) < new Date()
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Course Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of all courses in the system
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {courses.length}
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
                  Active Courses
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {activeCourses}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCourses.map((course) => {
                  const now = new Date();
                  const start = new Date(course.startDate);
                  const end = new Date(course.endDate);
                  let status = "upcoming";
                  let statusColor =
                    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";

                  if (start <= now && now <= end) {
                    status = "active";
                    statusColor =
                      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                  } else if (end < now) {
                    status = "completed";
                    statusColor =
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
                  }

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {course.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {course.courseCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          Instructor ID:{" "}
                          {course.instructorId ?? course.teacherId ?? "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Name:{" "}
                          {course.instructorName ?? course.teacherName ?? "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(course.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          to {new Date(course.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewCourse(course)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No courses available in the system yet."}
            </p>
          </div>
        )}

        {/* Course Details Modal */}
        <Modal
          isOpen={!!selectedCourse}
          onClose={closeCourseModal}
          title={selectedCourse ? selectedCourse.title : "Course Details"}
          size="lg"
        >
          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Code
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedCourse.courseCode ?? selectedCourse.code ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {(() => {
                      const now = new Date();
                      const start = new Date(selectedCourse.startDate);
                      const end = new Date(selectedCourse.endDate);
                      if (start <= now && now <= end) return "active";
                      if (end < now) return "completed";
                      return "upcoming";
                    })()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instructor
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  ID:{" "}
                  {selectedCourse.instructorId ??
                    selectedCourse.teacherId ??
                    "N/A"}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Name:{" "}
                  {selectedCourse.instructorName ??
                    selectedCourse.teacherName ??
                    "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duration
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(selectedCourse.startDate).toLocaleDateString()} -{" "}
                  {new Date(selectedCourse.endDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedCourse.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Assignments ({courseAssignments.length})
                </h3>
                {courseAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {courseAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {assignment.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {assignment.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {assignment.maxScore} pts
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Due:{" "}
                              {new Date(
                                assignment.dueDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No assignments for this course yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminCourses;
