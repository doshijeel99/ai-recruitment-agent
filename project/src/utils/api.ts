import axios, { AxiosError } from 'axios';
import { Job, Candidate, JobFormData, ResumeUploadResponse, StatusUpdate } from '../types';

export const API_URL = 'http://localhost:8000';
const api = axios.create({ baseURL: API_URL });

export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const response = await api.get('/jobs');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Server responded with error:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from server. Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', axiosError.message);
    }
    throw error;
  }
};

export const fetchCandidates = async (): Promise<Candidate[]> => {
  try {
    const response = await api.get('/candidates');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Server responded with error:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from server. Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', axiosError.message);
    }
    throw error;
  }
};

export const createJob = async (job: JobFormData): Promise<Job> => {
  try {
    const response = await api.post('/jobs', job);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Server responded with error:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from server. Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', axiosError.message);
    }
    throw error;
  }
};

export const updateJob = async (jobId: string, job: JobFormData): Promise<Job> => {
  try {
    const response = await api.put(`/jobs/${jobId}`, job);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Server responded with error:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from server. Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', axiosError.message);
    }
    throw error;
  }
};

export const deleteJob = async (jobId: string): Promise<void> => {
  try {
    await api.delete(`/jobs/${jobId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Server responded with error:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from server. Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', axiosError.message);
    }
    throw error;
  }
};

export const uploadResume = async (
  jobId: string,
  candidateId: string,
  name: string,
  file: File
): Promise<ResumeUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('candidate_id', candidateId);
    formData.append('name', name);
    formData.append("file", file);

    const response = await api.post('/upload_resume/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Server responded with error:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from server. Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', axiosError.message);
    }
    throw error;
  }
};

export const updateCandidateStatus = async (
  candidateId: string,
  status: string
): Promise<Candidate> => {
  try {
    const response = await api.patch(`/candidates/${candidateId}/status`, { status });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Server responded with error:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from server. Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', axiosError.message);
    }
    throw error;
  }
};

export const generateTasks = async (
  candidateId: string,
  resumeText: string
): Promise<string[]> => {
  try {
    const response = await api.post('/generate_tasks', {
      candidate_id: candidateId,
      resume_text: resumeText,
    });
    return response.data.tasks;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Server responded with error:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from server. Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', axiosError.message);
    }
    throw error;
  }
};

export const getReportData = async (jobId: string): Promise<any> => {
  try {
    const response = await api.get(`/reports/job/${jobId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Server responded with error:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from server. Check if the server is running at:', API_URL);
    } else {
      console.error('Error setting up request:', axiosError.message);
    }
    throw error;
  }
};