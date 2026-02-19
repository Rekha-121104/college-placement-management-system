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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">Browse Jobs</h1>
        <p className="text-slate-600">Find your perfect opportunity</p>
      </div>
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
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FiBriefcase className="text-slate-400" size={40} />
          </div>
          <p className="text-slate-500 text-lg font-medium mb-2">No active jobs at the moment</p>
          <p className="text-slate-400">Check back later for new opportunities!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job, idx) => (
            <div key={job._id} className="card-hover animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-xl text-slate-800 mb-1">{job.title}</h3>
                      <p className="text-primary-600 font-semibold text-lg">{job.company?.companyName}</p>
                    </div>
                    {job.company?.logo && (
                      <img src={job.company.logo} alt={job.company.companyName} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3 mb-3">
                    <span className="badge badge-primary flex items-center gap-1">
                      <FiBriefcase size={14} />
                      {job.type}
                    </span>
                    {job.locations?.length > 0 && (
                      <span className="badge badge-info flex items-center gap-1">
                        <FiMapPin size={14} />
                        {job.locations[0]}
                      </span>
                    )}
                    {job.workMode && (
                      <span className="badge badge-success capitalize">{job.workMode}</span>
                    )}
                  </div>
                  <p className="mt-3 text-slate-600 line-clamp-2 leading-relaxed">{job.description}</p>
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.skills.map((s) => (
                        <span key={s} className="px-3 py-1 bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 rounded-lg text-xs font-medium border border-primary-200">{s}</span>
                      ))}
                    </div>
                  )}
                  {job.deadline && (
                    <p className="text-sm text-slate-500 mt-4 flex items-center gap-1">
                      <span className="font-medium">Deadline:</span> {format(new Date(job.deadline), 'PP')}
                    </p>
                  )}
                </div>
                <div className="md:w-80 shrink-0">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl p-4 border border-slate-200">
                    <label className="label text-xs">Cover Letter (Optional)</label>
                    <textarea
                      placeholder="Tell us why you're a great fit..."
                      value={coverLetter[job._id] || ''}
                      onChange={(e) => setCoverLetter({ ...coverLetter, [job._id]: e.target.value })}
                      className="input text-sm mb-3 bg-white"
                      rows={3}
                    />
                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={applying === job._id}
                      className="btn-primary w-full"
                    >
                      {applying === job._id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Applying...
                        </span>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
