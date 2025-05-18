import React, { useState } from 'react';
import { useRecruitment } from '../contexts/RecruitmentContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { ChevronLeft, ChevronRight, Users, Search, Calendar } from 'lucide-react';

type CandidateStatus = 'applied' | 'screened' | 'interview' | 'offer' | 'onboarded' | 'rejected';

const CandidateLifecycle: React.FC = () => {
  const { candidates, jobs, updateCandidate } = useRecruitment();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(false);

  // Group candidates by status
  const candidatesByStatus = candidates.reduce((acc, candidate) => {
    if (!showRejected && candidate.status === 'rejected') return acc;
    
    if (!acc[candidate.status]) {
      acc[candidate.status] = [];
    }
    acc[candidate.status].push(candidate);
    return acc;
  }, {} as Record<CandidateStatus, typeof candidates>);

  // Filter candidates based on search term
  const filteredCandidatesByStatus = Object.fromEntries(
    Object.entries(candidatesByStatus).map(([status, statusCandidates]) => [
      status,
      statusCandidates.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ])
  ) as Record<CandidateStatus, typeof candidates>;

  // Get all statuses in the desired display order
  const statusOrder: CandidateStatus[] = ['applied', 'screened', 'interview', 'offer', 'onboarded'];
  if (showRejected) statusOrder.push('rejected');

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
    await updateCandidate(candidateId, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Candidate Lifecycle</h2>
          <p className="mt-1 text-gray-600">Track candidate progress through the hiring pipeline</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search candidates..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowRejected(!showRejected)}
          >
            {showRejected ? "Hide Rejected" : "Show Rejected"}
          </Button>
        </div>
      </div>

      {/* Status board */}
      <div className="flex overflow-x-auto pb-6 mt-4 -mx-4 px-4 sm:px-0">
        <div className="flex space-x-4 min-w-max">
          {statusOrder.map(status => {
            const statusCandidates = filteredCandidatesByStatus[status] || [];
            return (
              <div 
                key={status} 
                className="w-72 flex-shrink-0 flex flex-col"
              >
                <div className="bg-white rounded-t-lg border border-b-0 border-gray-200 p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <StatusBadge status={status} className="mr-2" />
                    <h3 className="font-medium text-gray-800">{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                  </div>
                  <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                    {statusCandidates.length}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-b-lg border border-gray-200 p-3 flex-1 min-h-[70vh] flex flex-col gap-3">
                  {statusCandidates.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-gray-500">No candidates</p>
                    </div>
                  ) : (
                    statusCandidates.map(candidate => (
                      <div 
                        key={candidate.candidate_id}
                        className={`bg-white rounded-md border shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer ${
                          selectedCandidate === candidate.candidate_id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedCandidate(
                          selectedCandidate === candidate.candidate_id ? null : candidate.candidate_id
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-sm">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h4 className="ml-2 font-medium text-sm text-gray-800">{candidate.name}</h4>
                          </div>
                          {candidate.score && (
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                              candidate.score >= 80 ? 'bg-green-100 text-green-800' :
                              candidate.score >= 60 ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {candidate.score}%
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                          {jobs.find(j => j.job_id === candidate.job_id)?.title || 'No job assigned'}
                        </p>
                        
                        {/* Expanded view when selected */}
                        {selectedCandidate === candidate.candidate_id && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {candidate.persona && (
                              <p className="text-xs text-gray-600 mb-3">{candidate.persona}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {statusOrder
                                .filter(s => s !== status)
                                .map(newStatus => (
                                  <Button
                                    key={newStatus}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs px-2 py-1 h-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(candidate.candidate_id, newStatus);
                                    }}
                                  >
                                    Move to {newStatus}
                                  </Button>
                                ))
                              }
                            </div>
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex justify-between mt-2">
                          {status !== 'applied' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-auto"
                              icon={<ChevronLeft size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = statusOrder.indexOf(status);
                                if (currentIndex > 0) {
                                  handleStatusChange(candidate.candidate_id, statusOrder[currentIndex - 1]);
                                }
                              }}
                            >
                              Back
                            </Button>
                          )}
                          
                          <div className="flex-1"></div>
                          
                          {status !== 'onboarded' && status !== 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-auto"
                              icon={<ChevronRight size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = statusOrder.indexOf(status);
                                if (currentIndex < statusOrder.length - 1) {
                                  handleStatusChange(candidate.candidate_id, statusOrder[currentIndex + 1]);
                                }
                              }}
                            >
                              Next
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Timeline view */}
      <Card title="Candidate Timeline">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
          
          <div className="space-y-6 relative z-10">
            {candidates.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Users size={48} className="mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">No candidate activity to display</p>
                </div>
              </div>
            ) : (
              candidates
                .filter(candidate => 
                  (showRejected || candidate.status !== 'rejected') &&
                  (searchTerm === '' || candidate.name.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
                .slice(0, 5)
                .map((candidate, index) => (
                  <div key={`${candidate.candidate_id}-${index}`} className="flex items-start ml-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 border-2 border-white text-blue-600 -ml-4 mr-2">
                      {getTimelineIcon(candidate.status)}
                    </div>
                    
                    <div className="flex-1 bg-white rounded-md shadow-sm border border-gray-200 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{candidate.name}</h4>
                          <p className="text-sm text-gray-500">
                            {jobs.find(j => j.job_id === candidate.job_id)?.title || 'No job assigned'}
                          </p>
                        </div>
                        <StatusBadge status={candidate.status} />
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2">
                        {getTimelineMessage(candidate)}
                      </p>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {formatDate(candidate.updatedAt || candidate.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Helper functions
const getTimelineIcon = (status: string) => {
  switch (status) {
    case 'applied':
      return <Users size={16} />;
    case 'screened':
      return <Search size={16} />;
    case 'interview':
      return <Calendar size={16} />;
    default:
      return <Users size={16} />;
  }
};

const getTimelineMessage = (candidate: any) => {
  switch (candidate.status) {
    case 'applied':
      return 'Applied for a position';
    case 'screened':
      return `Candidate screened by AI with ${candidate.score}% match score`;
    case 'interview':
      return 'Advanced to interview stage';
    case 'offer':
      return 'Received a job offer';
    case 'onboarded':
      return 'Successfully onboarded';
    case 'rejected':
      return 'Application not moved forward';
    default:
      return 'Status updated';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

export default CandidateLifecycle;