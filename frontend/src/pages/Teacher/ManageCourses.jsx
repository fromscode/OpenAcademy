import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { courseAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Modal from "../../components/Common/Modal";

const ManageCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    courseCode: "",
    instructorId: user?.id || 1,
    startDate: "",
    endDate: "",
  });
  const [assignmentFormData, setAssignmentFormData] = useState({
    title: "",
    description: "",
    maxScore: 100,
    dueDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allCourses = await courseAPI.getAllCourses();

      // Filter courses taught by this instructor
      const instructorCourses = allCourses.filter(
        (course) => course.instructorId === user?.id
      );

      setCourses(instructorCourses);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!courseFormData.title || !courseFormData.courseCode) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      await courseAPI.createCourse({
        ...courseFormData,
        instructorId: user?.id || 1,
      });

      await fetchCourses();
      setShowCourseModal(false);
      resetCourseForm();
      setError(null);
    } catch (err) {
      console.error("Failed to create course:", err);
      setError("Failed to create course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    try {
      setSubmitting(true);
      await courseAPI.updateCourse(editingCourse.id, courseFormData);

      await fetchCourses();
      setShowCourseModal(false);
      setEditingCourse(null);
      resetCourseForm();
      setError(null);
    } catch (err) {
      console.error("Failed to update course:", err);
      setError("Failed to update course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await courseAPI.deleteCourse(courseId);
      await fetchCourses();
      setError(null);
    } catch (err) {
      console.error("Failed to delete course:", err);
      setError("Failed to delete course. Please try again.");
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedCourse || !assignmentFormData.title) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      await courseAPI.createAssignment(selectedCourse.id, assignmentFormData);

      setShowAssignmentModal(false);
      resetAssignmentForm();
      setError(null);
    } catch (err) {
      console.error("Failed to create assignment:", err);
      setError("Failed to create assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetCourseForm = () => {
    setCourseFormData({
      title: "",
      description: "",
      courseCode: "",
      instructorId: user?.id || 1,
      startDate: "",
      endDate: "",
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentFormData({
      title: "",
      description: "",
      maxScore: 100,
      dueDate: "",
    });
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setCourseFormData({
      title: course.title,
      description: course.description,
      courseCode: course.courseCode,
      instructorId: course.instructorId,
      startDate: course.startDate?.split("T")[0] || "",
      endDate: course.endDate?.split("T")[0] || "",
    });
    setShowCourseModal(true);
  };

  const openCreateAssignmentModal = (course) => {
    setSelectedCourse(course);
    setShowAssignmentModal(true);
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Manage Courses
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage your courses and assignments
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCourse(null);
                resetCourseForm();
                setShowCourseModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Course
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
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    courses.filter((c) => {
                      const now = new Date();
                      const start = new Date(c.startDate);
                      const end = new Date(c.endDate);
                      return start <= now && now <= end;
                    }).length
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  This Semester
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    courses.filter(
                      (c) =>
                        new Date(c.startDate).getFullYear() ===
                        new Date().getFullYear()
                    ).length
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
            >
              {/* Course Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(course)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit course"
                    >
                      <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Delete course"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
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
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(course.startDate).toLocaleDateString()} -{" "}
                    {new Date(course.endDate).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => openCreateAssignmentModal(course)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Assignment
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? "No courses found" : "No Courses Yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first course to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingCourse(null);
                  resetCourseForm();
                  setShowCourseModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Course
              </button>
            )}
          </div>
        )}
      </div>

      {/* Course Modal */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setEditingCourse(null);
          resetCourseForm();
        }}
        title={editingCourse ? "Edit Course" : "Create New Course"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={courseFormData.title}
              onChange={(e) =>
                setCourseFormData({ ...courseFormData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Advanced Java Programming"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Code *
            </label>
            <input
              type="text"
              value={courseFormData.courseCode}
              onChange={(e) =>
                setCourseFormData({
                  ...courseFormData,
                  courseCode: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., JAVA-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={courseFormData.description}
              onChange={(e) =>
                setCourseFormData({
                  ...courseFormData,
                  description: e.target.value,
                })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Course description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={courseFormData.startDate}
                onChange={(e) =>
                  setCourseFormData({
                    ...courseFormData,
                    startDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={courseFormData.endDate}
                onChange={(e) =>
                  setCourseFormData({
                    ...courseFormData,
                    endDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setShowCourseModal(false);
                setEditingCourse(null);
                resetCourseForm();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
              disabled={
                submitting ||
                !courseFormData.title ||
                !courseFormData.courseCode
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Saving..."
                : editingCourse
                ? "Update Course"
                : "Create Course"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedCourse(null);
          resetAssignmentForm();
        }}
        title={`Create Assignment for ${selectedCourse?.title}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              value={assignmentFormData.title}
              onChange={(e) =>
                setAssignmentFormData({
                  ...assignmentFormData,
                  title: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Midterm Project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={assignmentFormData.description}
              onChange={(e) =>
                setAssignmentFormData({
                  ...assignmentFormData,
                  description: e.target.value,
                })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Assignment description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Score *
              </label>
              <input
                type="number"
                value={assignmentFormData.maxScore}
                onChange={(e) =>
                  setAssignmentFormData({
                    ...assignmentFormData,
                    maxScore: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date *
              </label>
              <input
                type="datetime-local"
                value={assignmentFormData.dueDate}
                onChange={(e) =>
                  setAssignmentFormData({
                    ...assignmentFormData,
                    dueDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setShowAssignmentModal(false);
                setSelectedCourse(null);
                resetAssignmentForm();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAssignment}
              disabled={
                submitting ||
                !assignmentFormData.title ||
                !assignmentFormData.dueDate
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageCourses;
