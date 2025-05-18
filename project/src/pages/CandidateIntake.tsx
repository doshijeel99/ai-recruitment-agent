import React, { useState, useRef } from 'react';
import { useRecruitment } from '../contexts/RecruitmentContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Upload, Check, FileText, AlertTriangle } from 'lucide-react';
import { uploadResume } from '../utils/api';

const CandidateIntake: React.FC = () => {
  const { jobs, refreshData } = useRecruitment();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResumeText, setParsedResumeText] = useState<string | null>(null);
  const [initialScore, setInitialScore] = useState<number | null>(null);
  const [resumeInsights, setResumeInsights] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setParsedResumeText(null);
      setInitialScore(null);
      setResumeInsights(null);
      setUploadSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedJobId) {
      setError('Please select a job');
      return;
    }
    
    if (!candidateName) {
      setError('Please enter candidate name');
      return;
    }
    
    if (!file) {
      setError('Please upload a resume PDF');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Generate a unique candidate ID (in a real app, this would come from the backend)
      const candidateId = Math.random().toString(36).substring(2, 9);
      
      const response = await uploadResume(selectedJobId, candidateId, candidateName, file);
      
      // In a real implementation, this data would come from the API
      setParsedResumeText(
        response.candidate.resume_text || 
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis euismod, feugiat nunc eu, pretium sapien. Donec nec dui luctus, vestibulum massa at, venenatis metus. Fusce placerat magna.'
      );
      setInitialScore(response.candidate.score || 78);
      setResumeInsights(response.candidate.persona || 'Strong technical candidate with leadership potential.');
      
      setUploadSuccess(true);
      await refreshData(); // Refresh candidates data
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedJobId('');
    setCandidateName('');
    setFile(null);
    setParsedResumeText(null);
    setInitialScore(null);
    setResumeInsights(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Candidate Intake</h2>
        <p className="mt-1 text-gray-600">Upload and process candidate resumes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload form */}
        <Card title="Upload Resume" className={uploadSuccess ? 'border-green-200' : ''}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">Select Job</label>
              <select
                id="jobId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                required
                disabled={isUploading || uploadSuccess}
              >
                <option value="">-- Select a job --</option>
                {jobs.map(job => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700">Candidate Name</label>
              <input
                type="text"
                id="candidateName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                required
                disabled={isUploading || uploadSuccess}
              />
            </div>
            
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="resume"
                      className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${
                        isUploading || uploadSuccess ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span>Upload a file</span>
                      <input
                        id="resume"
                        name="resume"
                        type="file"
                        ref={fileInputRef}
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf"
                        disabled={isUploading || uploadSuccess}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  
                  {file && (
                    <div className="flex items-center justify-center text-sm text-gray-800 mt-2">
                      <FileText size={16} className="mr-1 text-blue-500" />
                      {file.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
                <AlertTriangle size={18} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              {uploadSuccess ? (
                <Button 
                  variant="primary" 
                  type="button" 
                  onClick={resetForm}
                >
                  Add Another Candidate
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  type="submit" 
                  icon={<Upload size={16} />}
                  isLoading={isUploading}
                  disabled={!selectedJobId || !candidateName || !file}
                >
                  Upload Resume
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* AI Processing Results */}
        <Card 
          title="AI Processing Results" 
          subtitle="Resume parsing and initial evaluation"
          className={uploadSuccess ? 'border-green-200' : 'opacity-75'}
        >
          {uploadSuccess ? (
            <div className="space-y-4">
              <div className="flex items-center mb-4 bg-green-50 p-3 rounded-md border border-green-200">
                <Check size={20} className="text-green-500 mr-2" />
                <p className="text-green-800 text-sm font-medium">Resume processed successfully!</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Resume Text:</h3>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {parsedResumeText}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">AI-Generated Persona:</h3>
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-sm text-blue-800">
                  {resumeInsights}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Job Match Score:</h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        initialScore && initialScore >= 80 ? 'bg-green-500' :
                        initialScore && initialScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${initialScore}%` }}
                    ></div>
                  </div>
                  <span className={`ml-3 font-bold ${initialScore ? getScoreColor(initialScore) : ''}`}>
                    {initialScore}%
                  </span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  The candidate has been moved to the screening stage. Continue to the Matching & Screening page to review candidates.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <FileText size={48} />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resume uploaded</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload a resume to see AI-powered insights
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CandidateIntake;