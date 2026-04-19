import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const CompanyProfilePage = lazy(() => import('./pages/CompanyProfilePage'));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
const Home = lazy(() => import('./pages/Home'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const Login = lazy(() => import('./pages/Login'));
const PostJobPage = lazy(() => import('./pages/PostJobPage'));
const Probe = lazy(() => import('./pages/Probe'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Register = lazy(() => import('./pages/Register'));
const SavedJobsPage = lazy(() => import('./pages/SavedJobsPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const UniversityDashboard = lazy(() => import('./pages/UniversityDashboard'));
const ApplicantDetailPage = lazy(() => import('./pages/ApplicantDetailPage'));

function RouteFallback() {
  return (
    <div className="grid gap-4">
      <div className="h-12 w-48 rounded-md bg-bg-surface" />
      <div className="h-64 rounded-xl bg-bg-surface" />
      <div className="h-48 rounded-xl bg-bg-surface" />
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </Layout>
  );
}
