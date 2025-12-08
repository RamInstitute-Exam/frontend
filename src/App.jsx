import './App.css'
import {Routes,Route} from 'react-router-dom'
import AdminLogin from './Components/AdminLogin'
import StudentLogin from './Components/StudentLogin'
import UnifiedLogin from './Components/UnifiedLogin'
import HomePage from './Components/Home'
import ProtectedRoute from './Components/ProtectedRoute'
import StudentRegister from './Components/StudentRegister'
import AdminRegister from './Components/AdminRegister'
import DashboardLayout from './Components/dashboardLayout/Layout'
import Exams from './Components/dashboardLayout/Exams'
import Reports from './Components/dashboardLayout/Reports'
import ExamDashboard from './Components/dashboardLayout/ExamDashboard'
import Dashboard from './Components/dashboardLayout/Dashboard'
import AdminUpload from './Components/dashboardLayout/Upload'
import StudentExam from './Components/Student/StudentExam'
import StudentDashboard from './Components/Student/StudentDashboard'
import StudentExamList from './Components/Student/StudentExamList'
import AdminExamRequests from './Components/dashboardLayout/Request'
import ExamRequestManagement from './Components/dashboardLayout/ExamRequestManagement'
import StudentListAdmin from './Components/dashboardLayout/Users'
import StudentDetails from './Components/dashboardLayout/StudentDetails'
import TestSeriesManagement from './Components/dashboardLayout/TestSeriesManagement'
import PracticeManagement from './Components/dashboardLayout/PracticeManagement'
import AnalyticsManagement from './Components/dashboardLayout/AnalyticsManagement'
import GamificationManagement from './Components/dashboardLayout/GamificationManagement'
import NotificationsManagement from './Components/dashboardLayout/NotificationsManagement'
import AdminDashboard from './Components/dashboardLayout/AdminDashboard'
import StudentDashboardLayout from './Components/Student/StudentDashboard'
import StudentProfile from './Components/Student/StudentProfile'
import StudentExamListing from './Components/Student/BatchesListing'
import StudentHomeDashboard from './Components/Student/Dashboard'
import StudentBatchAccessUI from './Components/List'
import StudentBatchList from './Components/Student/BatchesListing'

import Examlist from './Components/Student/ExamPage'
import ExamViewer from './Components/Student/ExamView'
import { ExamReview } from './Components/Student/ExamReview'
import CivilUpload from './Components/dashboardLayout/CivilUpload'
import { StudentReports } from './Components/Student/StudentReports'
import EditExam from './Components/dashboardLayout/EditExam'
import EditExamPage from './Components/dashboardLayout/EditExam'
import EditExamGoogleFormUI from './Components/dashboardLayout/EditExam'
import PDFUpload from './Components/dashboardLayout/PDFUpload'
import ExamPreview from './Components/dashboardLayout/ExamPreview'
import TestListingPage from './Components/Student/TestListingPage'
import MockTestInstructions from './Components/Student/MockTestInstructions'
import MockTestInterface from './Components/Student/MockTestInterface'
import MockTestResults from './Components/Student/MockTestResults'
import DailyPractice from './Components/Student/DailyPractice'
import Analytics from './Components/Student/Analytics'
import Gamification from './Components/Student/Gamification'
import EnhancedProfile from './Components/Student/EnhancedProfile'
function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage/>} />
        
        {/* Unified Login Route (Recommended) */}
        <Route path='/login' element={<UnifiedLogin/>} />
        
        {/* Legacy Login Routes (Still supported for backward compatibility) */}
        <Route path='/' element={<AdminLogin/>} />
        <Route path='/' element={<StudentLogin/>} />
        
        {/* Register Routes */}
        <Route path='/institute-exam-admin-Register' element={<AdminRegister/>} />
        <Route path='/list' element={<StudentBatchAccessUI/>} />
        <Route path='/student-Register' element={<StudentRegister/>} />
        <Route path='/student/exam' element={<StudentExamList/>} />
        <Route path='/student' element={<StudentDashboardLayout />}>
        <Route path='batches' element={<StudentBatchList />} />

        <Route index element={<StudentHomeDashboard/>} /> {/* Default dashboard page */}
        <Route path='exams' element={<StudentExamList />} />
        <Route path='profile' element={<EnhancedProfile />} />
        <Route path='exams-list' element={<StudentExamListing />} />
        <Route path='test-series' element={<TestListingPage />} />
        <Route path='test/:examCode/instructions' element={<MockTestInstructions />} />
        <Route path='test/:examCode/start' element={<MockTestInterface />} />
        <Route path='test/:examCode/results' element={<MockTestResults />} />
        <Route path='practice' element={<DailyPractice />} />
        <Route path='analytics' element={<Analytics />} />
        <Route path='gamification' element={<Gamification />} />
        <Route path="batches/:batchName/exams" element={<Examlist />} />
        <Route path="exam/:examCode/:batchName" element={<ExamViewer />} />
        <Route path="exam-review/:examId/:studentId" element={<ExamReview />} />
        <Route path="exam-history" element={<StudentReports />} />
        <Route path="reports/:studentId" element={<StudentReports />} />
    
  </Route>
        


      {/* Admin Routes */}
  <Route path="/admin" element={<DashboardLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<StudentListAdmin />} />
  <Route path="users/:studentId" element={<StudentDetails />} />
  <Route path="test-series" element={<TestSeriesManagement />} />
  <Route path="practice" element={<PracticeManagement />} />
  <Route path="analytics" element={<AnalyticsManagement />} />
  <Route path="gamification" element={<GamificationManagement />} />
  <Route path="notifications" element={<NotificationsManagement />} />
  <Route path="upload" element={<AdminUpload />} />
  <Route path="civil-upload" element={<CivilUpload />} />
  <Route path="pdf-upload" element={<PDFUpload />} />

    
  <Route path="Request" element={<AdminExamRequests />} />
  <Route path="exam-requests" element={<ExamRequestManagement />} />
  <Route path="Reports" element={<Reports />} />
  <Route path="Exams" element={<Exams />} />
  <Route path="exams/preview/:batchName/:examCode" element={<ExamPreview />} />
  <Route path="exams/edit/:batchId/:examCode" element={<EditExamGoogleFormUI />} />

  <Route path="Dashboard" element={<AdminDashboard />} />
  <Route path="Exam-Dashboard" element={<ExamDashboard />} />
</Route>


      </Routes>
    </div>
  )
}

export default App
