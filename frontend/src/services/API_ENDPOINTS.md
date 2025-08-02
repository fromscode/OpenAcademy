## Base Configuration

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
```

## 1. Authentication API (`authAPI`)

### Student Authentication
- `POST /auth/student/login` - Student login
- `POST /auth/student/register` - Student registration
- `POST /auth/student/logout` - Student logout
- `GET /auth/student/me` - Get current student user

### Teacher Authentication
- `POST /auth/teacher/login` - Teacher login
- `POST /auth/teacher/register` - Teacher registration
- `POST /auth/teacher/logout` - Teacher logout
- `GET /auth/teacher/me` - Get current teacher user

### Admin Authentication
- `POST /auth/admin/login` - Admin login
- `POST /auth/admin/register` - Admin registration
- `POST /auth/admin/logout` - Admin logout
- `GET /auth/admin/me` - Get current admin user

## 2. Dashboard API (`dashboardAPI`)

### Student Dashboard
- `GET /dashboard/student` - Get student dashboard data
- `GET /dashboard/student/statistics` - Get student statistics
- `GET /dashboard/student/upcoming-assignments` - Get upcoming assignments
- `GET /dashboard/student/recent-grades` - Get recent grades

### Teacher Dashboard
- `GET /dashboard/teacher` - Get teacher dashboard data
- `GET /dashboard/teacher/statistics` - Get teacher statistics
- `GET /dashboard/teacher/pending-submissions` - Get pending submissions

### Admin Dashboard
- `GET /dashboard/admin` - Get admin dashboard data
- `GET /dashboard/admin/statistics` - Get admin statistics

## 3. Grading & Feedback API (`gradingAPI`)

### Teacher Grading Operations
- `GET /teacher/submissions/pending-grading` - Get pending submissions for grading
- `PUT /teacher/submissions/{submissionId}/grade` - Grade a submission
- `POST /teacher/submissions/{submissionId}/feedback` - Add feedback to submission
- `GET /teacher/submissions/{submissionId}` - Get submission details
- `GET /teacher/submissions/assignment/{assignmentId}` - Get submissions by assignment

### Student Grade Viewing
- `GET /student/grades` - Get student's grades
- `GET /student/submissions/{submissionId}/grade` - Get grade for specific submission

## 4. File Handling API (`filesAPI`)

### Student File Operations
- `POST /student/files/upload` - Upload file (uses FormData)
- `GET /student/files/{fileId}` - Download file
- `DELETE /student/files/{fileId}` - Delete file
- `GET /student/files/my-files` - Get student's files
- `GET /student/files/{fileId}/info` - Get file information

### Teacher File Operations
- `POST /teacher/files/upload` - Upload file (uses FormData)
- `GET /teacher/files/{fileId}` - Download file
- `DELETE /teacher/files/{fileId}` - Delete file
- `GET /teacher/files/my-files` - Get teacher's files
- `GET /teacher/files/student/{studentId}` - Get student's files
- `GET /teacher/files/{fileId}/info` - Get file information

## 5. Basic Operations API (`basicAPI`)

### Student Operations
- `GET /student/profile` - Get student profile
- `PUT /student/profile` - Update student profile
- `GET /student/courses/my-courses` - Get student's courses
- `GET /student/assignments` - Get student's assignments

### Teacher Operations
- `GET /teacher/profile` - Get teacher profile
- `PUT /teacher/profile` - Update teacher profile
- `GET /teacher/courses/my-courses` - Get teacher's courses
- `GET /teacher/assignments` - Get teacher's assignments

### Admin Operations
- `GET /admin/students` - Get all students
- `GET /admin/teachers` - Get all teachers
- `GET /admin/courses` - Get all courses

