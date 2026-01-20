import { useState } from "react";
import {
  Award,
  TrendingUp,
  BookOpen,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Grades = () => {
  const [expandedCourse, setExpandedCourse] = useState(null);

  // No grades - will be loaded from backend API
  const studentGrades = [];

  // Calculate overall GPA
  const calculateGPA = () => {
    if (studentGrades.length === 0) return 0;
    const totalPercentage = studentGrades.reduce(
      (sum, grade) => sum + grade.percentage,
      0
    );
    const avgPercentage = totalPercentage / studentGrades.length;

    // Convert percentage to GPA (4.0 scale)
    if (avgPercentage >= 93) return 4.0;
    if (avgPercentage >= 90) return 3.7;
    if (avgPercentage >= 87) return 3.3;
    if (avgPercentage >= 83) return 3.0;
    if (avgPercentage >= 80) return 2.7;
    if (avgPercentage >= 77) return 2.3;
    if (avgPercentage >= 73) return 2.0;
    if (avgPercentage >= 70) return 1.7;
    if (avgPercentage >= 67) return 1.3;
    if (avgPercentage >= 65) return 1.0;
    return 0.0;
  };

  const overallGPA = calculateGPA();
  const avgPercentage =
    studentGrades.reduce((sum, grade) => sum + grade.percentage, 0) /
      studentGrades.length || 0;

  const getGradeColor = (letterGrade) => {
    if (letterGrade.startsWith("A"))
      return "text-green-600 dark:text-green-400";
    if (letterGrade.startsWith("B")) return "text-blue-600 dark:text-blue-400";
    if (letterGrade.startsWith("C"))
      return "text-yellow-600 dark:text-yellow-400";
    if (letterGrade.startsWith("D"))
      return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeBgColor = (letterGrade) => {
    if (letterGrade.startsWith("A"))
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    if (letterGrade.startsWith("B"))
      return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
    if (letterGrade.startsWith("C"))
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
    if (letterGrade.startsWith("D"))
      return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
    return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
  };

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Grades
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your academic performance
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium opacity-90">Overall GPA</h3>
              <Award className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-1">{overallGPA.toFixed(2)}</p>
            <p className="text-sm opacity-80">Out of 4.0</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600 dark:text-gray-400">
                Average Percentage
              </h3>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {avgPercentage.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Across all courses
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600 dark:text-gray-400">
                Courses
              </h3>
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {studentGrades.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enrolled this semester
            </p>
          </div>
        </div>

        {/* Course Grades */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Course Performance
          </h2>

          {studentGrades.map((grade) => (
            <div
              key={grade.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Course Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleCourse(grade.courseId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {grade.courseName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {grade.courseCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`text-3xl font-bold ${getGradeColor(
                          grade.letterGrade
                        )}`}
                      >
                        {grade.letterGrade}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {grade.percentage.toFixed(1)}%
                      </p>
                    </div>
                    {expandedCourse === grade.courseId ? (
                      <ChevronUp className="h-6 w-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCourse === grade.courseId && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50">
                  {/* Grade Breakdown */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Grade Breakdown
                    </h4>
                    <div className="space-y-3">
                      {/* Assignment Scores */}
                      {grade.assignmentScores.map((assignment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {assignment.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (assignment.score / assignment.maxScore) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span
                              className={`text-sm font-medium ${getGradeBgColor(
                                grade.letterGrade
                              )} px-2 py-1 rounded`}
                            >
                              {assignment.score}/{assignment.maxScore}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Midterm Score */}
                      {grade.midtermScore !== null && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Midterm Exam
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${grade.midtermScore}%` }}
                              />
                            </div>
                            <span
                              className={`text-sm font-medium ${getGradeBgColor(
                                grade.letterGrade
                              )} px-2 py-1 rounded`}
                            >
                              {grade.midtermScore}/100
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Final Score */}
                      {grade.finalScore !== null ? (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Final Exam
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${grade.finalScore}%` }}
                              />
                            </div>
                            <span
                              className={`text-sm font-medium ${getGradeBgColor(
                                grade.letterGrade
                              )} px-2 py-1 rounded`}
                            >
                              {grade.finalScore}/100
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Final Exam
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Not yet taken
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Grade Summary */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Current Grade
                      </span>
                      <span
                        className={`text-2xl font-bold ${getGradeColor(
                          grade.currentGrade
                        )}`}
                      >
                        {grade.currentGrade} ({grade.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {studentGrades.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Grades Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your grades will appear here once your instructors post them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;
