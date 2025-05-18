import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RecruitmentProvider } from './contexts/RecruitmentContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import JobManagement from './pages/JobManagement';
import CandidateIntake from './pages/CandidateIntake';
import CandidateMatching from './pages/CandidateMatching';
import InterviewTasks from './pages/InterviewTasks';
import CandidateLifecycle from './pages/CandidateLifecycle';
import PerformanceReview from './pages/PerformanceReview';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function App() {
  return (
    <RecruitmentProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<JobManagement />} />
            <Route path="candidates/intake" element={<CandidateIntake />} />
            <Route path="candidates/matching" element={<CandidateMatching />} />
            <Route path="interview-tasks" element={<InterviewTasks />} />
            <Route path="candidate-lifecycle" element={<CandidateLifecycle />} />
            <Route path="performance-review" element={<PerformanceReview />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </RecruitmentProvider>
  );
}

export default App;