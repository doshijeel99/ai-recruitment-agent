import React, { useState } from 'react';
import { useRecruitment } from '../contexts/RecruitmentContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { Check, X, Calendar, User, Search, Filter } from 'lucide-react';

const CandidateMatching: React.FC = () => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduleCandidateId, setScheduleCandidateId] = useState<string | null>(null);
  const { jobs, candidates, updateCandidate } = useRecruitment();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [activeCandidate, setActiveCandidate] = useState<string | null>(null);

  const toggleStatusFilter = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const handleUpdateStatus = async (candidateId: string, newStatus: string) => {
    await updateCandidate(candidateId, newStatus);
    setActiveCandidate(null);
  };

  // Schedule Interview handlers
  const handleOpenScheduleModal = (candidateId: string) => {
    setScheduleCandidateId(candidateId);
    setIsScheduleModalOpen(true);
    setScheduledDate('');
  };

  const handleScheduleInterview = async () => {
    if (!scheduleCandidateId || !scheduledDate) return;
    // TODO: Optionally send to backend here
    setIsScheduleModalOpen(false);
    alert(`Interview scheduled for ${scheduledDate}`);
  };

  // Filter candidates based on selected job, search term, and status filter
  const filteredCandidates = candidates.filter(candidate => {
    const matchesJob = selectedJobId ? candidate.job_id === selectedJobId : true;
    const matchesSearch = searchTerm 
      ? candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus = statusFilter.length > 0 
      ? statusFilter.includes(candidate.status)
      : true;
    
    return matchesJob && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Candidate Matching & Screening</h2>
        <p className="mt-1 text-gray-600">Review and process matched candidates</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label htmlFor="jobFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Job
            </label>
            <select
              id="jobFilter"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Candidates
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Filter size={16} className="mr-1" />
              Status Filter
            </label>
            <div className="flex flex-wrap gap-2">
              {['applied', 'screened', 'interview', 'offer'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatusFilter(status)}
                  className={`
                    px-2 py-1 rounded-md text-xs font-medium 
                    ${statusFilter.includes(status) 
                      ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}
                  `}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate list and details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate list */}
        <div className="lg:col-span-1">
          <Card 
            title="Candidates" 
            subtitle={`${filteredCandidates.length} candidates found`}
            className="h-full"
          >
            <div className="divide-y divide-gray-200 -mt-2 -mx-4">
              {filteredCandidates.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  <p>No candidates match the current filters.</p>
                </div>
              ) : (
                filteredCandidates.map(candidate => (
                  <div 
                    key={candidate.candidate_id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      activeCandidate === candidate.candidate_id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveCandidate(candidate.candidate_id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-xs text-gray-500">
                            {jobs.find(j => j.job_id === candidate.job_id)?.title || 'No job assigned'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={candidate.status} />
                    </div>
                    
                    {candidate.score && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2">Match Score:</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${
                                candidate.score >= 80 ? 'bg-green-500' : 
                                candidate.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${candidate.score}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs font-medium">
                            {candidate.score}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        
        {/* Candidate details */}
        <div className="lg:col-span-2">
          {activeCandidate ? (
            <div className="space-y-4">
              {/* Active candidate data */}
              {(() => {
                const candidate = candidates.find(c => c.candidate_id === activeCandidate);
                if (!candidate) return null;
                
                const job = jobs.find(j => j.job_id === candidate.job_id);
                
                return (
                  <>
                    <Card>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                          <p className="text-sm text-gray-500">{job?.title || 'No job assigned'}</p>
                        </div>
                        
                        <StatusBadge status={candidate.status} />
                      </div>
                      
                      {candidate.persona && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <h4 className="text-sm font-medium text-blue-800 mb-1">AI-Generated Persona</h4>
                          <p className="text-sm text-blue-700">{candidate.persona}</p>
                        </div>
                      )}
                      
                      {candidate.score && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Match Score</h4>
                          <div className="flex items-center">
                            <div className="flex-1 h-4 bg-gray-200 rounded-full">
                              <div 
                                className={`h-4 rounded-full ${
                                  candidate.score >= 80 ? 'bg-green-500' : 
                                  candidate.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${candidate.score}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 font-bold text-lg">
                              {candidate.score}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {candidate.status === 'applied' || candidate.status === 'screened' ? (
                          <>
                            <Button
                              variant="success"
                              icon={<Check size={16} />}
                              onClick={() => handleUpdateStatus(candidate.candidate_id, 'interview')}
                            >
                              Approve for Interview
                            </Button>
                            <Button
                              variant="danger"
                              icon={<X size={16} />}
                              onClick={() => handleUpdateStatus(candidate.candidate_id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        ) : candidate.status === 'interview' ? (
                          <>
                            <Button
                              variant="primary"
                              icon={<Calendar size={16} />}
                              onClick={() => handleOpenScheduleModal(candidate.candidate_id)}
                            >
                              Schedule Interview
                            </Button>
                            <Button
                              variant="success"
                              icon={<Check size={16} />}
                              onClick={() => handleUpdateStatus(candidate.candidate_id, 'offer')}
                            >
                              Extend Offer
                            </Button>
                            <Button
                              variant="danger"
                              icon={<X size={16} />}
                              onClick={() => handleUpdateStatus(candidate.candidate_id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        ) : candidate.status === 'offer' ? (
                          <Button
                            variant="success"
                            icon={<User size={16} />}
                            onClick={() => handleUpdateStatus(candidate.candidate_id, 'onboarded')}
                          >
                            Mark as Onboarded
                          </Button>
                        ) : null}
                      </div>
                    </Card>
                    
                    {/* Interview tasks */}
                    {candidate.interview_tasks && candidate.interview_tasks.length > 0 && (
                      <Card title="Interview Tasks">
                        <ul className="space-y-3">
                          {candidate.interview_tasks.map((task, index) => (
                            <li key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                              <div className="flex">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mr-2">
                                  {index + 1}
                                </span>
                                <p className="text-sm text-gray-800">{task}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                    
                    {/* Resume text */}
                    {candidate.resume_text && (
                      <Card title="Resume Text" contentClassName="max-h-64 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{candidate.resume_text}</p>
                      </Card>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center py-12">
                <User size={48} className="mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No candidate selected</h3>
                <p className="mt-1 text-gray-500">
                  Select a candidate from the list to view details
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Schedule Interview</h3>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleScheduleInterview}
                disabled={!scheduledDate}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateMatching;