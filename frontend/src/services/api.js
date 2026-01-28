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

// Helper function to handle API responses (robust to non-JSON/empty bodies)
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  // Helper to parse body safely once
  const parseBody = async () => {
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(text);
      } catch (e) {
        // Fall back to raw text wrapped in message
        return { message: text };
      }
    }
    // Non-JSON responses
    return text;
  };

  if (!response.ok) {
    const body = await parseBody();
    const message =
      (body && (body.message || body.error)) ||
      response.statusText ||
      "API request failed";
    throw new Error(message);
  }

  return parseBody();
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
  },
};

// ===================================================================
// DASHBOARD API - Essential for dashboard data
// ===================================================================
export const dashboardAPI = {
  // Student Dashboard
  getStudentDashboard: async (studentId) => {
    const user = JSON.parse(sessionStorage.getItem("openacademy_user") || "{}");
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

  // Get courses by instructor (teacher)
  getInstructorCourses: async (instructorId) => {
    const response = await fetch(
      `${BASE_URL}/courses/instructor/${instructorId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Get courses a specific student is enrolled in
  getStudentCourses: async (studentId) => {
    const response = await fetch(`${BASE_URL}/courses/student/${studentId}`, {
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
};

// ===================================================================
// SUBMISSION API - Submission management functionality
// ===================================================================
export const submissionAPI = {
  // Get the current student's submission for an assignment (if any)
  getStudentSubmissionForAssignment: async (assignmentId, studentId) => {
    const response = await fetch(
      `${BASE_URL}/assignments/${assignmentId}/submission-of/${studentId}`,
      { headers: getAuthHeaders() }
    );
    if (response.status === 204) return null;
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
};

// ===================================================================
// ADMIN API - Admin management functionality
// ===================================================================
export const adminAPI = {
  // Get all admins
  getAllAdmins: async () => {
    const response = await fetch(`${BASE_URL}/admin/admins`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  // Get all students
  getAllStudents: async () => {
    const response = await fetch(`${BASE_URL}/admin/students`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get all teachers
  getAllTeachers: async () => {
    const response = await fetch(`${BASE_URL}/admin/teachers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create a new student
  createStudent: async (studentData) => {
    const response = await fetch(`${BASE_URL}/admin/students`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  // Create a new teacher
  createTeacher: async (teacherData) => {
    const response = await fetch(`${BASE_URL}/admin/teachers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(teacherData),
    });
    return handleResponse(response);
  },

  // Update student
  updateStudent: async (studentId, studentData) => {
    const response = await fetch(`${BASE_URL}/admin/students/${studentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  // Update teacher
  updateTeacher: async (teacherId, teacherData) => {
    const response = await fetch(`${BASE_URL}/admin/teachers/${teacherId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(teacherData),
    });
    return handleResponse(response);
  },

  // Delete student
  deleteStudent: async (studentId) => {
    const response = await fetch(`${BASE_URL}/admin/students/${studentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete teacher
  deleteTeacher: async (teacherId) => {
    const response = await fetch(`${BASE_URL}/admin/teachers/${teacherId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create a new admin
  createAdmin: async (adminData) => {
    const response = await fetch(`${BASE_URL}/admin/admins`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData),
    });
    return handleResponse(response);
  },

  // Update admin by current email (uses query param for robustness)
  updateAdmin: async (adminEmail, adminData) => {
    const response = await fetch(
      `${BASE_URL}/admin/admins/by-email?email=${encodeURIComponent(
        adminEmail
      )}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
      }
    );
    return handleResponse(response);
  },
  // Delete admin by id
  deleteAdmin: async (adminId) => {
    const response = await fetch(`${BASE_URL}/admin/admins/${adminId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// ===================================================================
// CHAT API - Real-time messaging functionality
// ===================================================================
export { default as chatAPI } from "./chatAPI";

// Export for backward compatibility
export default {
  authAPI,
  dashboardAPI,
  courseAPI,
  assignmentAPI,
  submissionAPI,
  adminAPI,
};
