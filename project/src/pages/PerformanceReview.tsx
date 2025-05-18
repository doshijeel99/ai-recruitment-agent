import React, { useState } from 'react';
import { useRecruitment } from '../contexts/RecruitmentContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { Download, FileText, Star, Edit, Check } from 'lucide-react';

const PerformanceReview: React.FC = () => {
  const { candidates, jobs } = useRecruitment();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [managerFeedback, setManagerFeedback] = useState('');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter only onboarded candidates
  const onboardedCandidates = candidates.filter(c => c.status === 'onboarded');

  const candidate = candidates.find(c => c.candidate_id === selectedCandidate);
  console.log(candidate);

  const handleSaveFeedback = () => {
    setIsEditingFeedback(false);
    setSuccessMessage('Manager feedback saved successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Export selected candidate to CSV
  const exportCandidateToCSV = (candidate: any) => {
    if (!candidate) return;
    const metrics = candidate.performance_metrics || {};
    const csvRows = [
      ["Field", "Value"],
      ["Name", candidate.name],
      ["Job ID", candidate.job_id],
      ["Persona", candidate.persona || ""],
      ["Score", candidate.score ?? ""],
      ["Performance Review", candidate.performance_review || ""],
      ["Technical Skills", metrics.technical_skills ?? "N/A"],
      ["Communication", metrics.communication ?? "N/A"],
      ["Problem Solving", metrics.problem_solving ?? "N/A"],
      ["Team Collaboration", metrics.team_collaboration ?? "N/A"],
      ["Manager Feedback", managerFeedback || ""],
    ];
    const csvContent = csvRows.map(row => row.map(String).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${candidate.name.replace(/\s+/g, "_")}_performance_review.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMessage('Performance report downloaded!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Performance Review</h2>
        <p className="mt-1 text-gray-600">Review AI-generated performance insights and add manager feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate list */}
        <div className="lg:col-span-1">
          <Card 
            title="Onboarded Candidates" 
            subtitle="Select a candidate to view performance data"
          >
            <div className="divide-y divide-gray-200 -mt-2 -mx-4">
              {onboardedCandidates.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  <p>No onboarded candidates found.</p>
                </div>
              ) : (
                onboardedCandidates.map(candidate => (
                  <div 
                    key={candidate.candidate_id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      selectedCandidate === candidate.candidate_id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedCandidate(candidate.candidate_id);
                      setManagerFeedback('');
                      setIsEditingFeedback(false);
                    }}
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
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        
        {/* Performance data */}
        <div className="lg:col-span-2">
          {selectedCandidate ? (
            <div className="space-y-4">
              {/* Success message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
                  <Check size={18} className="text-green-500 mr-2" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}
            
              {/* Candidate info */}
              {(() => {
                const candidate = candidates.find(c => c.candidate_id === selectedCandidate);
                if (!candidate) return null;
                
                const job = jobs.find(j => j.job_id === candidate.job_id);
                
                return (
                  <Card>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-500">{job?.title || 'No job assigned'}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download size={16} />}
                        onClick={() => exportCandidateToCSV(candidate)}
                      >
                        Export to CSV
                      </Button>
                    </div>
                    {/* Rating (optional, static or from metrics) */}
                    <div className="mt-4 flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <Star 
                            key={rating}
                            size={20}
                            className={`${rating <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">4.0/5.0</span>
                    </div>
                  </Card>
                );
              })()}
              
              {/* AI-generated review */}
              <Card title="AI-Generated Performance Insights">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-800">
                    {
                      (() => {
                        const candidate = candidates.find(c => c.candidate_id === selectedCandidate);
                        return candidate?.performance_review 
                          ? candidate.performance_review 
                          : "No performance review available.";
                      })()
                    }
                  </p>
                </div>
              </Card>
              
              {/* Performance metrics from backend */}
              <Card title="Performance Metrics">
                <div className="space-y-4">
                  {(() => {
                    const candidate = candidates.find(c => c.candidate_id === selectedCandidate);
                    const metrics = candidate?.performance_metrics || {};
                    const metricList = [
                      { label: "Technical Skills", key: "technical_skills", color: "bg-blue-600" },
                      { label: "Communication", key: "communication", color: "bg-green-600" },
                      { label: "Problem Solving", key: "problem_solving", color: "bg-amber-500" },
                      { label: "Team Collaboration", key: "team_collaboration", color: "bg-purple-500" }
                    ];
                    return metricList.map(metric => (
                      <div key={metric.key}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">{metric.label}</label>
                          <span className="text-sm font-medium text-gray-900">
                            {metrics[metric.key] !== undefined ? `${metrics[metric.key]}%` : "N/A"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${metric.color} h-2 rounded-full`}
                            style={{ width: metrics[metric.key] ? `${metrics[metric.key]}%` : "0%" }}
                          ></div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </Card>
              
              {/* Manager feedback */}
              <Card 
                title="Manager Feedback"
                footer={
                  <div className="flex justify-end">
                    {isEditingFeedback ? (
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingFeedback(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSaveFeedback}
                        >
                          Save Feedback
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => setIsEditingFeedback(true)}
                      >
                        Add Feedback
                      </Button>
                    )}
                  </div>
                }
              >
                {isEditingFeedback ? (
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-sm"
                    rows={5}
                    value={managerFeedback}
                    onChange={(e) => setManagerFeedback(e.target.value)}
                    placeholder="Enter your feedback about this candidate's performance..."
                  />
                ) : managerFeedback ? (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-800">{managerFeedback}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText size={36} className="mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No manager feedback yet</p>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No candidate selected</h3>
                <p className="mt-1 text-gray-500">
                  Select an onboarded candidate to view performance data
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceReview;