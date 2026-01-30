# JWT Authentication - Quick Start Guide

## 🚀 For Developers

### Backend Setup

#### 1. Ensure JWT Secret Key is Configured
File: `backend/src/main/resources/application.yml`

```yaml
security:
  jwt:
    secret-key: your-secret-key-here-must-be-at-least-256-bits
```

**Generate a secure key**:
```bash
# In terminal/PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 2. Start Backend Server
```bash
cd backend
./mvnw spring-boot:run
```

---

### Frontend Setup

#### 1. Configure API URL
File: `frontend/.env`

```env
VITE_API_URL=http://localhost:8080/api
```

#### 2. Install Dependencies (if not done)
```bash
cd frontend
npm install
```

#### 3. Start Frontend Server
```bash
npm run dev
```

---

## 🔐 How to Use JWT in Your Code

### Making API Calls (Frontend)

**✅ CORRECT** - Use the centralized API service:
```javascript
import { courseAPI, adminAPI, assignmentAPI } from "../../services/api";

// JWT token automatically included
const courses = await courseAPI.getAllCourses();
const students = await adminAPI.getAllStudents();
```

**❌ WRONG** - Don't use raw fetch without token:
```javascript
// This will fail with 401 Unauthorized
const response = await fetch('http://localhost:8080/api/courses');
```

---

### Protecting Backend Endpoints

#### Example 1: Allow specific roles only
```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")  // Only ADMINs can access
public class AdminController {
    
    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        // Implementation
    }
}
```

#### Example 2: Multiple roles allowed
```java
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@PostMapping("/courses")
public ResponseEntity<Course> createCourse(@RequestBody CourseDTO dto) {
    // Implementation
}
```

#### Example 3: Dynamic permission check
```java
@PreAuthorize("hasRole('STUDENT') and #studentId == authentication.principal.id")
@GetMapping("/courses/student/{studentId}")
public ResponseEntity<List<Course>> getStudentCourses(@PathVariable Long studentId) {
    // Students can only access their own courses
}
```

---

## 🧪 Testing JWT Implementation

### Test 1: Login and Get Token
```bash
# Login request
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@test.com\",\"password\":\"password123\"}"
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@test.com",
    "role": "STUDENT",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Test 2: Access Protected Endpoint (Without Token)
```bash
curl -X GET http://localhost:8080/api/courses
```

**Expected Response**: `401 Unauthorized`

### Test 3: Access Protected Endpoint (With Token)
```bash
curl -X GET http://localhost:8080/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response**: List of courses (200 OK)

---

## 🐛 Common Issues & Solutions

### Issue 1: "401 Unauthorized" on all requests

**Causes**:
- Token not stored in sessionStorage
- Token expired (24 hours)
- Wrong token format

**Solutions**:
```javascript
// Check if token exists
console.log(sessionStorage.getItem("openacademy_token"));

// Check token format (should be: Bearer <token>)
// Verify in Network tab → Request Headers → Authorization
```

---

### Issue 2: CORS errors

**Solution**: Update backend CORS configuration
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.addExposedHeader("Authorization");  // Important!
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

---

### Issue 3: User not redirected on token expiry

**Check**:
1. Event listener is registered in `AuthContext.jsx`
2. API service dispatches `auth:unauthorized` event
3. Browser console shows no errors

**Debug**:
```javascript
// In browser console
window.addEventListener("auth:unauthorized", () => {
  console.log("Auth event triggered!");
});

// Manually trigger event
window.dispatchEvent(new CustomEvent("auth:unauthorized"));
```

---

### Issue 4: WebSocket connection fails

**Solutions**:
1. Verify `/ws/**` is permitted in SecurityConfig
2. Check token is passed in connection headers
3. Ensure SockJS fallback is enabled

```javascript
// Debug WebSocket connection
const token = sessionStorage.getItem("openacademy_token");
console.log("WebSocket token:", token);

// Check WebSocket connection
const ws = new SockJS("http://localhost:8080/ws");
ws.onopen = () => console.log("Connected!");
ws.onerror = (err) => console.error("Error:", err);
```

---

## 📋 Pre-Launch Checklist

### Backend
- [ ] JWT secret key configured in `application.yml`
- [ ] Backend running on http://localhost:8080
- [ ] SecurityConfig allows `/api/auth/**` and `/ws/**`
- [ ] All controllers have appropriate `@PreAuthorize` annotations

### Frontend
- [ ] API URL configured in `.env`
- [ ] Frontend running on http://localhost:5173
- [ ] All API calls use centralized service (no raw fetch)
- [ ] Token stored in sessionStorage (not localStorage)

### Testing
- [ ] Login works and stores token
- [ ] Token included in API requests (check Network tab)
- [ ] Protected endpoints return data with valid token
- [ ] 401 response clears token and redirects to login
- [ ] All dashboards (Student/Teacher/Admin) work correctly

---

## 🔑 Key Points to Remember

1. **Always use the API service** - Don't create raw fetch calls
2. **sessionStorage is used** - Token cleared when browser closes
3. **Token expires in 24 hours** - User must re-login
4. **401/403 triggers auto-logout** - User redirected to login
5. **Backend validates every request** - Except `/api/auth/**` and `/ws/**`

---

## 📚 Quick Links

- **Full Documentation**: `JWT_IMPLEMENTATION.md`
- **Changes Summary**: `CHANGES_SUMMARY.md`
- **API Service**: `frontend/src/services/api.js`
- **Auth Context**: `frontend/src/context/AuthContext.jsx`
- **Security Config**: `backend/src/main/java/com/openacademy/backend/config/SecurityConfig.java`

---

## 💡 Tips for Adding New Features

### Adding a new protected endpoint:

**Backend**:
```java
@RestController
@RequestMapping("/api/newfeature")
public class NewFeatureController {
    
    @PreAuthorize("hasRole('USER')")  // Add role requirement
    @GetMapping("/data")
    public ResponseEntity<?> getData() {
        // Implementation
    }
}
```

**Frontend**:
```javascript
// In api.js
export const newFeatureAPI = {
  getData: async () => {
    const response = await fetch(`${BASE_URL}/newfeature/data`, {
      headers: getAuthHeaders(),  // JWT automatically included
    });
    return handleResponse(response);
  }
};
```

**Component**:
```javascript
import { newFeatureAPI } from "../../services/api";

function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await newFeatureAPI.getData();
        setData(result);
      } catch (error) {
        console.error("Error:", error);
        // Error handling (401/403 auto-redirects to login)
      }
    };
    loadData();
  }, []);
  
  return <div>{/* Render data */}</div>;
}
```

---

## 🎉 You're All Set!

JWT authentication is now fully integrated. All API calls from all dashboards automatically include the JWT token, and users are automatically logged out when tokens expire or become invalid.

Happy coding! 🚀
