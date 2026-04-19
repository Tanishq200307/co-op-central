import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ApplicationsPage from './pages/ApplicationsPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import EmployerDashboard from './pages/EmployerDashboard';
import Home from './pages/Home';
import JobDetailPage from './pages/JobDetailPage';
import JobsPage from './pages/JobsPage';
import Login from './pages/Login';
import PostJobPage from './pages/PostJobPage';
import Probe from './pages/Probe';
import ProfilePage from './pages/ProfilePage';
import Register from './pages/Register';
import SavedJobsPage from './pages/SavedJobsPage';
import StudentDashboard from './pages/StudentDashboard';
import UniversityDashboard from './pages/UniversityDashboard';
import ApplicantDetailPage from './pages/ApplicantDetailPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/_probe" element={<Probe />} />
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:slug" element={<CompanyProfilePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SavedJobsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/new"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <PostJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applicants/:applicationId"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <ApplicantDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/university"
          element={
            <ProtectedRoute allowedRoles={['university']}>
              <UniversityDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
