# Backend Integration Guide - Complete API Specification

## Overview
This document provides a comprehensive analysis of all API endpoints required to support the OpenAcademy frontend application. The analysis is based on examining all components, pages, and features across all user roles.

## Changes Made

### 1. Removed Demo Credentials
- Removed demo credentials section from the login page
- Cleared mock user data from `mockData.js`

### 2. Updated Authentication
- Modified `AuthContext.jsx` to use real API calls
- Created API service functions in `src/services/api.js`
- Added proper token management and error handling

### 3. API Service Structure
The `src/services/api.js` file contains organized API functions for:
- Authentication (login, register, logout)
- Students management
- Teachers management
- Courses management
- Assignments management
- Submissions management
- Messages system
- Notifications
- Reports and Analytics
- File uploads
- Settings

### 4. Components Ready for Backend
The following components have been analyzed for API requirements:
- `StudentDashboard.jsx` - Dashboard statistics, courses, assignments, grades
- `TeacherDashboard.jsx` - Teaching statistics, course management, grading
- `AdminDashboard.jsx` - System overview, user management, reports
- `Students.jsx` - Student CRUD operations
- `Messages.jsx` - Real-time messaging system
- `Settings.jsx` - User profile and preferences
- `Navbar.jsx` - Search, notifications
- `LandingPage.jsx` - Public statistics

## Complete API Endpoints Required

### 1. Environment Configuration
Create a `.env` file in the root directory and add:
```
VITE_API_URL=http://your-backend-url.com/api
```

### 2. Authentication Endpoints - Role Specific Only

#### Student Authentication
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/student/logout` - Student logout
- `POST /api/auth/student/refresh` - Student token refresh
- `GET /api/auth/student/me` - Get current student profile
- `POST /api/auth/student/forgot-password` - Student password reset request
- `POST /api/auth/student/reset-password` - Student password reset

#### Teacher Authentication
- `POST /api/auth/teacher/login` - Teacher login
- `POST /api/auth/teacher/register` - Teacher registration (admin-only)
- `POST /api/auth/teacher/logout` - Teacher logout
- `POST /api/auth/teacher/refresh` - Teacher token refresh
- `GET /api/auth/teacher/me` - Get current teacher profile
- `POST /api/auth/teacher/forgot-password` - Teacher password reset request
- `POST /api/auth/teacher/reset-password` - Teacher password reset

#### Admin Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/register` - Admin registration (super-admin only)
- `POST /api/auth/admin/logout` - Admin logout
- `POST /api/auth/admin/refresh` - Admin token refresh
- `GET /api/auth/admin/me` - Get current admin profile
- `POST /api/auth/admin/forgot-password` - Admin password reset request
- `POST /api/auth/admin/reset-password` - Admin password reset

### 3. User Management Endpoints

#### Students
- `GET /api/students` - Get all students (admin/teacher access)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student (admin only)
- `PUT /api/students/:id` - Update student information
- `DELETE /api/students/:id` - Delete student (admin only)
- `GET /api/students/:id/courses` - Get student's enrolled courses
- `GET /api/students/:id/assignments` - Get student's assignments
- `GET /api/students/:id/submissions` - Get student's submissions
- `GET /api/students/:id/grades` - Get student's grades
- `GET /api/students/:id/schedule` - Get student's class schedule
- `POST /api/students/:id/enroll` - Enroll student in course
- `DELETE /api/students/:id/courses/:courseId` - Unenroll from course

#### Teachers
- `GET /api/teachers` - Get all teachers (admin access)
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create new teacher (admin only)
- `PUT /api/teachers/:id` - Update teacher information
- `DELETE /api/teachers/:id` - Delete teacher (admin only)
- `GET /api/teachers/:id/courses` - Get teacher's courses
- `GET /api/teachers/:id/students` - Get all students under teacher
- `GET /api/teachers/:id/assignments` - Get teacher's assignments
- `GET /api/teachers/:id/statistics` - Get teaching statistics

#### Admins
- `GET /api/admins` - Get all admins
- `GET /api/admins/:id` - Get admin by ID
- `POST /api/admins` - Create new admin
- `PUT /api/admins/:id` - Update admin information

### 4. Course Management Endpoints - Role Specific

#### Student Course Operations
- `GET /api/student/courses` - Get available courses for enrollment
- `GET /api/student/courses/:id` - Get course details
- `GET /api/student/courses/my-courses` - Get enrolled courses
- `POST /api/student/courses/:id/enroll` - Enroll in course
- `DELETE /api/student/courses/:id/unenroll` - Unenroll from course

#### Teacher Course Operations
- `GET /api/teacher/courses` - Get all courses (teacher view)
- `GET /api/teacher/courses/:id` - Get course details
- `GET /api/teacher/courses/my-courses` - Get assigned courses
- `POST /api/teacher/courses` - Create new course
- `PUT /api/teacher/courses/:id` - Update course
- `DELETE /api/teacher/courses/:id` - Delete course
- `GET /api/teacher/courses/:id/students` - Get enrolled students

#### Admin Course Operations
- `GET /api/admin/courses` - Get all courses (admin view)
- `GET /api/admin/courses/:id` - Get course details
- `POST /api/admin/courses` - Create new course
- `PUT /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course
- `POST /api/admin/courses/:id/assign-teacher` - Assign teacher to course

### 5. Assignment Management Endpoints

#### Core Assignment Operations
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `POST /api/assignments` - Create new assignment (teacher)
- `PUT /api/assignments/:id` - Update assignment (teacher)
- `DELETE /api/assignments/:id` - Delete assignment (teacher)
- `GET /api/assignments/course/:courseId` - Get assignments by course
- `GET /api/assignments/teacher/:teacherId` - Get assignments by teacher
- `GET /api/assignments/student/:studentId` - Get assignments for student

#### Assignment Content
- `GET /api/assignments/:id/instructions` - Get detailed instructions
- `PUT /api/assignments/:id/instructions` - Update instructions
- `GET /api/assignments/:id/attachments` - Get assignment attachments
- `POST /api/assignments/:id/attachments` - Add attachment
- `DELETE /api/assignments/:id/attachments/:attachmentId` - Remove attachment

### 6. Submission Management Endpoints

#### Core Submission Operations
- `GET /api/submissions` - Get all submissions (teacher/admin)
- `GET /api/submissions/:id` - Get submission by ID
- `POST /api/submissions` - Create new submission (student)
- `PUT /api/submissions/:id` - Update submission (student, before deadline)
- `DELETE /api/submissions/:id` - Delete submission (student, before deadline)
- `GET /api/submissions/assignment/:assignmentId` - Get submissions by assignment
- `GET /api/submissions/student/:studentId` - Get submissions by student

#### Grading & Feedback
- `PUT /api/submissions/:id/grade` - Grade submission (teacher)
- `POST /api/submissions/:id/feedback` - Add feedback (teacher)
- `GET /api/submissions/:id/feedback` - Get feedback
- `PUT /api/submissions/:id/return` - Return graded submission

#### File Handling
- `POST /api/submissions/:id/files` - Upload submission files
- `GET /api/submissions/:id/files` - Get submission files
- `DELETE /api/submissions/:id/files/:fileId` - Delete submission file

### 7. Messaging System Endpoints

#### Core Messaging
- `GET /api/messages` - Get user's messages with pagination
- `GET /api/messages/:id` - Get specific message details
- `POST /api/messages` - Send new message
- `DELETE /api/messages/:id` - Delete message
- `PUT /api/messages/:id/read` - Mark message as read

#### Conversations & Chat
- `GET /api/messages/conversations` - Get user's conversations with last message and unread count
- `GET /api/messages/conversation/:userId` - Get conversation with specific user
- `POST /api/messages/conversations` - Start new conversation
- `GET /api/messages/unread-count` - Get total unread message count
- `GET /api/users/available` - Get available users to start conversations with

#### Real-time Messaging
- WebSocket events for real-time message delivery
- `GET /api/messages/online-users` - Get currently online users

### 8. Dashboard & Analytics Endpoints

#### Student Dashboard
- `GET /api/dashboard/student` - Get comprehensive student dashboard data
- `GET /api/dashboard/student/statistics` - Get student statistics (enrolled courses, pending assignments, completed assignments, average grade)
- `GET /api/dashboard/student/upcoming-assignments` - Get upcoming assignments with urgency indicators
- `GET /api/dashboard/student/recent-grades` - Get recent grades and submissions
- `GET /api/dashboard/student/course-progress` - Get detailed course progress
- `GET /api/students/:id/courses` - Get student's enrolled courses with progress
- `GET /api/students/:id/assignments/upcoming` - Get upcoming assignments with due dates
- `GET /api/students/:id/grades/recent` - Get recent grades with course information

#### Teacher Dashboard
- `GET /api/dashboard/teacher` - Get comprehensive teacher dashboard data
- `GET /api/dashboard/teacher/statistics` - Get teaching statistics (courses, students, assignments, pending grading)
- `GET /api/dashboard/teacher/pending-submissions` - Get submissions requiring grading
- `GET /api/dashboard/teacher/upcoming-deadlines` - Get upcoming assignment deadlines
- `GET /api/dashboard/teacher/recent-activities` - Get recent teaching activities
- `GET /api/teachers/:id/courses/statistics` - Get course-specific statistics
- `GET /api/teachers/:id/students/total` - Get total students across all courses
- `GET /api/submissions/pending/teacher/:teacherId` - Get pending submissions for grading

#### Admin Dashboard
- `GET /api/dashboard/admin` - Get comprehensive admin dashboard data
- `GET /api/dashboard/admin/statistics` - Get system-wide statistics (students, teachers, courses, assignments)
- `GET /api/dashboard/admin/recent-activities` - Get recent system activities with user details
- `GET /api/dashboard/admin/system-health` - Get system health and performance metrics
- `GET /api/admin/statistics/overview` - Get overview statistics with growth percentages
- `GET /api/admin/activities/recent` - Get recent activities across the platform
- `GET /api/admin/events/upcoming` - Get upcoming events and important dates

#### Public Landing Page Statistics
- `GET /api/public/statistics` - Get public statistics for landing page (total courses, students, teachers)

### 9. Search & Discovery Endpoints

#### Global Search
- `GET /api/search` - Global search across all entities with query parameter
- `GET /api/search/students` - Search students by name, email, or ID
- `GET /api/search/teachers` - Search teachers by name, department, or specialization
- `GET /api/search/courses` - Search courses by name, description, or tags
- `GET /api/search/assignments` - Search assignments by title, course, or deadline
- `GET /api/search/users` - Search all users (for messaging/communication)

#### Advanced Search & Filtering
- `GET /api/search/advanced` - Advanced search with multiple filters
- `GET /api/search/autocomplete` - Autocomplete suggestions for search
- `GET /api/search/recent` - Get user's recent search history

### 10. File & Media Management Endpoints

#### File Operations
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Download file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/:id/info` - Get file information

#### Avatar & Profile Images
- `POST /api/users/:id/avatar` - Upload user avatar
- `DELETE /api/users/:id/avatar` - Remove user avatar

### 11. Notification Endpoints

#### Core Notifications
- `GET /api/notifications` - Get user notifications with pagination
- `GET /api/notifications/count` - Get unread notification count
- `POST /api/notifications` - Create notification (system/admin only)
- `PUT /api/notifications/:id/read` - Mark specific notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete specific notification
- `DELETE /api/notifications/clear-all` - Clear all notifications

#### Real-time Notifications
- `GET /api/notifications/realtime` - Server-sent events for real-time notifications
- `GET /api/notifications/bell` - Get notifications for navbar bell icon

#### Notification Preferences
- `GET /api/notifications/preferences` - Get user notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences
- `POST /api/notifications/test` - Send test notification

### 12. Settings & Preferences Endpoints

#### User Profile Management
- `GET /api/settings/profile` - Get user profile settings
- `PUT /api/settings/profile` - Update user profile (name, email, phone, bio)
- `POST /api/users/:id/avatar` - Upload user avatar
- `DELETE /api/users/:id/avatar` - Remove user avatar
- `PUT /api/settings/password` - Change password with current password verification

#### User Preferences
- `GET /api/settings/preferences` - Get user preferences (theme, language, etc.)
- `PUT /api/settings/preferences` - Update user preferences

#### Account Security
- `GET /api/settings/security` - Get security settings and activity log
- `PUT /api/settings/security/2fa` - Enable/disable two-factor authentication
- `GET /api/settings/sessions` - Get active sessions
- `DELETE /api/settings/sessions/:id` - Revoke specific session

#### System Settings (Admin Only)
- `GET /api/settings/system` - Get system-wide settings
- `PUT /api/settings/system` - Update system settings
- `GET /api/settings/maintenance` - Get maintenance mode settings
- `PUT /api/settings/maintenance` - Toggle maintenance mode

