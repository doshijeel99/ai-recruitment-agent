import React, { useState } from 'react';
import { useRecruitment } from '../contexts/RecruitmentContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface JobFormValues {
  title: string;
  description: string;
  requirements: string;
}

const JobManagement: React.FC = () => {
  const { jobs, addJob, updateJobDetails, removeJob } = useRecruitment();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<JobFormValues>({
    title: '',
    description: '',
    requirements: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleShowForm = (job?: any) => {
    if (job) {
      setFormValues({
        title: job.title,
        description: job.description,
        requirements: job.requirements.join('\n'),
      });
      setEditingJobId(job.job_id);
    } else {
      setFormValues({
        title: '',
        description: '',
        requirements: '',
      });
      setEditingJobId(null);
    }
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingJobId(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requirementsArray = formValues.requirements
      .split('\n')
      .map(req => req.trim())
      .filter(req => req !== '');
    
    const jobData = {
      title: formValues.title,
      description: formValues.description,
      requirements: requirementsArray,
    };
    
    if (editingJobId) {
      await updateJobDetails(editingJobId, jobData);
    } else {
      await addJob(jobData);
    }
    
    setIsFormVisible(false);
    setEditingJobId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      await removeJob(jobId);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Job Management</h2>
          <p className="mt-1 text-gray-600">Create and manage job postings</p>
        </div>
        <Button 
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => handleShowForm()}
        >
          Create New Job
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search jobs..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Job form */}
      {isFormVisible && (
        <Card 
          title={editingJobId ? 'Edit Job Posting' : 'Create New Job Posting'}
          className="border border-blue-200 shadow-md"
        >
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formValues.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formValues.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Requirements (one per line)
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formValues.requirements}
                onChange={handleInputChange}
                required
                placeholder="5+ years experience&#10;React&#10;TypeScript"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" type="button" onClick={handleCancelForm}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingJobId ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Job listings */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <div className="text-center py-6">
              <p className="text-gray-500">No jobs found. Create a new job posting to get started.</p>
            </div>
          </Card>
        ) : (
          filteredJobs.map(job => (
            <Card key={job.job_id} className="border border-gray-200 hover:border-blue-200 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-800">{job.title}</h3>
                    <StatusBadge status="active" className="ml-2" />
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700">Requirements:</h4>
                    <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit size={16} />}
                    onClick={() => handleShowForm(job)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDeleteJob(job.job_id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JobManagement;