// Essential API service functions for dashboard functionality only
// TODO: Update BASE_URL to match your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("openacademy_token");
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
  getStudentDashboard: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/student`, {
      headers: getAuthHeaders(),
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

// Export for backward compatibility
export default {
  authAPI,
  dashboardAPI,
  gradingAPI,
  filesAPI,
  basicAPI,
  authUtils,
};
