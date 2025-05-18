export interface Job {
  job_id: string;
  title: string;
  description: string;
  requirements: string[];
  createdAt?: string;
}

export interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
}

export interface Candidate {
  candidate_id: string;
  name: string;
  resume_text?: string;
  status: 'applied' | 'screened' | 'interview' | 'offer' | 'onboarded' | 'rejected';
  score?: number;
  persona?: string;
  interview_tasks?: string[];
  performance_review?: string;
  performance_metrics?: Record<string, number>;
  job_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeUploadResponse {
  message: string;
  candidate: Candidate;
}

export interface StatusUpdate {
  candidateId: string;
  status: string;
}

export interface DashboardStats {
  totalJobs: number;
  totalCandidates: number;
  candidatesByStatus: Record<string, number>;
  recentActivities: {
    id: string;
    type: 'job' | 'candidate';
    action: string;
    entity: string;
    timestamp: string;
  }[];
}

export interface ReportData {
  job: Job;
  candidates: Candidate[];
  stats: {
    totalCandidates: number;
    averageScore: number;
    statusBreakdown: Record<string, number>;
  };
}

export type TaskAction = 'approve' | 'reject' | 'regenerate';