### 13. Grading & Assessment Endpoints

#### Gradebook
- `GET /api/gradebook/course/:courseId` - Get course gradebook
- `GET /api/gradebook/student/:studentId` - Get student's grades
- `PUT /api/gradebook/assignment/:assignmentId/grades` - Bulk update grades
- `GET /api/gradebook/statistics/:courseId` - Get grading statistics

#### Grade Calculations
- `GET /api/grades/calculate/:studentId/:courseId` - Calculate final grade
- `GET /api/grades/export/:courseId` - Export grades to CSV/Excel

### 14. Schedule & Calendar Endpoints

#### Class Schedules
- `GET /api/schedule/student/:studentId` - Get student schedule
- `GET /api/schedule/teacher/:teacherId` - Get teacher schedule
- `GET /api/schedule/course/:courseId` - Get course schedule
- `POST /api/schedule/events` - Create calendar event
- `PUT /api/schedule/events/:id` - Update calendar event
- `DELETE /api/schedule/events/:id` - Delete calendar event

### 15. Reports & Analytics Endpoints

#### Academic Reports
- `GET /api/reports/student-performance` - Student performance reports
- `GET /api/reports/course-analytics` - Course analytics
- `GET /api/reports/teacher-performance` - Teacher performance reports
- `GET /api/reports/assignment-statistics` - Assignment statistics

#### System Reports (Admin)
- `GET /api/reports/enrollment-trends` - Enrollment trends
- `GET /api/reports/usage-statistics` - System usage statistics
- `GET /api/reports/system-logs` - System activity logs

### 16. Real-time Features Endpoints

#### WebSocket Events
- WebSocket connection: `/ws` or `/socket.io`
- Events: `message_received`, `assignment_graded`, `enrollment_approved`

#### Real-time Notifications
- `GET /api/realtime/notifications` - Server-sent events for notifications
- Live updates for dashboard statistics

### 17. Role-Based Route Protection Endpoints

#### Authentication Validation
- `GET /api/auth/verify-token` - Verify JWT token validity
- `GET /api/auth/permissions` - Get user permissions and role-based access
- `POST /api/auth/refresh-token` - Refresh expired JWT tokens

### 18. Content Management Endpoints

#### Course Materials
- `GET /api/courses/:id/materials` - Get course materials and resources
- `POST /api/courses/:id/materials` - Upload course material (teacher/admin)
- `PUT /api/courses/:id/materials/:materialId` - Update material
- `DELETE /api/courses/:id/materials/:materialId` - Delete material

#### Assignment Resources
- `GET /api/assignments/:id/resources` - Get assignment resources and attachments
- `POST /api/assignments/:id/resources` - Add assignment resource
- `DELETE /api/assignments/:id/resources/:resourceId` - Remove assignment resource

### 19. Analytics & Reporting Endpoints

#### Performance Analytics
- `GET /api/analytics/student/:id/performance` - Get detailed student performance analytics
- `GET /api/analytics/course/:id/engagement` - Get course engagement metrics
- `GET /api/analytics/teacher/:id/effectiveness` - Get teacher effectiveness metrics

#### Progress Tracking
- `GET /api/progress/student/:id/courses` - Get student progress across all courses
- `PUT /api/progress/student/:id/course/:courseId` - Update course progress
- `GET /api/progress/course/:id/students` - Get all students' progress in a course

### 20. Bulk Operations Endpoints

#### Bulk Student Management
- `POST /api/students/bulk-create` - Bulk create students from CSV
- `PUT /api/students/bulk-update` - Bulk update student information
- `DELETE /api/students/bulk-delete` - Bulk delete students

#### Bulk Assignment Operations
- `POST /api/assignments/bulk-grade` - Bulk grade submissions
- `POST /api/assignments/bulk-feedback` - Bulk add feedback to submissions

### 21. Integration & Export Endpoints

#### Data Export
- `GET /api/export/students` - Export student data to CSV/Excel
- `GET /api/export/grades/:courseId` - Export course grades
- `GET /api/export/attendance/:courseId` - Export attendance records

#### External Integrations
- `POST /api/integrations/lms-sync` - Sync with external LMS
- `GET /api/integrations/calendar` - Export calendar events

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field1": ["Validation error message"],
    "field2": ["Another validation error"]
  },
  "code": "ERROR_CODE",
  "details": {
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/endpoint",
    "method": "POST"
  }
}
```

### Authentication Request/Response Examples

#### Unified Login Request
```json
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "password123",
  "role": "student"
}
```

#### Role-Specific Login Requests
```json
POST /api/auth/student/login
{
  "email": "student@example.com",
  "password": "password123"
}

POST /api/auth/teacher/login
{
  "email": "teacher@example.com",
  "password": "password123"
}

POST /api/auth/admin/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Registration Request Examples
```json
POST /api/auth/student/register
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "studentId": "STU001",
  "department": "Computer Science",
  "phone": "+1234567890"
}

POST /api/auth/teacher/register (Admin Only)
{
  "name": "Dr. Jane Smith",
  "email": "jane.smith@example.com",
  "password": "password123",
  "employeeId": "EMP001",
  "department": "Mathematics",
  "specialization": "Calculus",
  "phone": "+1234567890"
}
```

#### Authentication Response
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "avatar": "https://example.com/avatar.jpg",
    "permissions": ["read_courses", "submit_assignments"],
    "lastLogin": "2024-01-15T10:30:00Z",
    "profile": {
      "studentId": "STU001",
      "department": "Computer Science",
      "enrollmentDate": "2023-09-01",
      "isActive": true
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

#### Error Response Examples
```json
// Invalid credentials
{
  "success": false,
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}

// Account not activated
{
  "success": false,
  "message": "Account not activated. Please check your email.",
  "code": "ACCOUNT_NOT_ACTIVATED"
}

// Role mismatch (for unified login)
{
  "success": false,
  "message": "User role does not match the selected role",
  "code": "ROLE_MISMATCH"
}
```

### Dashboard Response Examples

#### Student Dashboard Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "avatar": "avatar_url"
    },
    "statistics": {
      "enrolledCourses": 4,
      "pendingAssignments": 3,
      "completedAssignments": 12,
      "averageGrade": 85.6
    },
    "upcomingAssignments": [
      {
        "id": 1,
        "title": "Math Assignment",
        "courseName": "Advanced Mathematics",
        "dueDate": "2024-02-15T23:59:59Z",
        "daysUntilDue": 3,
        "isUrgent": true
      }
    ],
    "recentGrades": [
      {
        "assignmentTitle": "Physics Lab Report",
        "grade": 92,
        "submissionDate": "2024-01-10T15:30:00Z"
      }
    ],
    "courseProgress": [
      {
        "courseId": 1,
        "courseName": "Web Development",
        "progress": 75,
        "completedModules": 6,
        "totalModules": 8
      }
    ]
  }
}
```

#### Teacher Dashboard Response
```json
{
  "success": true,
  "data": {
    "statistics": {
      "myCourses": 3,
      "totalStudents": 45,
      "activeAssignments": 8,
      "pendingGrading": 12
    },
    "pendingSubmissions": [
      {
        "id": 1,
        "studentName": "Jane Smith",
        "assignmentTitle": "Final Project",
        "submissionDate": "2024-01-12T14:20:00Z",
        "courseName": "Web Development"
      }
    ],
    "upcomingDeadlines": [
      {
        "assignmentTitle": "Mid-term Exam",
        "dueDate": "2024-02-20T23:59:59Z",
        "courseName": "Advanced JavaScript"
      }
    ],
    "recentActivities": [
      {
        "type": "submission_received",
        "message": "New submission from John Doe",
        "timestamp": "2024-01-15T09:15:00Z"
      }
    ]
  }
}
```

## Database Schema Considerations

### Core Entities
1. **Users** - Base user information (students, teachers, admins)
2. **Courses** - Course details, schedules, descriptions
3. **Enrollments** - Student-course relationships
4. **Assignments** - Assignment details, due dates, instructions
5. **Submissions** - Student submissions with files and metadata
6. **Grades** - Grading information and feedback
7. **Messages** - Messaging system data
8. **Notifications** - System notifications
9. **Files** - File storage metadata
10. **Settings** - User and system preferences

### Key Relationships
- Users (1:N) Enrollments (N:1) Courses
- Courses (1:N) Assignments
- Assignments (1:N) Submissions (N:1) Users
- Users (1:N) Messages (N:1) Users
- Submissions (1:N) Files

## Security Requirements

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Token refresh mechanism
- Password hashing (bcrypt)

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- File upload security
- Rate limiting

### API Security
- CORS configuration
- Request size limits
- API key authentication for external services
- Audit logging for sensitive operations

## Performance Considerations

### Caching Strategy
- Redis cache for frequently accessed data
- User session caching
- Dashboard statistics caching

### Database Optimization
- Proper indexing on frequently queried fields
- Query optimization
- Database connection pooling

### File Handling
- Cloud storage integration (AWS S3, Google Cloud)
- File size limits
- Image resizing and optimization

## Real-time Features

### WebSocket Implementation
- Real-time messaging
- Live notifications
- Dashboard updates
- Assignment submission notifications

### Server-Sent Events
- Grade updates
- Assignment deadlines
- System announcements

## Testing Requirements

### API Testing
- Unit tests for all endpoints
- Integration tests for workflows
- Authentication and authorization tests
- Performance testing

### Data Validation
- Input validation tests
- Boundary condition tests
- Error handling tests

## Deployment Considerations

### Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=OpenAcademy

# File Upload Configuration
VITE_FILE_UPLOAD_MAX_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,png,gif

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_NOTIFICATIONS=true

# External Services
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Production Environment Variables
```env
# Production API
VITE_API_URL=https://api.openacademy.com/api
VITE_WS_URL=wss://api.openacademy.com

