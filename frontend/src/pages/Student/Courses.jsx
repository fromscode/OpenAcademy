import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  Award,
  Plus,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { courseAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Modal from "../../components/Common/Modal";

const Courses = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const courses = await courseAPI.getAllCourses();
      setAllCourses(courses);

      // Fetch only courses the current student is enrolled in
      if (user?.id) {
        const myCourses = await courseAPI.getStudentCourses(user.id);
        setStudentCourses(myCourses);
      } else {
        setStudentCourses([]);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    if (!user?.id) {
      setError("User ID not found. Please login again.");
      return;
    }

    try {
      setEnrolling(true);
      await courseAPI.enrollStudent(courseId, user.id);
      await fetchCourses();
      setShowEnrollModal(false);
      setError(null);
    } catch (err) {
      console.error("Failed to enroll in course:", err);
      setError("Failed to enroll in course. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(selectedCourse?.id === course.id ? null : course);
  };

  const getFilteredCourses = () => {
    if (!searchTerm) return studentCourses;

    return studentCourses.filter(
      (course) =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredCourses = getFilteredCourses();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const formatInstructorName = (course) => {
    const i = course?.instructor;
    if (i) {
      const name = [i.firstName, i.middleName, i.lastName]
        .filter(Boolean)
        .join(" ");
      if (name) return name;
      if (i.fullName) return i.fullName;
    }
    if (course?.instructorName) return course.instructorName;
    return course?.instructorId ? `ID #${course.instructorId}` : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Courses
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your enrolled courses
              </p>
            </div>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Enroll in Course
            </button>
          </div>

          {/* Search Bar */}
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

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

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
                  Active Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    studentCourses.filter((c) => {
                      const now = new Date();
                      const start = new Date(c.startDate);
                      const end = new Date(c.endDate);
                      return start <= now && now <= end;
                    }).length
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Instructors
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    new Set(
                      studentCourses.map(
                        (c) => c.instructor?.id ?? c.instructorId
                      )
                    ).size
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
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
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Enrolled
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {course.courseCode}
                </p>
              </div>

              {/* Course Details */}
              <div className="p-6 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4 mr-2" />
                  <span>Instructor: {formatInstructorName(course)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(course.startDate).toLocaleDateString()} -{" "}
                    {new Date(course.endDate).toLocaleDateString()}
                  </span>
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
        {filteredCourses.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? "No courses found" : "No Courses Enrolled"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms"
                : "You are not enrolled in any courses yet."}
            </p>
          </div>
        )}
      </div>

      {/* Enroll Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Enroll in Course"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">Available courses:</p>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {allCourses.map((course) => (
              <div
                key={course.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {course.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {course.courseCode}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {course.description}
                </p>
                <button
                  onClick={() => handleEnrollCourse(course.id)}
                  disabled={enrolling}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? "Enrolling..." : "Enroll"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Courses;
