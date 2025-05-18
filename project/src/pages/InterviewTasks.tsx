import React, { useState } from 'react';
import { useRecruitment } from '../contexts/RecruitmentContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { RefreshCw, Edit, Check, Calendar } from 'lucide-react';
import { API_URL } from '../utils/api';

const InterviewTasks: React.FC = () => {
  const { candidates, jobs } = useRecruitment();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tasks, setTasks] = useState<string[]>([]);
  const [editableTask, setEditableTask] = useState<string>('');
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Find candidates with interview tasks
  const interviewCandidates = candidates.filter(
    candidate => 
      (candidate.status === 'screened' || candidate.status === 'interview') && 
      candidate.interview_tasks && 
      candidate.interview_tasks.length > 0
  );

  const handleCandidateSelect = (candidateId: string) => {
    const candidate = candidates.find(c => c.candidate_id === candidateId);
    if (candidate && candidate.interview_tasks) {
      setSelectedCandidateId(candidateId);
      setTasks([...candidate.interview_tasks]);
      setIsEditing(false);
      setEditingTaskIndex(null);
    }
  };

  const handleRegenerateTasks = async () => {
    const candidate = candidates.find(c => c.candidate_id === selectedCandidateId);
    if (!candidate || !candidate.job_id) return;

    try {
      setIsRegenerating(true);
      const response = await fetch(
        `${API_URL}/candidates/${candidate.candidate_id}/regenerate_tasks?job_id=${candidate.job_id}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error('Failed to regenerate tasks');
      const data = await response.json();
      // Ensure tasks are a clean array of strings
      const cleanTasks = Array.isArray(data.interview_tasks)
        ? data.interview_tasks.map((t: string) => t.replace(/^\d+\.\s*/, '').trim())
        : [];
      setTasks(cleanTasks);

      setSuccessMessage('Tasks regenerated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error regenerating tasks:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleEditTask = (index: number) => {
    setEditingTaskIndex(index);
    setEditableTask(tasks[index]);
  };

  const handleSaveTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = editableTask;
    setTasks(updatedTasks);
    setEditingTaskIndex(null);
    setSuccessMessage('Task updated successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCancelEdit = () => {
    setEditingTaskIndex(null);
  };

  const handleAssignTasks = () => {
    // In a real app, this would save the tasks to the backend
    setSuccessMessage('Tasks assigned successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Interview Tasks</h2>
        <p className="mt-1 text-gray-600">Manage and customize candidate interview tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate list */}
        <div className="lg:col-span-1">
          <Card 
            title="Candidates" 
            subtitle="Select a candidate to manage their interview tasks"
          >
            <div className="divide-y divide-gray-200 -mt-2 -mx-4">
              {interviewCandidates.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  <p>No candidates with interview tasks.</p>
                </div>
              ) : (
                interviewCandidates.map(candidate => (
                  <div 
                    key={candidate.candidate_id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      selectedCandidateId === candidate.candidate_id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCandidateSelect(candidate.candidate_id)}
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
                    
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        {candidate.interview_tasks?.length} interview tasks
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        
        {/* Task management */}
        <div className="lg:col-span-2">
          {selectedCandidateId ? (
            <div className="space-y-4">
              {/* Candidate info */}
              {(() => {
                const candidate = candidates.find(c => c.candidate_id === selectedCandidateId);
                if (!candidate) return null;
                
                const job = jobs.find(j => j.job_id === candidate.job_id);
                
                return (
                  <Card className="border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-500">{job?.title || 'No job assigned'}</p>
                      </div>
                      
                      <StatusBadge status={candidate.status} />
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4 flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<RefreshCw size={16} />}
                        onClick={handleRegenerateTasks}
                        isLoading={isRegenerating}
                      >
                        Regenerate Tasks
                      </Button>
                      <Button
                        variant={isEditing ? "outline" : "primary"}
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? "Cancel Editing" : "Edit Tasks"}
                      </Button>
                    </div>
                  </Card>
                );
              })()}
              
              {/* Success message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
                  <Check size={18} className="text-green-500 mr-2" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}
              
              {/* Tasks list */}
              <Card title="Interview Tasks">
                <ol className="list-decimal pl-6 space-y-4">
                  {tasks.map((task, index) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      {editingTaskIndex === index ? (
                        <div className="space-y-2">
                          <textarea
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                            value={editableTask}
                            onChange={(e) => setEditableTask(e.target.value)}
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveTask(index)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{task}</p>
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleEditTask(index)}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
                
                {/* Assign button */}
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    icon={<Calendar size={16} />}
                    onClick={handleAssignTasks}
                  >
                    Assign Tasks with Deadline
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No candidate selected</h3>
                <p className="mt-1 text-gray-500">
                  Select a candidate to view and manage their interview tasks
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewTasks;