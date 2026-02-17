import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusColors = {
  submitted: 'bg-slate-100', reviewed: 'bg-blue-100', shortlisted: 'bg-green-100', rejected: 'bg-red-100',
  interview_scheduled: 'bg-purple-100', offer_extended: 'bg-amber-100', offer_accepted: 'bg-green-200',
};

export default function CompanyApplications() {
  const { jobId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(jobId || '');
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ applicationId: '', scheduledAt: '', type: 'virtual', duration: 30 });
  const [offerForm, setOfferForm] = useState({ applicationId: '', ctc: '', joiningDate: '', companyFeedback: '' });
  const [feedbackForm, setFeedbackForm] = useState({ applicationId: '', feedback: '' });
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.get('/companies/jobs').then(({ data }) => {
      setJobs(data);
      setSelectedJob((prev) => prev || data[0]?._id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedJob) { setLoading(false); return; }
    api.get(`/applications/job/${selectedJob}`).then(({ data }) => setApplications(data)).catch(console.error).finally(() => setLoading(false));
  }, [selectedJob]);

  const updateStatus = async (appId, status, feedback, offerDetails) => {
    setUpdating(appId);
    try {
      await api.patch(`/applications/${appId}/status`, { status, companyFeedback: feedback, offerDetails });
      toast.success('Updated');
      setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status } : a)));
      setOfferForm({ applicationId: '', ctc: '', joiningDate: '', companyFeedback: '' });
      setFeedbackForm({ applicationId: '', feedback: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setUpdating(null);
    }
  };

  const extendOffer = async (e) => {
    e.preventDefault();
    setUpdating(offerForm.applicationId);
    try {
      await api.patch(`/applications/${offerForm.applicationId}/status`, {
        status: 'offer_extended',
        companyFeedback: offerForm.companyFeedback,
        offerDetails: {
          ctc: offerForm.ctc ? parseFloat(offerForm.ctc) : undefined,
          joiningDate: offerForm.joiningDate || undefined,
        },
      });
      toast.success('Offer extended!');
      setApplications((prev) => prev.map((a) => (a._id === offerForm.applicationId ? { ...a, status: 'offer_extended' } : a)));
      setOfferForm({ applicationId: '', ctc: '', joiningDate: '', companyFeedback: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setUpdating(null);
    }
  };

  const scheduleInterview = async (e) => {
    e.preventDefault();
    setScheduling(scheduleForm.applicationId);
    try {
      await api.post('/interviews', {
        applicationId: scheduleForm.applicationId,
        scheduledAt: scheduleForm.scheduledAt,
        type: scheduleForm.type,
        duration: scheduleForm.duration,
      });
      toast.success('Interview scheduled!');
      setScheduleForm({ applicationId: '', scheduledAt: '', type: 'virtual', duration: 30 });
      setApplications((prev) => prev.map((a) => (a._id === scheduleForm.applicationId ? { ...a, status: 'interview_scheduled' } : a)));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setScheduling(null);
    }
  };

  if (loading && !applications.length) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Applications</h1>
      <div className="mb-6">
        <label className="label">Select Job</label>
        <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="input max-w-md">
          {jobs.map((j) => (
            <option key={j._id} value={j._id}>{j.title}</option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app._id} className="card">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-semibold">{app.student?.fullName}</h3>
                <p className="text-slate-500 text-sm">{app.student?.rollNumber} · {app.student?.department} · CGPA: {app.student?.cgpa || 'N/A'}</p>
                <p className="mt-2 text-sm">{app.coverLetter || 'No cover letter'}</p>
                {app.student?.resume && <a href={app.student.resume} target="_blank" rel="noreferrer" className="text-primary-600 text-sm mt-2 inline-block">View Resume</a>}
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-sm ${statusColors[app.status] || 'bg-slate-100'}`}>{app.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {['submitted', 'reviewed'].includes(app.status) && (
                  <>
                    <button onClick={() => updateStatus(app._id, 'shortlisted')} disabled={updating} className="btn-primary text-sm">Shortlist</button>
                    <button onClick={() => updateStatus(app._id, 'rejected')} disabled={updating} className="btn-secondary text-sm">Reject</button>
                    <button onClick={() => setFeedbackForm(feedbackForm.applicationId === app._id ? { applicationId: '', feedback: '' } : { ...feedbackForm, applicationId: app._id })} className="btn-secondary text-sm">Reject with feedback</button>
                    {feedbackForm.applicationId === app._id && (
                      <div className="mt-2">
                        <input placeholder="Feedback for candidate" value={feedbackForm.feedback} onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })} className="input text-sm mb-1" />
                        <button onClick={() => updateStatus(app._id, 'rejected', feedbackForm.feedback)} className="btn-danger text-sm">Confirm Reject</button>
                      </div>
                    )}
                  </>
                )}
                {app.status === 'shortlisted' && (
                  <button onClick={() => setScheduleForm({ ...scheduleForm, applicationId: app._id })} className="btn-primary text-sm">Schedule Interview</button>
                )}
                {app.status === 'interview_scheduled' && (
                  <button onClick={() => setOfferForm({ ...offerForm, applicationId: app._id })} className="btn-primary text-sm">Extend Offer</button>
                )}
              </div>
            </div>
            {offerForm.applicationId === app._id && (
              <form onSubmit={extendOffer} className="mt-4 p-4 bg-amber-50 rounded-lg flex flex-wrap gap-4 items-end">
                <div>
                  <label className="label">CTC (LPA)</label>
                  <input type="number" step="0.01" value={offerForm.ctc} onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })} className="input w-32" placeholder="e.g. 8.5" />
                </div>
                <div>
                  <label className="label">Joining Date</label>
                  <input type="date" value={offerForm.joiningDate} onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })} className="input" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="label">Feedback (optional)</label>
                  <input value={offerForm.companyFeedback} onChange={(e) => setOfferForm({ ...offerForm, companyFeedback: e.target.value })} className="input" placeholder="Message to candidate" />
                </div>
                <button type="submit" disabled={updating} className="btn-primary">Extend Offer</button>
                <button type="button" onClick={() => setOfferForm({ applicationId: '', ctc: '', joiningDate: '', companyFeedback: '' })} className="btn-secondary">Cancel</button>
              </form>
            )}
            {scheduleForm.applicationId === app._id && (
              <form onSubmit={scheduleInterview} className="mt-4 p-4 bg-slate-50 rounded-lg flex flex-wrap gap-4 items-end">
                <div>
                  <label className="label">Date & Time</label>
                  <input type="datetime-local" value={scheduleForm.scheduledAt} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select value={scheduleForm.type} onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })} className="input">
                    <option value="virtual">Virtual</option>
                    <option value="in-person">In-person</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duration (min)</label>
                  <input type="number" value={scheduleForm.duration} onChange={(e) => setScheduleForm({ ...scheduleForm, duration: +e.target.value })} className="input w-24" />
                </div>
                <button type="submit" disabled={scheduling} className="btn-primary">Schedule</button>
                <button type="button" onClick={() => setScheduleForm({ ...scheduleForm, applicationId: '' })} className="btn-secondary">Cancel</button>
              </form>
            )}
          </div>
        ))}
        {applications.length === 0 && <div className="card text-center py-12 text-slate-500">No applications for this job.</div>}
      </div>
    </div>
  );
}
