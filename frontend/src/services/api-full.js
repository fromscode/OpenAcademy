// API service functions for backend communication
// Essential API endpoints for dashboard functionality only
// TODO: Update BASE_URL to match your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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

// Auth API calls - Role Specific Only
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

    refreshToken: async (refreshToken) => {
      const response = await fetch(`${BASE_URL}/auth/student/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      return handleResponse(response);
    },

    getCurrentUser: async () => {
      const response = await fetch(`${BASE_URL}/auth/student/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    forgotPassword: async (email) => {
      const response = await fetch(`${BASE_URL}/auth/student/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },

    resetPassword: async (token, newPassword) => {
      const response = await fetch(`${BASE_URL}/auth/student/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
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
        headers: getAuthHeaders(),
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

    refreshToken: async (refreshToken) => {
      const response = await fetch(`${BASE_URL}/auth/teacher/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      return handleResponse(response);
    },

    getCurrentUser: async () => {
      const response = await fetch(`${BASE_URL}/auth/teacher/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    forgotPassword: async (email) => {
      const response = await fetch(`${BASE_URL}/auth/teacher/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },

    resetPassword: async (token, newPassword) => {
      const response = await fetch(`${BASE_URL}/auth/teacher/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
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
        headers: getAuthHeaders(),
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

    refreshToken: async (refreshToken) => {
      const response = await fetch(`${BASE_URL}/auth/admin/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      return handleResponse(response);
    },

    getCurrentUser: async () => {
      const response = await fetch(`${BASE_URL}/auth/admin/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    forgotPassword: async (email) => {
      const response = await fetch(`${BASE_URL}/auth/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },

    resetPassword: async (token, newPassword) => {
      const response = await fetch(`${BASE_URL}/auth/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      return handleResponse(response);
    },
  },
};

// Students API calls
export const studentsAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/students`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/students/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (studentData) => {
    const response = await fetch(`${BASE_URL}/students`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  update: async (id, studentData) => {
    const response = await fetch(`${BASE_URL}/students/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/students/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Teachers API calls
export const teachersAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/teachers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/teachers/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (teacherData) => {
    const response = await fetch(`${BASE_URL}/teachers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(teacherData),
    });
    return handleResponse(response);
  },

  update: async (id, teacherData) => {
    const response = await fetch(`${BASE_URL}/teachers/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(teacherData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/teachers/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Courses API calls - Role Specific
export const coursesAPI = {
  // Student Course Operations
  student: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/student/courses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${BASE_URL}/student/courses/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getMyCourses: async () => {
      const response = await fetch(`${BASE_URL}/student/courses/my-courses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    enroll: async (courseId) => {
      const response = await fetch(
        `${BASE_URL}/student/courses/${courseId}/enroll`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    unenroll: async (courseId) => {
      const response = await fetch(
        `${BASE_URL}/student/courses/${courseId}/unenroll`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Teacher Course Operations
  teacher: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/teacher/courses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${BASE_URL}/teacher/courses/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getMyCourses: async () => {
      const response = await fetch(`${BASE_URL}/teacher/courses/my-courses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    create: async (courseData) => {
      const response = await fetch(`${BASE_URL}/teacher/courses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });
      return handleResponse(response);
    },

    update: async (id, courseData) => {
      const response = await fetch(`${BASE_URL}/teacher/courses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${BASE_URL}/teacher/courses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getStudents: async (courseId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/courses/${courseId}/students`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Admin Course Operations
  admin: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/admin/courses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${BASE_URL}/admin/courses/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    create: async (courseData) => {
      const response = await fetch(`${BASE_URL}/admin/courses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });
      return handleResponse(response);
    },

    update: async (id, courseData) => {
      const response = await fetch(`${BASE_URL}/admin/courses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${BASE_URL}/admin/courses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    assignTeacher: async (courseId, teacherId) => {
      const response = await fetch(
        `${BASE_URL}/admin/courses/${courseId}/assign-teacher`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ teacherId }),
        }
      );
      return handleResponse(response);
    },
  },
};

// Assignments API calls - Role Specific
export const assignmentsAPI = {
  // Student Assignment Operations
  student: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/student/assignments`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${BASE_URL}/student/assignments/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getByCourse: async (courseId) => {
      const response = await fetch(
        `${BASE_URL}/student/assignments/course/${courseId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getUpcoming: async () => {
      const response = await fetch(`${BASE_URL}/student/assignments/upcoming`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getCompleted: async () => {
      const response = await fetch(
        `${BASE_URL}/student/assignments/completed`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Teacher Assignment Operations
  teacher: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/teacher/assignments`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${BASE_URL}/teacher/assignments/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getByCourse: async (courseId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/assignments/course/${courseId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getMyAssignments: async () => {
      const response = await fetch(
        `${BASE_URL}/teacher/assignments/my-assignments`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    create: async (assignmentData) => {
      const response = await fetch(`${BASE_URL}/teacher/assignments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });
      return handleResponse(response);
    },

    update: async (id, assignmentData) => {
      const response = await fetch(`${BASE_URL}/teacher/assignments/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${BASE_URL}/teacher/assignments/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Admin Assignment Operations
  admin: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/admin/assignments`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${BASE_URL}/admin/assignments/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getByCourse: async (courseId) => {
      const response = await fetch(
        `${BASE_URL}/admin/assignments/course/${courseId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getByTeacher: async (teacherId) => {
      const response = await fetch(
        `${BASE_URL}/admin/assignments/teacher/${teacherId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${BASE_URL}/admin/assignments/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },
};

// Submissions API calls - Role Specific
export const submissionsAPI = {
  // Student Submission Operations
  student: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/student/submissions`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${BASE_URL}/student/submissions/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getByAssignment: async (assignmentId) => {
      const response = await fetch(
        `${BASE_URL}/student/submissions/assignment/${assignmentId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getMySubmissions: async () => {
      const response = await fetch(
        `${BASE_URL}/student/submissions/my-submissions`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    create: async (submissionData) => {
      const response = await fetch(`${BASE_URL}/student/submissions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(submissionData),
      });
      return handleResponse(response);
    },

    update: async (id, submissionData) => {
      const response = await fetch(`${BASE_URL}/student/submissions/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(submissionData),
      });
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${BASE_URL}/student/submissions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Teacher Submission Operations
  teacher: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/teacher/submissions`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${BASE_URL}/teacher/submissions/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getByAssignment: async (assignmentId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/assignment/${assignmentId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getByStudent: async (studentId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/student/${studentId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getPendingGrading: async () => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/pending-grading`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    grade: async (id, gradeData) => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/${id}/grade`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(gradeData),
        }
      );
      return handleResponse(response);
    },

    addFeedback: async (id, feedback) => {
      const response = await fetch(
        `${BASE_URL}/teacher/submissions/${id}/feedback`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ feedback }),
        }
      );
      return handleResponse(response);
    },
  },

  // Admin Submission Operations
  admin: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/admin/submissions`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${BASE_URL}/admin/submissions/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getByAssignment: async (assignmentId) => {
      const response = await fetch(
        `${BASE_URL}/admin/submissions/assignment/${assignmentId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getByStudent: async (studentId) => {
      const response = await fetch(
        `${BASE_URL}/admin/submissions/student/${studentId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getByTeacher: async (teacherId) => {
      const response = await fetch(
        `${BASE_URL}/admin/submissions/teacher/${teacherId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${BASE_URL}/admin/submissions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },
};

// Messages API calls - Role Specific
export const messagesAPI = {
  // Student Message Operations
  student: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/student/messages`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getConversation: async (userId) => {
      const response = await fetch(
        `${BASE_URL}/student/messages/conversation/${userId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    send: async (messageData) => {
      const response = await fetch(`${BASE_URL}/student/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      });
      return handleResponse(response);
    },

    markAsRead: async (messageId) => {
      const response = await fetch(
        `${BASE_URL}/student/messages/${messageId}/read`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getTeachers: async () => {
      const response = await fetch(`${BASE_URL}/student/messages/teachers`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Teacher Message Operations
  teacher: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/teacher/messages`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getConversation: async (userId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/messages/conversation/${userId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    send: async (messageData) => {
      const response = await fetch(`${BASE_URL}/teacher/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      });
      return handleResponse(response);
    },

    markAsRead: async (messageId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/messages/${messageId}/read`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getStudents: async () => {
      const response = await fetch(`${BASE_URL}/teacher/messages/students`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    broadcastToClass: async (courseId, messageData) => {
      const response = await fetch(
        `${BASE_URL}/teacher/messages/broadcast/${courseId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(messageData),
        }
      );
      return handleResponse(response);
    },
  },

  // Admin Message Operations
  admin: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/admin/messages`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getConversation: async (userId) => {
      const response = await fetch(
        `${BASE_URL}/admin/messages/conversation/${userId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    send: async (messageData) => {
      const response = await fetch(`${BASE_URL}/admin/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      });
      return handleResponse(response);
    },

    markAsRead: async (messageId) => {
      const response = await fetch(
        `${BASE_URL}/admin/messages/${messageId}/read`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    getAllUsers: async () => {
      const response = await fetch(`${BASE_URL}/admin/messages/users`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    broadcastToAll: async (messageData) => {
      const response = await fetch(`${BASE_URL}/admin/messages/broadcast`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      });
      return handleResponse(response);
    },

    delete: async (messageId) => {
      const response = await fetch(`${BASE_URL}/admin/messages/${messageId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },
};

// Dashboard API calls
export const dashboardAPI = {
  // Student Dashboard
  getStudentDashboard: async (/* studentId */) => {
    const response = await fetch(`${BASE_URL}/dashboard/student`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStudentStatistics: async (/* studentId */) => {
    const response = await fetch(`${BASE_URL}/dashboard/student/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStudentUpcomingAssignments: async (/* studentId */) => {
    const response = await fetch(
      `${BASE_URL}/dashboard/student/upcoming-assignments`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getStudentRecentGrades: async (/* studentId */) => {
    const response = await fetch(
      `${BASE_URL}/dashboard/student/recent-grades`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Teacher Dashboard
  getTeacherDashboard: async (/* teacherId */) => {
    const response = await fetch(`${BASE_URL}/dashboard/teacher`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTeacherStatistics: async (/* teacherId */) => {
    const response = await fetch(`${BASE_URL}/dashboard/teacher/statistics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTeacherPendingSubmissions: async (/* teacherId */) => {
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

  getAdminRecentActivities: async () => {
    const response = await fetch(
      `${BASE_URL}/dashboard/admin/recent-activities`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Notifications API calls - Role Specific
export const notificationsAPI = {
  // Student Notifications
  student: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/student/notifications`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getUnreadCount: async () => {
      const response = await fetch(`${BASE_URL}/student/notifications/count`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    markAsRead: async (notificationId) => {
      const response = await fetch(
        `${BASE_URL}/student/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    markAllAsRead: async () => {
      const response = await fetch(
        `${BASE_URL}/student/notifications/read-all`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    delete: async (notificationId) => {
      const response = await fetch(
        `${BASE_URL}/student/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Teacher Notifications
  teacher: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/teacher/notifications`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getUnreadCount: async () => {
      const response = await fetch(`${BASE_URL}/teacher/notifications/count`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    markAsRead: async (notificationId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    markAllAsRead: async () => {
      const response = await fetch(
        `${BASE_URL}/teacher/notifications/read-all`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    delete: async (notificationId) => {
      const response = await fetch(
        `${BASE_URL}/teacher/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Admin Notifications
  admin: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/admin/notifications`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getUnreadCount: async () => {
      const response = await fetch(`${BASE_URL}/admin/notifications/count`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    markAsRead: async (notificationId) => {
      const response = await fetch(
        `${BASE_URL}/admin/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    markAllAsRead: async () => {
      const response = await fetch(`${BASE_URL}/admin/notifications/read-all`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    delete: async (notificationId) => {
      const response = await fetch(
        `${BASE_URL}/admin/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    create: async (notificationData) => {
      const response = await fetch(`${BASE_URL}/admin/notifications`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(notificationData),
      });
      return handleResponse(response);
    },

    broadcast: async (notificationData) => {
      const response = await fetch(
        `${BASE_URL}/admin/notifications/broadcast`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(notificationData),
        }
      );
      return handleResponse(response);
    },
  },
};

// Search API calls - Role Specific
export const searchAPI = {
  // Student Search Operations
  student: {
    globalSearch: async (query) => {
      const response = await fetch(
        `${BASE_URL}/student/search?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchCourses: async (query) => {
      const response = await fetch(
        `${BASE_URL}/student/search/courses?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchAssignments: async (query) => {
      const response = await fetch(
        `${BASE_URL}/student/search/assignments?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchTeachers: async (query) => {
      const response = await fetch(
        `${BASE_URL}/student/search/teachers?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Teacher Search Operations
  teacher: {
    globalSearch: async (query) => {
      const response = await fetch(
        `${BASE_URL}/teacher/search?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchStudents: async (query) => {
      const response = await fetch(
        `${BASE_URL}/teacher/search/students?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchCourses: async (query) => {
      const response = await fetch(
        `${BASE_URL}/teacher/search/courses?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchAssignments: async (query) => {
      const response = await fetch(
        `${BASE_URL}/teacher/search/assignments?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // Admin Search Operations
  admin: {
    globalSearch: async (query) => {
      const response = await fetch(
        `${BASE_URL}/admin/search?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchStudents: async (query) => {
      const response = await fetch(
        `${BASE_URL}/admin/search/students?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchTeachers: async (query) => {
      const response = await fetch(
        `${BASE_URL}/admin/search/teachers?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchCourses: async (query) => {
      const response = await fetch(
        `${BASE_URL}/admin/search/courses?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchAssignments: async (query) => {
      const response = await fetch(
        `${BASE_URL}/admin/search/assignments?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    searchUsers: async (query) => {
      const response = await fetch(
        `${BASE_URL}/admin/search/users?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },
  },
};

// Settings API calls - Role Specific
export const settingsAPI = {
  // Student Settings
  student: {
    getProfile: async () => {
      const response = await fetch(`${BASE_URL}/student/settings/profile`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updateProfile: async (profileData) => {
      const response = await fetch(`${BASE_URL}/student/settings/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    },

    changePassword: async (passwordData) => {
      const response = await fetch(`${BASE_URL}/student/settings/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });
      return handleResponse(response);
    },

    getPreferences: async () => {
      const response = await fetch(`${BASE_URL}/student/settings/preferences`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updatePreferences: async (preferences) => {
      const response = await fetch(`${BASE_URL}/student/settings/preferences`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      });
      return handleResponse(response);
    },

    uploadAvatar: async (formData) => {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/student/settings/avatar`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      return handleResponse(response);
    },
  },

  // Teacher Settings
  teacher: {
    getProfile: async () => {
      const response = await fetch(`${BASE_URL}/teacher/settings/profile`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updateProfile: async (profileData) => {
      const response = await fetch(`${BASE_URL}/teacher/settings/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    },

    changePassword: async (passwordData) => {
      const response = await fetch(`${BASE_URL}/teacher/settings/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });
      return handleResponse(response);
    },

    getPreferences: async () => {
      const response = await fetch(`${BASE_URL}/teacher/settings/preferences`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updatePreferences: async (preferences) => {
      const response = await fetch(`${BASE_URL}/teacher/settings/preferences`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      });
      return handleResponse(response);
    },

    uploadAvatar: async (formData) => {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/teacher/settings/avatar`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      return handleResponse(response);
    },
  },

  // Admin Settings
  admin: {
    getProfile: async () => {
      const response = await fetch(`${BASE_URL}/admin/settings/profile`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updateProfile: async (profileData) => {
      const response = await fetch(`${BASE_URL}/admin/settings/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    },

    changePassword: async (passwordData) => {
      const response = await fetch(`${BASE_URL}/admin/settings/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });
      return handleResponse(response);
    },

    getPreferences: async () => {
      const response = await fetch(`${BASE_URL}/admin/settings/preferences`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updatePreferences: async (preferences) => {
      const response = await fetch(`${BASE_URL}/admin/settings/preferences`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      });
      return handleResponse(response);
    },

    uploadAvatar: async (formData) => {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/admin/settings/avatar`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      return handleResponse(response);
    },

    getSystemSettings: async () => {
      const response = await fetch(`${BASE_URL}/admin/settings/system`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updateSystemSettings: async (settings) => {
      const response = await fetch(`${BASE_URL}/admin/settings/system`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      return handleResponse(response);
    },
  },
};

// Files API calls - Role Specific
export const filesAPI = {
  // Student File Operations
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

    getInfo: async (fileId) => {
      const response = await fetch(`${BASE_URL}/student/files/${fileId}/info`, {
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
  },

  // Teacher File Operations
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

    getInfo: async (fileId) => {
      const response = await fetch(`${BASE_URL}/teacher/files/${fileId}/info`, {
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
  },

  // Admin File Operations
  admin: {
    upload: async (formData) => {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/admin/files/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      return handleResponse(response);
    },

    download: async (fileId) => {
      const response = await fetch(`${BASE_URL}/admin/files/${fileId}`, {
        headers: getAuthHeaders(),
      });
      return response;
    },

    delete: async (fileId) => {
      const response = await fetch(`${BASE_URL}/admin/files/${fileId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getInfo: async (fileId) => {
      const response = await fetch(`${BASE_URL}/admin/files/${fileId}/info`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getAllFiles: async () => {
      const response = await fetch(`${BASE_URL}/admin/files/all-files`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    getUserFiles: async (userId) => {
      const response = await fetch(`${BASE_URL}/admin/files/user/${userId}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    bulkDelete: async (fileIds) => {
      const response = await fetch(`${BASE_URL}/admin/files/bulk-delete`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ fileIds }),
      });
      return handleResponse(response);
    },
  },
};

// Public API calls (no authentication required)
export const publicAPI = {
  getStatistics: async () => {
    const response = await fetch(`${BASE_URL}/public/statistics`, {
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  },
};

// Authentication utility functions - Updated for Role-Specific APIs
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAuthToken();
    return !!token;
  },

  // Get user role from token (if stored in localStorage)
  getUserRole: () => {
    const user = localStorage.getItem("openacademy_user");
    return user ? JSON.parse(user).role : null;
  },

  // Check if user has specific role
  hasRole: (role) => {
    const userRole = authUtils.getUserRole();
    return userRole === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const userRole = authUtils.getUserRole();
    return roles.includes(userRole);
  },

  // Get appropriate login function based on role
  getLoginFunction: (role) => {
    switch (role) {
      case "student":
        return authAPI.student.login;
      case "teacher":
        return authAPI.teacher.login;
      case "admin":
        return authAPI.admin.login;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  },

  // Get appropriate registration function based on role
  getRegisterFunction: (role) => {
    switch (role) {
      case "student":
        return authAPI.student.register;
      case "teacher":
        return authAPI.teacher.register;
      case "admin":
        return authAPI.admin.register;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  },

  // Get appropriate logout function based on role
  getLogoutFunction: (role) => {
    switch (role) {
      case "student":
        return authAPI.student.logout;
      case "teacher":
        return authAPI.teacher.logout;
      case "admin":
        return authAPI.admin.logout;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  },

  // Get appropriate API object based on role
  getAPIByRole: (apiType, role) => {
    const apis = {
      courses: coursesAPI,
      assignments: assignmentsAPI,
      submissions: submissionsAPI,
      messages: messagesAPI,
      notifications: notificationsAPI,
      search: searchAPI,
      settings: settingsAPI,
      files: filesAPI,
      dashboard: dashboardAPI,
    };

    if (!apis[apiType]) {
      throw new Error(`Invalid API type: ${apiType}`);
    }

    if (!apis[apiType][role]) {
      throw new Error(`Role ${role} not supported for ${apiType} API`);
    }

    return apis[apiType][role];
  },

  // Clear authentication data
  clearAuthData: () => {
    localStorage.removeItem("openacademy_token");
    localStorage.removeItem("openacademy_user");
    localStorage.removeItem("openacademy_refresh_token");
  },

  // Store authentication data
  storeAuthData: (authResponse) => {
    if (authResponse.token) {
      localStorage.setItem("openacademy_token", authResponse.token);
    }
    if (authResponse.refreshToken) {
      localStorage.setItem(
        "openacademy_refresh_token",
        authResponse.refreshToken
      );
    }
    if (authResponse.user) {
      localStorage.setItem(
        "openacademy_user",
        JSON.stringify(authResponse.user)
      );
    }
  },

  // Helper to get role-specific API calls
  getAPI: (role) => {
    return {
      auth: authAPI[role],
      courses: coursesAPI[role],
      assignments: assignmentsAPI[role],
      submissions: submissionsAPI[role],
      messages: messagesAPI[role],
      notifications: notificationsAPI[role],
      search: searchAPI[role],
      settings: settingsAPI[role],
      files: filesAPI[role],
      dashboard: dashboardAPI[role],
    };
  },
};
