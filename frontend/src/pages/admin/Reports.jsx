import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function AdminReports() {
  const [trends, setTrends] = useState(null);
  const [driveReports, setDriveReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/reports/analytics/trends'),
      api.get('/placement-drives'),
    ]).then(([trendsRes, drivesRes]) => {
      setTrends(trendsRes.data);
      setDriveReports(drivesRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  const applicationsChart = trends?.applicationsByMonth && {
    labels: trends.applicationsByMonth.map((d) => d._id),
    datasets: [
      { label: 'Applications', data: trends.applicationsByMonth.map((d) => d.count), borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.2)', fill: true },
      { label: 'Placed', data: trends.applicationsByMonth.map((d) => d.placed), borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.2)', fill: true },
    ],
  };

  const handleExport = async (type) => {
    try {
      const endpoint = type === 'companies' ? '/integrations/companies/export' : '/integrations/jobs/export';
      const { data } = await api.get(endpoint);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `placement-${type}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      toast.success('Exported');
    } catch (e) {
      toast.error('Export failed');
    }
  };

  const handleImportCompanies = async (e) => {
    e.preventDefault();
    try {
      const companies = JSON.parse(importJson);
      if (!Array.isArray(companies)) throw new Error('Must be array');
      setImporting(true);
      const { data } = await api.post('/integrations/companies/import', { companies });
      toast.success(`Imported: ${data.imported}, Skipped: ${data.skipped}`);
      setImportJson('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid JSON');
    } finally {
      setImporting(false);
    }
  };

  const departmentChart = trends?.placementByDepartment && {
    labels: trends.placementByDepartment.map((d) => d._id || 'Unknown'),
    datasets: [{ label: 'Placements', data: trends.placementByDepartment.map((d) => d.count), backgroundColor: ['#0ea5e9', '#14b8a6', '#f59e0b', '#8b5cf6'] }],
  };

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Reports & Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {applicationsChart && (
          <div className="card">
            <h2 className="font-semibold mb-4">Applications & Placements Over Time</h2>
            <Line data={applicationsChart} options={{ responsive: true }} />
          </div>
        )}
        {departmentChart && (
          <div className="card">
            <h2 className="font-semibold mb-4">Placements by Department</h2>
            <Bar data={departmentChart} options={{ responsive: true }} />
          </div>
        )}
      </div>
      <div className="card">
        <h2 className="font-semibold mb-4">Data Import / Export</h2>
        <p className="text-slate-600 text-sm mb-4">Import companies from JSON or export data for backup/coordination with external systems.</p>
        <div className="flex flex-wrap gap-4 mb-4">
          <button onClick={() => handleExport('companies')} className="btn-secondary">Export Companies</button>
          <button onClick={() => handleExport('jobs')} className="btn-secondary">Export Jobs</button>
        </div>
        <form onSubmit={handleImportCompanies} className="space-y-2">
          <label className="label">Import Companies (JSON array)</label>
          <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} className="input font-mono text-sm" rows={4} placeholder='[{"companyName":"ABC Corp","contactPerson":"John","contactEmail":"john@abc.com","industry":"IT"}]' />
          <button type="submit" disabled={importing || !importJson.trim()} className="btn-primary">Import</button>
        </form>
      </div>
      <div className="card mt-6">
        <h2 className="font-semibold mb-4">Placement Drive Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Drive</th>
                <th className="text-left py-3">Status</th>
                <th className="text-right py-3">Companies</th>
              </tr>
            </thead>
            <tbody>
              {driveReports.map((d) => (
                <tr key={d._id} className="border-b border-slate-100">
                  <td className="py-3">{d.name}</td>
                  <td className="py-3"><span className={`px-2 py-0.5 rounded ${d.status === 'active' ? 'bg-green-100' : 'bg-slate-100'}`}>{d.status}</span></td>
                  <td className="py-3 text-right">{d.companies?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
