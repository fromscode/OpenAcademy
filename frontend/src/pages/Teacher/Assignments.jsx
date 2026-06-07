import { useEffect, useMemo, useState } from "react";
import { FileText, Calendar, Award, Edit2, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { courseAPI, assignmentAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Modal from "../../components/Common/Modal";

const TeacherAssignments = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]); // flattened with course info
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    maxScore: 100,
    dueDate: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all courses and filter by current instructor like ManageCourses
      const allCourses = await courseAPI.getAllCourses();
      const currentInstructorId = user?.id;
      const instructorCourses = allCourses.filter((course) => {
        const courseInstructorId =
          course.instructorId ?? course.instructor?.id ?? null;
        return (
          courseInstructorId !== null &&
          String(courseInstructorId) === String(currentInstructorId)
        );
      });
      setCourses(instructorCourses);

      // Fetch assignments per course
      const agg = [];
      for (const course of instructorCourses) {
        try {
          const list = await courseAPI.getCourseAssignments(course.id);
          list.forEach((a) =>
            agg.push({
              ...a,
              courseId: course.id,
              courseName: course.title,
              courseCode: course.courseCode,
            })
          );
        } catch (e) {
          // Continue even if a course fails to fetch
        }
      }
      // Order by due date ASC
      agg.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setAssignments(agg);
    } catch (e) {
      console.error("Failed to fetch assignments:", e);
      setError("Failed to load assignments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (assignment) => {
    setEditingAssignment(assignment);
    setForm({
      title: assignment.title || "",
      description: assignment.description || "",
      maxScore: assignment.maxScore ?? 100,
      dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 16) : "",
      content: assignment.content || "",
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingAssignment) return;
    try {
      setSaving(true);
      // Backend expects LocalDateTime; ensure ISO string
      const payload = {
        title: form.title,
        description: form.description,
        maxScore: Number(form.maxScore),
        dueDate: form.dueDate, // datetime-local provides ISO-like string (YYYY-MM-DDTHH:mm)
        content: form.content,
      };
      await assignmentAPI.updateAssignment(editingAssignment.id, payload);
      setEditModalOpen(false);
      setEditingAssignment(null);
      await fetchAll();
    } catch (e) {
      console.error("Failed to update assignment:", e);
      setError("Failed to update assignment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: assignments.length,
      byCourse: courses.reduce((acc, c) => {
        acc[c.id] = assignments.filter((a) => a.courseId === c.id).length;
        return acc;
      }, {}),
    }),
    [assignments, courses]
  );

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
            Assignments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and edit your course assignments
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Assignments
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {courses.length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Upcoming (by due date)
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    assignments.filter((a) => new Date(a.dueDate) >= new Date())
                      .length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Assignment List */}
        <div className="space-y-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {a.courseName} ({a.courseCode})
                        </span>
                      </div>
                      {a.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {a.description}
                        </p>
                      )}
                      {a.content && (
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded line-clamp-2">
                          <span className="font-medium">Content:</span>{" "}
                          {a.content}
                        </p>
                      )}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" /> Due:{" "}
                          {new Date(a.dueDate).toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2" /> Max Score:{" "}
                          {a.maxScore}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(a)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Assignments
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create assignments from Manage Courses.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingAssignment(null);
        }}
        title="Edit Assignment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Assignment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Assignment description"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Score *
              </label>
              <input
                type="number"
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
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
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Assignment content, instructions, or requirements..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setEditModalOpen(false);
                setEditingAssignment(null);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={saving || !form.title || !form.dueDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherAssignments;
