# JWT Authentication Implementation - OpenAcademy

## Overview
This document describes the JWT (JSON Web Token) authentication implementation for OpenAcademy, covering both backend and frontend integration.

## Backend Implementation

### 1. Security Configuration (`SecurityConfig.java`)

The security configuration uses Spring Security with JWT authentication:

- **Public Endpoints**: `/api/auth/**` and `/ws/**` (no authentication required)
- **Protected Endpoints**: All other `/api/**` endpoints require valid JWT token
- **Session Management**: Stateless (no server-side session storage)
- **Authentication Filter**: `JwtAuthenticationFilter` runs before standard authentication

### 2. JWT Service (`JwtService.java`)

Handles JWT token operations:

```java
// Token generation (24-hour expiration)
String generateToken(UserDetails userDetails)

// Token validation
boolean isTokenValid(String token, UserDetails userDetails)

// Extract username/email from token
String extractUsername(String token)
```

**Configuration**:
- Secret key stored in `application.yml` under `security.jwt.secret-key`
- Token expiration: 24 hours
- Algorithm: HS256

### 3. JWT Authentication Filter (`JwtAuthenticationFilter.java`)

Intercepts all requests and validates JWT tokens:

1. Extracts token from `Authorization: Bearer <token>` header
2. Validates token and loads user details
3. Sets authentication in SecurityContext
4. Allows request to proceed

### 4. Protected Endpoints

All controllers except authentication endpoints require valid JWT token:

- **Admin Controller** (`/api/admin/**`): Requires `ROLE_ADMIN`
- **Course Controller** (`/api/courses/**`): Various role requirements
- **Assignment Controller** (`/api/courses/{id}/assignments`): Teacher/Student access
- **Dashboard Controller** (`/api/dashboard/**`): Role-based access
- **Submission Controller** (`/api/assignments/**`): Role-based access
- **Chat Controllers** (`/api/chat/**`): Authenticated users

## Frontend Implementation

### 1. Token Storage

JWT tokens are stored in `sessionStorage`:

```javascript
sessionStorage.setItem("openacademy_token", token);
sessionStorage.setItem("openacademy_user", JSON.stringify(user));
```

**Why sessionStorage?**
- Clears on browser tab/window close
- More secure than localStorage
- Consistent across all services

### 2. API Service (`api.js`)

Centralized API service with JWT token handling:

```javascript
// Helper to get auth token
const getAuthToken = () => {
  return sessionStorage.getItem("openacademy_token");
};

// Helper to create headers with JWT token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
```

**All API calls include JWT token**:
```javascript
const response = await fetch(`${BASE_URL}/endpoint`, {
  method: "POST",
  headers: getAuthHeaders(), // Includes JWT token
  body: JSON.stringify(data),
});
```

### 3. Error Handling

Automatic handling of authentication errors:

```javascript
// In handleResponse function
if (response.status === 401 || response.status === 403) {
  // Clear invalid token
  sessionStorage.removeItem("openacademy_token");
  sessionStorage.removeItem("openacademy_user");
  
  // Dispatch event to trigger logout
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  
  throw new Error("Session expired. Please login again.");
}
```

### 4. Auth Context (`AuthContext.jsx`)

Manages authentication state and automatic logout:

```javascript
// Listen for unauthorized events
useEffect(() => {
  const handleUnauthorized = () => {
    setUser(null);
    window.location.href = "/login";
  };

  window.addEventListener("auth:unauthorized", handleUnauthorized);
  
  return () => {
    window.removeEventListener("auth:unauthorized", handleUnauthorized);
  };
}, []);
```

### 5. Chat & WebSocket Services

Both `chatAPI.js` and `websocketService.js` use the same JWT token mechanism:

```javascript
// chatAPI.js - Uses sessionStorage
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("openacademy_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// websocketService.js - Includes token in WebSocket connection
this.client = new Client({
  connectHeaders: {
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  // ...
});
```

## Authentication Flow

### Login Flow

1. **User submits credentials** → `/api/auth/login`
2. **Backend validates** → Generates JWT token
3. **Frontend receives** → Stores token in sessionStorage
4. **Frontend updates** → AuthContext sets user state
5. **User redirected** → To appropriate dashboard

### Protected API Call Flow

1. **User action triggers API call**
2. **Frontend includes JWT** → `Authorization: Bearer <token>`
3. **Backend validates token** → JwtAuthenticationFilter
4. **Backend processes request** → Returns response
5. **Frontend handles response** → Updates UI

### Token Expiry Flow

1. **API returns 401/403** → Token expired or invalid
2. **Frontend clears storage** → Removes token and user data
3. **Frontend dispatches event** → `auth:unauthorized`
4. **AuthContext handles event** → Redirects to login
5. **User sees login page** → Must re-authenticate

## Dashboard Integration

All dashboards use the centralized API service:

### Student Dashboard
```javascript
import { dashboardAPI, courseAPI, assignmentAPI } from "../../services/api";

// All API calls automatically include JWT token
const data = await dashboardAPI.getStudentDashboard(studentId);
const courses = await courseAPI.getStudentCourses(studentId);
```

### Teacher Dashboard
```javascript
import { courseAPI, assignmentAPI, submissionAPI } from "../../services/api";

// All API calls automatically include JWT token
const courses = await courseAPI.getInstructorCourses(teacherId);
const submissions = await assignmentAPI.getAssignmentSubmissions(assignmentId);
```

### Admin Dashboard
```javascript
import { adminAPI } from "../../services/api";

// All API calls automatically include JWT token
const students = await adminAPI.getAllStudents();
const teachers = await adminAPI.getAllTeachers();
```

## Security Best Practices

### ✅ Implemented
- JWT tokens in Authorization header
- Stateless authentication
- Token expiration (24 hours)
- Automatic logout on token expiry
- CSRF protection disabled (stateless API)
- Role-based access control with `@PreAuthorize`
- sessionStorage for token storage
- Consistent error handling across all services

### 🔒 Recommendations
- Consider implementing refresh tokens for longer sessions
- Add token rotation on sensitive operations
- Implement rate limiting on authentication endpoints
- Add audit logging for authentication events
- Consider HTTPS in production
- Implement token blacklist for logout

## Testing JWT Implementation

### 1. Test Login
```bash
# Login request
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Response includes token
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Test Protected Endpoint
```bash
# Without token - Should return 401
curl -X GET http://localhost:8080/api/courses

# With token - Should return data
curl -X GET http://localhost:8080/api/courses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Test Token Expiry
1. Login and save token
2. Wait 24 hours or manually expire token
3. Try to access protected endpoint
4. Should receive 401 and be redirected to login

## Troubleshooting

### Issue: "401 Unauthorized" on all requests
**Solution**: 
- Verify token is stored in sessionStorage
- Check Authorization header format: `Bearer <token>`
- Verify backend JWT secret key is configured

### Issue: Token not being sent with requests
**Solution**:
- Ensure all API calls use `getAuthHeaders()`
- Check sessionStorage has `openacademy_token` key
- Verify CORS allows Authorization header

### Issue: WebSocket connection fails
**Solution**:
- Verify `/ws/**` is allowed in SecurityConfig
- Check WebSocket connection includes Authorization header
- Ensure token is valid before connecting

### Issue: User not redirected on token expiry
**Solution**:
- Check event listener in AuthContext
- Verify `auth:unauthorized` event is dispatched
- Check browser console for errors

## Configuration Files

### Backend - `application.yml`
```yaml
security:
  jwt:
    secret-key: your-secret-key-here-minimum-256-bits
```

### Frontend - `.env`
```env
VITE_API_URL=http://localhost:8080/api
```

## Summary

The JWT implementation provides:
- ✅ Secure stateless authentication
- ✅ Automatic token validation
- ✅ Seamless error handling
- ✅ Consistent API integration
- ✅ Role-based access control
- ✅ Automatic logout on token expiry
- ✅ WebSocket authentication

All dashboards (Student, Teacher, Admin) now properly authenticate using JWT tokens for all API calls.
