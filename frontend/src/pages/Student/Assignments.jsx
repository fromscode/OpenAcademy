import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Award,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { courseAPI, assignmentAPI, submissionAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Modal from "../../components/Common/Modal";
import { formatDateTimeDDMMYYYY } from "../../utils/date";

const Assignments = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    content: "",
    fileUrl: "",
  });
  const [submittedMap, setSubmittedMap] = useState({}); // assignmentId -> submission object
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState(null);
  const [gradeDetails, setGradeDetails] = useState(null); // fetched grade details for selected submission
  const [selectedGradedAssignment, setSelectedGradedAssignment] =
    useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    // Refetch when the authenticated user becomes available/changes
    if (user?.id) fetchAssignments();
  }, [user?.id]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get only courses the current student is enrolled in
      if (!user?.id) {
        setStudentAssignments([]);
        setSubmittedMap({});
        setIsLoading(false);
        return;
      }

      const courses = await courseAPI.getStudentCourses(user.id);

      // Get assignments for each course
      const allAssignments = [];
      for (const course of courses) {
        try {
          const assignments = await courseAPI.getCourseAssignments(course.id);
          // Add course info to each assignment
          assignments.forEach((assignment) => {
            allAssignments.push({
              ...assignment,
              courseName: course.title,
              courseCode: course.courseCode,
              courseId: course.id,
              // Derive teacher/instructor name from course instructor fields
              teacherName: [
                course?.instructor?.firstName,
                course?.instructor?.middleName,
                course?.instructor?.lastName,
              ]
                .filter(Boolean)
                .join(" "),
            });
          });
        } catch (err) {
          console.error(
            `Failed to fetch assignments for course ${course.id}:`,
            err
          );
        }
      }

      setStudentAssignments(allAssignments);

      // Fetch submission status for each assignment for this student
      const map = {};
      await Promise.all(
        allAssignments.map(async (a) => {
          try {
            const sub = await submissionAPI.getStudentSubmissionForAssignment(
              a.id,
              user.id
            );
            if (sub) map[a.id] = sub;
          } catch (e) {
            // ignore per-assignment errors to avoid blocking the page
          }
        })
      );
      setSubmittedMap(map);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setError("Failed to load assignments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !user?.id) {
      setError("Missing required information");
      return;
    }

    if (!submissionData.content.trim()) {
      setError("Please provide submission content");
      return;
    }

    try {
      setSubmitting(true);
      await assignmentAPI.submitAssignment(selectedAssignment.id, {
        studentId: user.id,
        content: submissionData.content,
        fileUrl: submissionData.fileUrl,
      });

      // Refresh assignments
      await fetchAssignments();

      // Close modal and reset
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSubmissionData({ content: "", fileUrl: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      setError("Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
    setError(null);
  };

  const openViewGrade = async (assignment, submission) => {
    setSelectedGradedAssignment(assignment);
    setSelectedSubmission(submission);
    setShowGradeModal(true);
    setGradeError(null);
    // Display basic submission data (grade is already in submission object)
    setGradeDetails(null);
    setGradeLoading(false);
  };

  const getFilteredAssignments = () => {
    // Note: Backend might not return submission status per student
    // This is a simplified version - adjust based on actual API response
    return studentAssignments;
  };

  const filteredAssignments = getFilteredAssignments();

  const getStatusIcon = (status) => {
    switch (status) {
      case "graded":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "submitted":
        return <Upload className="h-5 w-5 text-blue-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "graded":
        return "Graded";
      case "submitted":
        return "Submitted";
      case "in_progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "not_started":
        return "Not Started";
      default:
        return "Available";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "graded":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "not_started":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate stats dynamically
  const stats = {
    total: studentAssignments.length,
    pending: studentAssignments.filter((a) => !isOverdue(a.dueDate)).length,
    submitted: Object.keys(submittedMap).length,
    graded: Object.values(submittedMap).filter(
      (s) => s && s.grade !== null && s.grade !== undefined
    ).length,
  };

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
            My Assignments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your assignments
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
                  Total
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
                  Pending
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.pending}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Submitted
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.submitted}
                </p>
              </div>
              <Upload className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Graded
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.graded}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const overdue = isOverdue(assignment.dueDate);
            const daysUntil = getDaysUntilDue(assignment.dueDate);
            const submission = submittedMap[assignment.id];
            const alreadySubmitted = !!submission;
            const isGradedSubmission =
              alreadySubmitted &&
              submission.grade !== null &&
              submission.grade !== undefined;

            return (
              <div
                key={assignment.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all duration-200 ${
                  overdue
                    ? "border-red-300 dark:border-red-700"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {assignment.courseName || "Course"} (
                            {assignment.courseCode || "N/A"})
                          </span>
                        </div>
                        {assignment.teacherName && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Instructor: {assignment.teacherName}
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {assignment.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          alreadySubmitted
                            ? isGradedSubmission
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {alreadySubmitted
                          ? isGradedSubmission
                            ? "Graded"
                            : "Submitted"
                          : "Available"}
                      </span>
                      {assignment.maxScore && (
                        <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full">
                          <Award className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {assignment.maxScore} pts
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Due: {formatDateTimeDDMMYYYY(assignment.dueDate)}
                      </span>
                      {overdue && (
                        <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                          (Overdue)
                        </span>
                      )}
                      {!overdue && daysUntil >= 0 && daysUntil <= 7 && (
                        <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                          ({daysUntil} days left)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Award className="h-4 w-4 mr-2" />
                      <span>Max Score: {assignment.maxScore || 100}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 flex justify-end">
                    {alreadySubmitted ? (
                      isGradedSubmission ? (
                        <button
                          onClick={() => openViewGrade(assignment, submission)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                          View Grade
                        </button>
                      ) : (
                        <span className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                          Already submitted
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => openSubmitModal(assignment)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Submit Assignment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAssignments.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Assignments Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have any assignments yet.
            </p>
          </div>
        )}
      </div>

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setSelectedAssignment(null);
          setSubmissionData({ content: "", fileUrl: "" });
        }}
        title="Submit Assignment"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {selectedAssignment?.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedAssignment?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Submission Content *
            </label>
            <textarea
              value={submissionData.content}
              onChange={(e) =>
                setSubmissionData({
                  ...submissionData,
                  content: e.target.value,
                })
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your submission content or description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File URL (optional)
            </label>
            <input
              type="url"
              value={submissionData.fileUrl}
              onChange={(e) =>
                setSubmissionData({
                  ...submissionData,
                  fileUrl: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/username/repo or drive link..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowSubmitModal(false);
                setSelectedAssignment(null);
                setSubmissionData({ content: "", fileUrl: "" });
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAssignment}
              disabled={submitting || !submissionData.content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Grade Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => {
          setShowGradeModal(false);
          setSelectedGradedAssignment(null);
          setSelectedSubmission(null);
          setGradeDetails(null);
          setGradeError(null);
          setGradeLoading(false);
        }}
        title="Assignment Grade"
      >
        {gradeLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            {gradeError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {gradeError}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {selectedGradedAssignment?.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedGradedAssignment?.courseName} (
                {selectedGradedAssignment?.courseCode})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/40">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Grade
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {gradeDetails?.grade ?? selectedSubmission?.grade ?? "—"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/40">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Max Score
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {selectedGradedAssignment?.maxScore ?? "—"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/40">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Status
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  Graded
                </p>
              </div>
            </div>

            {(gradeDetails?.feedback || selectedSubmission?.feedback) && (
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Feedback
                </p>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  {gradeDetails?.feedback ?? selectedSubmission?.feedback}
                </div>
              </div>
            )}

            {(gradeDetails?.gradedAt || selectedSubmission?.gradedAt) && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Graded on:{" "}
                {formatDateTimeDDMMYYYY(
                  gradeDetails?.gradedAt || selectedSubmission?.gradedAt
                )}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Assignments;
