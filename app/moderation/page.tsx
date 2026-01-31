"use client";

import { useEffect, useState } from 'react';
import { useSessionStore } from '../../stores/useSessionStore';

interface Report {
  id: string;
  messageId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export default function ModerationPage() {
  const session = useSessionStore((s) => s.session);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/moderation/reports');
        const json = await res.json();
        setReports(json.reports || []);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleResolve = async (reportId: string, action: 'approve' | 'ban') => {
    try {
      const res = await fetch(`/api/moderation/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, status: 'resolved', resolvedAt: new Date().toISOString() } : r
          )
        );
      }
    } catch (err) {
      console.error('Failed to resolve report:', err);
    }
  };

  const filteredReports = reports.filter((r) => filter === 'all' || r.status === filter);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="card p-6 text-center">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Moderation</h2>
            <p className="mt-2 text-sm text-slate-600">Review and manage reported content.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-900">{reports.length}</div>
            <div className="text-xs text-slate-500">Total reports</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'reviewed', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No reports to display.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-slate-500">
                        Message: {report.messageId.slice(0, 8)}...
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${report.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : report.status === 'reviewed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">
                      <strong>Reason:</strong> {report.reason}
                    </p>
                    <p className="text-xs text-slate-500">
                      Reported by: {report.reporterId.slice(0, 8)}... on{' '}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleResolve(report.id, 'approve')}
                        className="px-3 py-1 rounded text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, 'ban')}
                        className="px-3 py-1 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        Ban
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
