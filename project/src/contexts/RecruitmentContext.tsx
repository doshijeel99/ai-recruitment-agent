import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, Candidate, JobFormData } from '../types';
import { 
  fetchJobs, 
  fetchCandidates, 
  createJob, 
  updateJob, 
  deleteJob,
  updateCandidateStatus
} from '../utils/api';

interface RecruitmentContextType {
  jobs: Job[];
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  addJob: (job: JobFormData) => Promise<void>;
  updateJobDetails: (jobId: string, job: JobFormData) => Promise<void>;
  removeJob: (jobId: string) => Promise<void>;
  updateCandidate: (candidateId: string, status: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, candidatesData] = await Promise.all([
        fetchJobs(),
        fetchCandidates()
      ]);
      setJobs(jobsData);
      setCandidates(candidatesData);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addJob = async (job: JobFormData) => {
    try {
      setLoading(true);
      await createJob(job);
      await loadData(); // Refresh data after creating job
    } catch (err) {
      setError('Failed to create job. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateJobDetails = async (jobId: string, job: JobFormData) => {
    try {
      setLoading(true);
      await updateJob(jobId, job);
      await loadData(); // Refresh data after updating job
    } catch (err) {
      setError('Failed to update job. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeJob = async (jobId: string) => {
    try {
      setLoading(true);
      await deleteJob(jobId);
      await loadData(); // Refresh data after deleting job
    } catch (err) {
      setError('Failed to delete job. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCandidate = async (candidateId: string, status: string) => {
    try {
      setLoading(true);
      await updateCandidateStatus(candidateId, status);
      await loadData(); // Refresh data after updating candidate
    } catch (err) {
      setError('Failed to update candidate status. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <RecruitmentContext.Provider 
      value={{ 
        jobs, 
        candidates, 
        loading, 
        error, 
        addJob, 
        updateJobDetails, 
        removeJob, 
        updateCandidate,
        refreshData
      }}
    >
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (context === undefined) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
};