# CDN for file uploads
VITE_CDN_URL=https://cdn.openacademy.com

# Production features
VITE_ENVIRONMENT=production
VITE_DEBUG_MODE=false
```

### API Documentation
- **OpenAPI/Swagger Documentation**: Available at `/api/docs`
- **Postman Collection**: Complete collection for all endpoints
- **Authentication Examples**: Sample requests with JWT tokens
- **Error Code Reference**: Complete list of error codes and meanings

### Backend Technology Recommendations
- **Framework**: Node.js with Express.js or Python with FastAPI
- **Database**: PostgreSQL or MongoDB
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or Google Cloud Storage
- **Real-time**: Socket.io or WebSockets
- **Caching**: Redis for session management and caching

This comprehensive API specification covers all features identified in the OpenAcademy frontend application and provides the foundation for a complete backend implementation.

### 4. Update Components
After backend is ready, update the following components to use API calls instead of mock data:

1. Replace mock data imports with API service calls
2. Add loading states and error handling
3. Update useEffect hooks to fetch data from backend
4. Handle empty states appropriately

### 5. Error Handling
The API service includes basic error handling. Consider adding:
- Global error handling
- Toast notifications for user feedback
- Retry mechanisms for failed requests
- Loading indicators

### 6. Security Considerations
- Implement proper JWT token refresh
- Add request/response interceptors for token management
- Validate user permissions on frontend
- Sanitize user inputs

## Mock Data Cleanup
The `src/data/mockData.js` file has been marked for removal. Once backend integration is complete, this file can be deleted entirely.

## Testing
After backend integration:
1. Test all authentication flows
2. Test CRUD operations for all entities
3. Test error scenarios (network issues, invalid data, etc.)
4. Test authorization for different user roles
5. Test data persistence and real-time updates

## File Structure
```
src/
├── services/
│   └── api.js          # All API service functions
├── context/
│   └── AuthContext.jsx # Updated for real authentication
├── data/
│   └── mockData.js     # Marked for deletion
└── pages/
    ├── Auth/
    │   └── Login.jsx   # Demo credentials removed
    ├── Student/
    │   └── StudentDashboard.jsx # Ready for API integration
    ├── Teacher/
    │   └── TeacherDashboard.jsx # Needs updating
    ├── Admin/
    │   ├── AdminDashboard.jsx   # Needs updating
    │   └── Students.jsx         # Needs updating
    └── Messages/
        └── Messages.jsx         # Needs updating
```

## Component Integration Checklist

### Components Ready for Backend Integration

#### ✅ Completed Preparations
- **Login.jsx** - Demo credentials removed, ready for real authentication
- **AuthContext.jsx** - Updated to use API calls instead of mock data
- **API Service Layer** - Complete API service functions created
- **Environment Configuration** - Vite environment variables configured

#### 🔄 Components Requiring API Integration

##### Student Dashboard (`src/pages/Student/StudentDashboard.jsx`)
- [ ] Replace `mockCourses` with `coursesAPI.getByStudent()`
- [ ] Replace `mockAssignments` with `assignmentsAPI.getByStudent()`
- [ ] Replace `mockSubmissions` with `submissionsAPI.getByStudent()`
- [ ] Implement `dashboardAPI.getStudentDashboard()` for comprehensive data
- [ ] Add loading states and error handling

##### Teacher Dashboard (`src/pages/Teacher/TeacherDashboard.jsx`)
- [ ] Replace mock data with `dashboardAPI.getTeacherDashboard()`
- [ ] Implement `coursesAPI.getByTeacher()` for teacher's courses
- [ ] Use `submissionsAPI.getByTeacher()` for pending grading
- [ ] Add real-time updates for new submissions

##### Admin Dashboard (`src/pages/Admin/AdminDashboard.jsx`)
- [ ] Replace mock statistics with `dashboardAPI.getAdminStatistics()`
- [ ] Implement real system health monitoring
- [ ] Connect to real activity logs
- [ ] Add real-time system updates

##### Students Management (`src/pages/Admin/Students.jsx`)
- [ ] Replace mock student list with `studentsAPI.getAll()`
- [ ] Implement CRUD operations using `studentsAPI`
- [ ] Add bulk operations support
- [ ] Implement search and filtering

##### Messages (`src/pages/Messages/Messages.jsx`)
- [ ] Replace mock users with `searchAPI.getAvailableUsers()`
- [ ] Implement real messaging with `messagesAPI`
- [ ] Add real-time message delivery via WebSocket
- [ ] Implement message threading and conversation management

##### Settings (`src/pages/Settings/Settings.jsx`)
- [ ] Connect profile management to `settingsAPI.updateProfile()`
- [ ] Implement password change with `settingsAPI.changePassword()`
- [ ] Connect notification preferences to backend
- [ ] Add avatar upload functionality

##### Navbar (`src/components/Layout/Navbar.jsx`)
- [ ] Implement search functionality with `searchAPI.globalSearch()`
- [ ] Connect notifications bell to `notificationsAPI.getUnreadCount()`
- [ ] Add real-time notification updates
- [ ] Implement user menu with real logout

#### 🔄 Additional Components to Create

##### Course Management Pages
- [ ] Course listing page with enrollment functionality
- [ ] Course detail page with materials and assignments
- [ ] Assignment submission page for students
- [ ] Grading interface for teachers

##### Grade Management
- [ ] Gradebook component for teachers
- [ ] Grade history for students
- [ ] Grade analytics and reporting

##### Calendar/Schedule
- [ ] Class schedule viewer
- [ ] Assignment deadline calendar
- [ ] Event management for admins

## Next Steps for Backend Implementation

### Phase 1: Core Authentication & User Management
1. Implement authentication endpoints (`/api/auth/*`)
2. Set up user management (`/api/users/*`, `/api/students/*`, `/api/teachers/*`)
3. Create role-based access control middleware

### Phase 2: Course & Assignment Management
1. Implement course management endpoints (`/api/courses/*`)
2. Create assignment management (`/api/assignments/*`)
3. Set up submission system (`/api/submissions/*`)

### Phase 3: Dashboard & Analytics
1. Build dashboard endpoints (`/api/dashboard/*`)
2. Implement statistics and analytics
3. Create reporting system

### Phase 4: Communication & Real-time Features
1. Implement messaging system (`/api/messages/*`)
2. Set up notifications (`/api/notifications/*`)
3. Add WebSocket support for real-time features

### Phase 5: Advanced Features
1. File upload and management
2. Search and filtering
3. Settings and preferences
4. Export and reporting features

## Testing Strategy

### Frontend Testing
- [ ] Update components to handle loading states
- [ ] Test error scenarios and network failures
- [ ] Validate role-based access in components
- [ ] Test real-time features

### API Testing
- [ ] Unit tests for all endpoints
- [ ] Integration tests for complete workflows
- [ ] Authentication and authorization tests
- [ ] Performance and load testing

### End-to-End Testing
- [ ] Complete user workflows (login, course enrollment, assignment submission)
- [ ] Cross-role interactions (teacher grading, admin management)
- [ ] Real-time feature testing

This comprehensive guide provides all the API endpoints and integration steps needed to transform your OpenAcademy frontend from a mock-data prototype into a fully functional, backend-integrated educational platform.
