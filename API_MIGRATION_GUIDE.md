# API Migration Guide

## ✅ Completed Changes

1. **Updated API Configuration** (`src/config/API.jsx`)
   - Changed base URL from `https://institute-backend-wro4.onrender.com/` to `http://localhost:5000/`
   - Added environment variable support (`VITE_API_URL`)
   - Added request/response interceptors
   - Improved error handling

2. **Created Centralized API Service** (`src/services/apiService.js`)
   - All API endpoints organized by category
   - Consistent error handling
   - Type-safe API calls

3. **Updated Components**
   - ✅ `UnifiedLogin.jsx` - Uses `authAPI.login()`
   - ✅ `StudentLogin.jsx` - Uses `authAPI.login()`
   - ✅ `AdminLogin.jsx` - Uses `authAPI.login()`
   - ✅ `Request.jsx` - Uses `batchAccessAPI`
   - ✅ `List.jsx` - Uses `batchAPI` and `batchAccessAPI`

4. **Backend Port Updated**
   - Changed default port from 6000 to 5000

## 📋 How to Use the New API Service

### Import the API service:
```javascript
import { authAPI, studentAPI, batchAPI, examAPI } from '../services/apiService';
```

### Example Usage:

#### Authentication
```javascript
// Login
const response = await authAPI.login(email, password, userType);
if (response.success) {
  // Handle success
}

// Get current user
const user = await authAPI.getCurrentUser();

// Logout
await authAPI.logout(userType);
```

#### Student Operations
```javascript
// Get student list
const students = await studentAPI.getList();

// Get student profile
const profile = await studentAPI.getProfile(userId);

// Update student
await studentAPI.update(id, studentData);
```

#### Batch Operations
```javascript
// Get all batches
const batches = await batchAPI.getBatches();

// Get batch exams
const exams = await batchAPI.getBatchByName(batchName);
```

#### Exam Operations
```javascript
// Get exam questions
const questions = await examAPI.getQuestions(examCode);

// Submit exam
await examAPI.submitExam(examData);
```

## 🔄 Remaining Files to Update

The following files still have hardcoded URLs and should be updated:

### High Priority:
1. `Components/dashboardLayout/Users.jsx`
2. `Components/dashboardLayout/Upload.jsx`
3. `Components/dashboardLayout/Sidebar.jsx`
4. `Components/dashboardLayout/Reports.jsx`
5. `Components/dashboardLayout/PDFUpload.jsx`
6. `Components/dashboardLayout/Exams.jsx`
7. `Components/dashboardLayout/EditExam.tsx`
8. `Components/dashboardLayout/Dashboard.jsx`
9. `Components/dashboardLayout/CivilUpload.jsx`
10. `Components/dashboardLayout/AdminDashboard.jsx`

### Student Components:
11. `Components/Student/StudentReports.jsx`
12. `Components/Student/StudentProfile.jsx`
13. `Components/Student/StudentExamlisting.jsx`
14. `Components/Student/StudentExam.jsx`
15. `Components/Student/StudentDashboard.jsx`
16. `Components/Student/Exams.jsx`
17. `Components/Student/ExamView.jsx`
18. `Components/Student/ExamReview.jsx`
19. `Components/Student/ExamPage.jsx`
20. `Components/Student/BatchesListing.jsx`

### Other Components:
21. `Components/UploadBatch.jsx`
22. `Components/StudentRegister.jsx`
23. `Components/AdminRegister.jsx`

### Utils:
24. `utils/auth.js`

## 🔧 Quick Update Pattern

### Before:
```javascript
import axios from 'axios';

const response = await axios.get('https://institute-backend-wro4.onrender.com/Student/list', {
  withCredentials: true
});
```

### After:
```javascript
import { studentAPI } from '../services/apiService';

const response = await studentAPI.getList();
```

## 🌍 Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:5000/
```

For production, update this to your production URL.

## 📝 Notes

- All API calls now automatically include credentials
- Error handling is centralized in the API service
- The API service uses the base URL from `API.jsx` configuration
- Request/response interceptors handle authentication tokens automatically

