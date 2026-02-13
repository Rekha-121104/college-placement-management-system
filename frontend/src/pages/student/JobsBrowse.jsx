import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiMapPin, FiBriefcase } from 'react-icons/fi';

export default function JobsBrowse() {
  const [jobs, setJobs] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDrive, setFilterDrive] = useState('');
  const [coverLetter, setCoverLetter] = useState({});
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/jobs' + (filterDrive ? `?drive=${filterDrive}` : '')),
      api.get('/placement-drives?status=active'),
    ]).then(([jobsRes, drivesRes]) => {
      setJobs(jobsRes.data);
      setDrives(drivesRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [filterDrive]);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await api.post('/applications', { job: jobId, coverLetter: coverLetter[jobId] || '' });
      toast.success('Application submitted!');
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(null);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Browse Jobs</h1>
      <div className="mb-6">
        <label className="label">Filter by Placement Drive</label>
        <select value={filterDrive} onChange={(e) => setFilterDrive(e.target.value)} className="input max-w-xs">
          <option value="">All Drives</option>
          {drives.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
      </div>
      {jobs.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">No active jobs at the moment. Check back later!</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="card">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-primary-600 font-medium">{job.company?.companyName}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><FiBriefcase />{job.type}</span>
                    {job.locations?.length > 0 && <span className="flex items-center gap-1"><FiMapPin />{job.locations.join(', ')}</span>}
                    {job.workMode && <span>{job.workMode}</span>}
                  </div>
                  <p className="mt-2 text-slate-600 line-clamp-2">{job.description}</p>
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                  {job.deadline && <p className="text-sm text-slate-500 mt-2">Deadline: {format(new Date(job.deadline), 'PP')}</p>}
                </div>
                <div className="md:w-64 shrink-0">
                  <textarea
                    placeholder="Cover letter (optional)"
                    value={coverLetter[job._id] || ''}
                    onChange={(e) => setCoverLetter({ ...coverLetter, [job._id]: e.target.value })}
                    className="input text-sm mb-2"
                    rows={2}
                  />
                  <button
                    onClick={() => handleApply(job._id)}
                    disabled={applying === job._id}
                    className="btn-primary w-full"
                  >
                    {applying === job._id ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
