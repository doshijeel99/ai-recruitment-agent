import React, { useState, useEffect } from 'react';
import { useRecruitment } from '../contexts/RecruitmentContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { BarChart3, FileText, DownloadCloud, PieChart, Users } from 'lucide-react';
import { API_URL } from '../utils/api';



const Reports: React.FC = () => {
  const { jobs } = useRecruitment();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
  if (!reportData) return;
  fetch(`${API_URL}/ai_insights?job_id=${reportData.job.job_id}`)
    .then(res => res.json())
    .then(data => setAiInsight(data.insight))
    .catch(() => setAiInsight("Failed to generate AI insight."));
}, [reportData]);

  const handleGenerateReport = async () => {
    if (!selectedJobId) return;
    try {
      setIsLoading(true);
      setSuccessMessage(null);
      // Replace with your actual API call to get report data
      const response = await fetch(`${API_URL}/reports?job_id=${selectedJobId}`);
      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      setSuccessMessage('Failed to generate report.');
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (format: string) => {
    if (!selectedJobId) return;
    setSuccessMessage(null);
    try {
      const response = await fetch(
        `${API_URL}/export?job_id=${selectedJobId}&format=${format}`
      );
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMessage('Report exported!');
    } catch (error) {
      setSuccessMessage('Failed to export report.');
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
        <p className="mt-1 text-gray-600">Generate detailed reports on your recruitment process</p>
      </div>

      {/* Report generator */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label htmlFor="jobReport" className="block text-sm font-medium text-gray-700 mb-1">
              Select Job for Report
            </label>
            <select
              id="jobReport"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">-- Select a job --</option>
              {jobs.map(job => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            variant="primary"
            icon={<BarChart3 size={16} />}
            onClick={handleGenerateReport}
            isLoading={isLoading}
            disabled={!selectedJobId}
          >
            Generate Report
          </Button>
        </div>
        
        {/* Success message */}
        {successMessage && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
            <div className="flex-shrink-0 text-green-500">
              <DownloadCloud size={18} />
            </div>
            <p className="ml-3 text-sm text-green-800">{successMessage}</p>
          </div>
        )}
      </Card>

      {/* Report data */}
      {reportData && (
        <div className="space-y-6">
          {/* Report header */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{reportData.job.title}</h3>
                <p className="text-sm text-gray-500">Job ID: {reportData.job.job_id}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                
                <Button
                  variant="outline"
                  size="sm"
                  icon={<DownloadCloud size={16} />}
                  onClick={() => handleExportReport('csv')}
                  disabled={!selectedJobId}
                >
                  Export as CSV
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Users size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-700">Total Candidates</h3>
                  <p className="text-2xl font-bold text-gray-900">{reportData.stats.totalCandidates}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <BarChart3 size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-700">Average Score</h3>
                  <p className="text-2xl font-bold text-gray-900">{reportData.stats.averageScore}%</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-purple-50 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <PieChart size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-700">Offer Rate</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((reportData.stats.statusBreakdown.offer || 0) / reportData.stats.totalCandidates * 100)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Status breakdown */}
          <Card title="Candidate Status Breakdown">
            <div className="space-y-4">
              {Object.entries(reportData.stats.statusBreakdown).map(([status, count]: [string, any]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <StatusBadge status={status} className="mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{count} candidates</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getStatusColor(status)}`}
                      style={{ width: `${(count / reportData.stats.totalCandidates) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Candidate list */}
          <Card title="Candidate Details" subtitle="Complete list of candidates for this job">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persona
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.candidates.map((candidate: any) => (
                    <tr key={candidate.candidate_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {candidate.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={candidate.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.score ? `${candidate.score}%` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {candidate.persona || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Requirements analysis */}
          <Card title="Job Requirements Analysis">
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-gray-700">Requirements</h3>
    <ul className="space-y-2">
      {reportData.job.requirements.map((req: string, index: number) => (
        <li key={index} className="flex items-start">
          <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mr-2">
            {index + 1}
          </span>
          <span className="text-sm text-gray-800">{req}</span>
        </li>
      ))}
    </ul>

    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Candidate Skill Match (Averages)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Technical Skills", key: "technical_skills" },
          { label: "Communication", key: "communication" },
          { label: "Problem Solving", key: "problem_solving" },
          { label: "Team Collaboration", key: "team_collaboration" }
        ].map((metric) => {
          // Calculate average for this metric
          const values = reportData.candidates
            .map((c: any) => c.performance_metrics?.[metric.key])
            .filter((v: any) => typeof v === "number");
          const avg = values.length
            ? Math.round(values.reduce((a: any, b: any) => a + b, 0) / values.length)
            : "N/A";
          return (
            <div key={metric.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{metric.label}</span>
                <span className="text-xs font-medium text-gray-700">
                  {avg !== "N/A" ? `${avg}%` : "N/A"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: avg !== "N/A" ? `${avg}%` : "0%" }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</Card>
          
         <Card title="AI-Generated Insights">
  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
    <FileText size={20} className="text-blue-600 mb-2" />
    <p className="text-sm text-blue-800">
      {aiInsight || "Generating insight..."}
    </p>
  </div>
</Card>
        </div>
      )}
      
      {/* Empty state */}
      {!reportData && !isLoading && (
        <Card className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No report generated</h3>
            <p className="mt-1 text-gray-500">
              Select a job and generate a report to view detailed analytics
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper function
const getStatusColor = (status: string) => {
  switch (status) {
    case 'applied':
      return 'bg-gray-500';
    case 'screened':
      return 'bg-blue-500';
    case 'interview':
      return 'bg-amber-500';
    case 'offer':
      return 'bg-purple-500';
    case 'onboarded':
      return 'bg-green-500';
    case 'rejected':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export default Reports;