// Essential API service functions for dashboard functionality only
// TODO: Update BASE_URL to match your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Helper function to get auth token
const getAuthToken = () => {
  return sessionStorage.getItem("openacademy_token");
};

// Helper function to create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(error.message || "API request failed");
  }
  return response.json();
};

// ===================================================================
// AUTHENTICATION API - Essential for login/signup
// ===================================================================
export const authAPI = {
  // Global Login - determines role automatically
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },
  // Student Authentication
  student: {
    login: async (email, password) => {
      const response = await fetch(`${BASE_URL}/auth/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    register: async (userData) => {
      const response = await fetch(`${BASE_URL}/auth/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    logout: async () => {
      const response = await fetch(`${BASE_URL}/auth/student/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getCurrentUser: async () => {
      const response = await fetch(`${BASE_URL}/auth/student/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Teacher Authentication
  teacher: {
    login: async (email, password) => {
      const response = await fetch(`${BASE_URL}/auth/teacher/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    register: async (userData) => {
      const response = await fetch(`${BASE_URL}/auth/teacher/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    logout: async () => {
      const response = await fetch(`${BASE_URL}/auth/teacher/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getCurrentUser: async () => {
      const response = await fetch(`${BASE_URL}/auth/teacher/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Admin Authentication
  admin: {
    login: async (email, password) => {
      const response = await fetch(`${BASE_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    register: async (userData) => {
      const response = await fetch(`${BASE_URL}/auth/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    logout: async () => {
      const response = await fetch(`${BASE_URL}/auth/admin/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getCurrentUser: async () => {
      const response = await fetch(`${BASE_URL}/auth/admin/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },
};

// ===================================================================
// DASHBOARD API - Essential for dashboard data
// ===================================================================
export const dashboardAPI = {
  // Student Dashboard
  getStudentDashboard: async (studentId) => {
    const user = JSON.parse(localStorage.getItem("openacademy_user") || "{}");
    const id = studentId || user.id;

    if (!id) {
      throw new Error("Student ID is required");
    }

    const response = await fetch(`${BASE_URL}/dashboard/student/${id}`, {
      headers: {
        ...getAuthHeaders(),
        "X-Student-Email": user.email || "",
      },
    });
    return handleResponse(response);
  },

  getStudentStatistics: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/student/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStudentUpcomingAssignments: async () => {
    const response = await fetch(
      `${BASE_URL}/dashboard/student/upcoming-assignments`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getStudentRecentGrades: async () => {
    const response = await fetch(
      `${BASE_URL}/dashboard/student/recent-grades`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Teacher Dashboard
  getTeacherDashboard: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/teacher`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTeacherStatistics: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/teacher/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTeacherPendingSubmissions: async () => {
    const response = await fetch(
      `${BASE_URL}/dashboard/teacher/pending-submissions`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Admin Dashboard
  getAdminDashboard: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAdminStatistics: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/admin/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ===================================================================
// GRADING & FEEDBACK API - Essential for grading functionality
// ===================================================================
export const gradingAPI = {
  // Teacher grading operations
  teacher: {
    getPendingSubmissions: async () => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/pending-grading`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    gradeSubmission: async (submissionId, gradeData) => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/${submissionId}/grade`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(gradeData),
        }
      );
      return handleResponse(response);
    },

    addFeedback: async (submissionId, feedback) => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/${submissionId}/feedback`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ feedback }),
        }
      );
      return handleResponse(response);
    },

    getSubmissionById: async (submissionId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/${submissionId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getSubmissionsByAssignment: async (assignmentId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/assignment/${assignmentId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Student grade viewing
  student: {
    getMyGrades: async () => {
      const response = await fetch(`${BASE_URL}/student/grades`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getGradeBySubmission: async (submissionId) => {
      const response = await fetch(
        `${BASE_URL}/student/submissions/${submissionId}/grade`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },
};

// ===================================================================
// FILE HANDLING API - Essential for file operations
// ===================================================================
export const filesAPI = {
  // Student file operations
  student: {
    upload: async (formData) => {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/student/files/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      return handleResponse(response);
    },

    download: async (fileId) => {
      const response = await fetch(`${BASE_URL}/student/files/${fileId}`, {
        headers: getAuthHeaders(),
      });
      return response;
    },

    delete: async (fileId) => {
      const response = await fetch(`${BASE_URL}/student/files/${fileId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getMyFiles: async () => {
      const response = await fetch(`${BASE_URL}/student/files/my-files`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getFileInfo: async (fileId) => {
      const response = await fetch(`${BASE_URL}/student/files/${fileId}/info`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Teacher file operations
  teacher: {
    upload: async (formData) => {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/teacher/files/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      return handleResponse(response);
    },

    download: async (fileId) => {
      const response = await fetch(`${BASE_URL}/teacher/files/${fileId}`, {
        headers: getAuthHeaders(),
      });
      return response;
    },

    delete: async (fileId) => {
      const response = await fetch(`${BASE_URL}/teacher/files/${fileId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getMyFiles: async () => {
      const response = await fetch(`${BASE_URL}/teacher/files/my-files`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getStudentFiles: async (studentId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/files/student/${studentId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getFileInfo: async (fileId) => {
      const response = await fetch(`${BASE_URL}/teacher/files/${fileId}/info`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },
};

// ===================================================================
// BASIC OPERATIONS API - Essential basic CRUD operations
// ===================================================================
export const basicAPI = {
  // Student operations
  students: {
    getProfile: async () => {
      const response = await fetch(`${BASE_URL}/student/profile`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updateProfile: async (profileData) => {
      const response = await fetch(`${BASE_URL}/student/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    },

    getMyCourses: async () => {
      const response = await fetch(`${BASE_URL}/student/courses/my-courses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getMyAssignments: async () => {
      const response = await fetch(`${BASE_URL}/student/assignments`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Teacher operations
  teachers: {
    getProfile: async () => {
      const response = await fetch(`${BASE_URL}/teacher/profile`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updateProfile: async (profileData) => {
      const response = await fetch(`${BASE_URL}/teacher/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    },

    getMyCourses: async () => {
      const response = await fetch(`${BASE_URL}/teacher/courses/my-courses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getMyAssignments: async () => {
      const response = await fetch(`${BASE_URL}/teacher/assignments`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Admin operations
  admin: {
    getStudents: async () => {
      const response = await fetch(`${BASE_URL}/admin/students`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getTeachers: async () => {
      const response = await fetch(`${BASE_URL}/admin/teachers`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getCourses: async () => {
      const response = await fetch(`${BASE_URL}/admin/courses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },
};

// ===================================================================
// COURSE API - Course management functionality
// ===================================================================
export const courseAPI = {
  // Get all courses
  getAllCourses: async () => {
    const response = await fetch(`${BASE_URL}/courses`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create course (Teacher/Admin only)
  createCourse: async (courseData) => {
    const response = await fetch(`${BASE_URL}/courses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return handleResponse(response);
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return handleResponse(response);
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Enroll student in course
  enrollStudent: async (courseId, studentId) => {
    const response = await fetch(`${BASE_URL}/courses/${courseId}/enroll`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId }),
    });
    return handleResponse(response);
  },

  // Get course assignments
  getCourseAssignments: async (courseId) => {
    const response = await fetch(
      `${BASE_URL}/courses/${courseId}/assignments`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Create assignment for course
  createAssignment: async (courseId, assignmentData) => {
    const response = await fetch(
      `${BASE_URL}/courses/${courseId}/assignments`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      }
    );
    return handleResponse(response);
  },
};

// ===================================================================
// ASSIGNMENT API - Assignment management functionality
// ===================================================================
export const assignmentAPI = {
  // Get assignment by ID
  getAssignmentById: async (assignmentId) => {
    const response = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get all submissions for an assignment
  getAssignmentSubmissions: async (assignmentId) => {
    const response = await fetch(
      `${BASE_URL}/assignments/${assignmentId}/submissions`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Submit assignment
  submitAssignment: async (assignmentId, submissionData) => {
    const response = await fetch(
      `${BASE_URL}/assignments/${assignmentId}/submit`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(submissionData),
      }
    );
    return handleResponse(response);
  },

  // Update assignment
  updateAssignment: async (assignmentId, assignmentData) => {
    const response = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
    return handleResponse(response);
  },

  // Delete assignment
  deleteAssignment: async (assignmentId) => {
    const response = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ===================================================================
// SUBMISSION API - Submission management functionality
// ===================================================================
export const submissionAPI = {
  // Get submission by ID
  getSubmissionById: async (submissionId) => {
    const response = await fetch(`${BASE_URL}/submissions/${submissionId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Grade submission
  gradeSubmission: async (submissionId, gradeData) => {
    const response = await fetch(
      `${BASE_URL}/submissions/${submissionId}/grade`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(gradeData),
      }
    );
    return handleResponse(response);
  },

  // Update submission
  updateSubmission: async (submissionId, submissionData) => {
    const response = await fetch(`${BASE_URL}/submissions/${submissionId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(submissionData),
    });
    return handleResponse(response);
  },

  // Delete submission
  deleteSubmission: async (submissionId) => {
    const response = await fetch(`${BASE_URL}/submissions/${submissionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================
export const authUtils = {
  setToken: (token) => {
    localStorage.setItem("openacademy_token", token);
  },

  removeToken: () => {
    localStorage.removeItem("openacademy_token");
  },

  getToken: () => {
    return getAuthToken();
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// ===================================================================
// CHAT API - Real-time messaging functionality
// ===================================================================
export { default as chatAPI } from "./chatAPI";

// Export for backward compatibility
export default {
  authAPI,
  dashboardAPI,
  gradingAPI,
  filesAPI,
  basicAPI,
  courseAPI,
  assignmentAPI,
  submissionAPI,
  authUtils,
};
