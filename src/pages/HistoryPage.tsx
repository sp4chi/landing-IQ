import React, { useEffect, useState } from 'react';
import { History, Calendar, ArrowRight, Trash2, Search, Zap, AlertCircle } from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';

interface HistoryPageProps {
  onSelectReport: (report: any) => void;
  onNewAudit: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectReport, onNewAudit }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch reports history');
      }
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved report?')) return;

    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(reports.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const filteredReports = reports.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-navy-900">
            <History className="w-6 h-6 text-amber" />
            <h1 className="text-2xl font-bold font-display">Audit History</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Access your past landing page conversion analyses and reports.
          </p>
        </div>

        <button
          onClick={onNewAudit}
          className="px-5 py-2.5 bg-amber hover:bg-amber-hover text-navy-900 font-bold text-xs rounded-xl shadow-amber-glow transition-all flex items-center space-x-1.5"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search past reports by title..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-navy-900 focus:ring-2 focus:ring-amber focus:border-amber transition-all"
        />
      </div>

      {/* Content State */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="inline-block animate-spin w-6 h-6 border-2 border-amber border-t-transparent rounded-full" />
          <p className="text-xs text-gray-500">Loading your report history...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-gray-200">
          <div className="w-12 h-12 rounded-full bg-navy-50 text-amber flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-navy-900">No Audits Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No saved reports match your search query.'
              : "You haven't run any landing page conversion audits yet."}
          </p>
          {!searchQuery && (
            <button
              onClick={onNewAudit}
              className="px-6 py-2.5 bg-navy-900 text-offwhite font-bold text-xs rounded-xl hover:bg-navy-800 transition-colors"
            >
              Run Your First Audit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const dateStr = new Date(report.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="glass-card p-5 rounded-2xl border border-gray-200/90 hover:border-amber/60 hover:shadow-card transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-2 pr-4 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-amber" />
                    <span>{dateStr}</span>
                  </div>
                  <h3 className="font-bold text-navy-900 font-display text-base truncate group-hover:text-amber transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {report.inputContent.slice(0, 60)}...
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold font-display text-navy-900">
                      {report.conversionScore}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                      Score
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    title="Delete report"
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
