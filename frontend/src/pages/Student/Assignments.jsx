import { useState } from "react";
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
import { mockStudentAssignments } from "../../data/mockData";

const Assignments = () => {
  const [filter, setFilter] = useState("all");

  // Get current student's assignments
  // In the future, replace with actual API call
  const studentAssignments = mockStudentAssignments.filter(
    (assignment) => assignment.studentId === 1
  );

  const getFilteredAssignments = () => {
    switch (filter) {
      case "pending":
        return studentAssignments.filter((a) => a.status === "pending");
      case "in_progress":
        return studentAssignments.filter((a) => a.status === "in_progress");
      case "submitted":
        return studentAssignments.filter((a) => a.status === "submitted");
      case "graded":
        return studentAssignments.filter((a) => a.status === "graded");
      default:
        return studentAssignments;
    }
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
        return status;
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

  const isOverdue = (dueDate, status) => {
    if (status === "graded" || status === "submitted") return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate stats
  const stats = {
    total: studentAssignments.length,
    pending: studentAssignments.filter(
      (a) => a.status === "pending" || a.status === "not_started"
    ).length,
    submitted: studentAssignments.filter((a) => a.status === "submitted")
      .length,
    graded: studentAssignments.filter((a) => a.status === "graded").length,
  };

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

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "all", label: "All Assignments" },
            { key: "pending", label: "Pending" },
            { key: "in_progress", label: "In Progress" },
            { key: "submitted", label: "Submitted" },
            { key: "graded", label: "Graded" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const overdue = isOverdue(assignment.dueDate, assignment.status);
            const daysUntil = getDaysUntilDue(assignment.dueDate);

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
                            {assignment.courseName} ({assignment.courseCode})
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {assignment.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {getStatusIcon(assignment.status)}
                        {getStatusText(assignment.status)}
                      </span>
                      {assignment.grade !== null && (
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                          <Award className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {assignment.grade}/{assignment.maxGrade}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      {overdue && (
                        <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                          (Overdue)
                        </span>
                      )}
                      {!overdue &&
                        daysUntil >= 0 &&
                        daysUntil <= 7 &&
                        assignment.status !== "graded" &&
                        assignment.status !== "submitted" && (
                          <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                            ({daysUntil} days left)
                          </span>
                        )}
                    </div>

                    {assignment.submittedDate && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Upload className="h-4 w-4 mr-2" />
                        <span>
                          Submitted:{" "}
                          {new Date(
                            assignment.submittedDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Award className="h-4 w-4 mr-2" />
                      <span>Max Points: {assignment.maxGrade}</span>
                    </div>
                  </div>

                  {/* Feedback */}
                  {assignment.feedback && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Teacher Feedback:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {assignment.feedback}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-4 flex justify-end">
                    {assignment.status === "not_started" ||
                    assignment.status === "in_progress" ? (
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        Submit Assignment
                      </button>
                    ) : assignment.status === "submitted" ? (
                      <button className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium cursor-not-allowed">
                        Waiting for Grade
                      </button>
                    ) : (
                      <button className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium">
                        View Submission
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAssignments.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Assignments Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === "all"
                ? "You don't have any assignments yet."
                : `No ${filter} assignments at the moment.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
