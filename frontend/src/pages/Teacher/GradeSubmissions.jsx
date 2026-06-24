import { useState, useEffect } from "react";
import {
  FileText,
  Award,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { courseAPI, assignmentAPI, submissionAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Modal from "../../components/Common/Modal";
import { formatDateTimeDDMMYYYY } from "../../utils/date";

const GradeSubmissions = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeData, setGradeData] = useState({
    grade: "",
    feedback: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments(selectedCourse.id);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions(selectedAssignment.id);
    }
  }, [selectedAssignment]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!user?.id) throw new Error("Missing teacher id");
      const instructorCourses = await courseAPI.getInstructorCourses(user.id);

      setCourses(instructorCourses);

      if (instructorCourses.length > 0) {
        setSelectedCourse(instructorCourses[0]);
      } else {
        setSelectedCourse(null);
        setAssignments([]);
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async (courseId) => {
    try {
      const courseAssignments = await courseAPI.getCourseAssignments(courseId);
      setAssignments(courseAssignments);

      if (courseAssignments.length > 0) {
        setSelectedAssignment(courseAssignments[0]);
      } else {
        setSelectedAssignment(null);
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setError("Failed to load assignments.");
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const assignmentSubmissions =
        await assignmentAPI.getAssignmentSubmissions(assignmentId);
      setSubmissions(assignmentSubmissions);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setError("Failed to load submissions.");
      setSubmissions([]);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !gradeData.grade) {
      setError("Please provide a grade");
      return;
    }

    try {
      setSubmitting(true);
      await submissionAPI.gradeSubmission(selectedSubmission.id, {
        grade: Number(gradeData.grade),
        feedback: gradeData.feedback,
      });

      // Refresh submissions
      if (selectedAssignment) {
        await fetchSubmissions(selectedAssignment.id);
      }

      setShowGradeModal(false);
      setSelectedSubmission(null);
      setGradeData({ grade: "", feedback: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to grade submission:", err);
      setError("Failed to grade submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade?.toString() || "",
      feedback: submission.feedback || "",
    });
    setShowGradeModal(true);
    setError(null);
  };

  const getFilteredSubmissions = () => {
    if (!searchTerm) return submissions;

    return submissions.filter(
      (submission) =>
        submission.student?.id?.toString().includes(searchTerm) ||
        submission.student?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        submission.student?.firstName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        submission.student?.lastName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        submission.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredSubmissions = getFilteredSubmissions();

  const gradedCount = submissions.filter(
    (s) => s.grade !== null && s.grade !== undefined
  ).length;
  const pendingCount = submissions.length - gradedCount;

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
            Grade Submissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and grade student submissions
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Submissions
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {submissions.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Pending
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {pendingCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Graded
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {gradedCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {gradedCount > 0
                    ? Math.round(
                        submissions
                          .filter((s) => s.grade !== null)
                          .reduce((sum, s) => sum + s.grade, 0) / gradedCount
                      )
                    : 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course
              </label>
              <select
                value={selectedCourse?.id || ""}
                onChange={(e) => {
                  const course = courses.find(
                    (c) => c.id === Number(e.target.value)
                  );
                  setSelectedCourse(course);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignment
              </label>
              <select
                value={selectedAssignment?.id || ""}
                onChange={(e) => {
                  const assignment = assignments.find(
                    (a) => a.id === Number(e.target.value)
                  );
                  setSelectedAssignment(assignment);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                disabled={!selectedCourse || assignments.length === 0}
              >
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Student:{" "}
                        {submission.student?.fullName ||
                          `${submission.student?.firstName || ""} ${
                            submission.student?.lastName || ""
                          }`.trim()}{" "}
                        <span className="font-normal text-gray-600 dark:text-gray-400">
                          (ID: {submission.student?.id})
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Submitted:{" "}
                          {submission.submittedAt
                            ? formatDateTimeDDMMYYYY(submission.submittedAt)
                            : "--"}
                        </span>
                      </div>
                      <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <strong>Content:</strong>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {submission.content}
                        </p>
                        {submission.fileUrl && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-900 dark:text-white">
                              <strong>File URL:</strong>
                            </p>
                            <a
                              href={submission.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {submission.fileUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {submission.grade !== null &&
                    submission.grade !== undefined ? (
                      <>
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                          <Award className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {submission.grade}/
                            {selectedAssignment?.maxScore || 100}
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Graded
                        </span>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {submission.feedback && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Your Feedback:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => openGradeModal(submission)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {submission.grade !== null && submission.grade !== undefined
                      ? "Update Grade"
                      : "Grade Submission"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSubmissions.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Submissions Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedAssignment
                ? "No submissions for this assignment yet."
                : "Select an assignment to view submissions."}
            </p>
          </div>
        )}
      </div>

      {/* Grade Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => {
          setShowGradeModal(false);
          setSelectedSubmission(null);
          setGradeData({ grade: "", feedback: "" });
        }}
        title="Grade Submission"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <strong>Student:</strong>{" "}
              {selectedSubmission?.student?.fullName ||
                `${selectedSubmission?.student?.firstName || ""} ${
                  selectedSubmission?.student?.lastName || ""
                }`.trim()}{" "}
              (ID: {selectedSubmission?.student?.id})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grade (out of {selectedAssignment?.maxScore || 100}) *
            </label>
            <input
              type="number"
              min="0"
              max={selectedAssignment?.maxScore || 100}
              value={gradeData.grade}
              onChange={(e) =>
                setGradeData({ ...gradeData, grade: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feedback
            </label>
            <textarea
              value={gradeData.feedback}
              onChange={(e) =>
                setGradeData({ ...gradeData, feedback: e.target.value })
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Provide feedback for the student..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setShowGradeModal(false);
                setSelectedSubmission(null);
                setGradeData({ grade: "", feedback: "" });
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleGradeSubmission}
              disabled={submitting || !gradeData.grade}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Submit Grade"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GradeSubmissions;
