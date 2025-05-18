import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecruitment } from '../contexts/RecruitmentContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { Briefcase, Users, CheckCircle, Clock, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { jobs, candidates } = useRecruitment();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    activeJobs: 0,
    statusCounts: {} as Record<string, number>,
  });

  useEffect(() => {
    // Calculate dashboard stats
    const statusCounts = candidates.reduce((acc, candidate) => {
      const status = candidate.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      totalJobs: jobs.length,
      totalCandidates: candidates.length,
      activeJobs: jobs.length, // For demo, all jobs are active
      statusCounts,
    });
  }, [jobs, candidates]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Welcome to RecruitAI</h2>
        <p className="mt-1 text-gray-600">Your AI-powered recruitment assistant</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Briefcase size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-700">Active Jobs</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-teal-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-700">Total Candidates</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Clock size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-700">In Interview</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.statusCounts.interview || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-700">Offers Extended</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.statusCounts.offer || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent jobs */}
        <Card 
          title="Recent Jobs" 
          subtitle="Your active job postings"
          footer={
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/jobs')}
              >
                View All Jobs
              </Button>
            </div>
          }
        >
          <div className="divide-y divide-gray-200">
            {jobs.slice(0, 3).map((job) => (
              <div key={job.job_id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-800">{job.title}</h4>
                  <p className="text-xs text-gray-500">
                    {job.requirements.slice(0, 3).join(' • ')}
                    {job.requirements.length > 3 && ' • ...'}
                  </p>
                </div>
                <StatusBadge status="active" />
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="py-4 text-center text-gray-500">
                <p>No jobs found. Create a new job to get started.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Candidate distribution */}
        <Card 
          title="Candidate Distribution"
          subtitle="Status breakdown of all candidates"
        >
          <div className="space-y-4">
            {['applied', 'screened', 'interview', 'offer', 'onboarded', 'rejected'].map(status => (
              <div key={status} className="flex items-center">
                <StatusBadge status={status} className="mr-2 w-24 justify-center" />
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStatusBarColor(status)}`}
                    style={{ 
                      width: `${getPercentage(stats.statusCounts[status] || 0, stats.totalCandidates)}%`,
                      transition: 'width 1s ease-in-out'
                    }}
                  ></div>
                </div>
                <span className="ml-2 text-xs font-medium text-gray-600 w-8 text-right">
                  {stats.statusCounts[status] || 0}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="primary" 
            className="h-20"
            onClick={() => navigate('/jobs')}
          >
            <Briefcase className="mr-2" size={20} />
            Create New Job
          </Button>
          <Button 
            variant="secondary" 
            className="h-20"
            onClick={() => navigate('/candidates/intake')}
          >
            <Users className="mr-2" size={20} />
            Add Candidate
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => navigate('/candidate-lifecycle')}
          >
            <BarChart3 className="mr-2" size={20} />
            View Pipeline
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => navigate('/reports')}
          >
            <BarChart3 className="mr-2" size={20} />
            Generate Reports
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Helper functions
const getStatusBarColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    applied: 'bg-gray-500',
    screened: 'bg-blue-500',
    interview: 'bg-amber-500',
    offer: 'bg-purple-500',
    onboarded: 'bg-green-500',
    rejected: 'bg-red-500',
  };
  return colorMap[status] || 'bg-gray-500';
};

const getPercentage = (count: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
};

export default Dashboard;