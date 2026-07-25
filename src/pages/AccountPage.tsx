import React, { useState } from 'react';
import { User, Mail, Calendar, LogOut, Trash2, ShieldAlert, AlertCircle } from 'lucide-react';

interface AccountPageProps {
  user: { id: string; email: string; createdAt?: string | Date };
  onLogout: () => void;
  onAccountDeleted: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  user,
  onLogout,
  onAccountDeleted,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/account', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      onAccountDeleted();
    } catch (err: any) {
      setError(err.message || 'Error deleting account');
      setDeleting(false);
    }
  };

  const createdDateStr = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active Member';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center space-x-2 text-navy-900">
        <User className="w-6 h-6 text-amber" />
        <h1 className="text-2xl font-bold font-display">Account Settings</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-card space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-navy-900 text-amber font-display font-bold text-2xl flex items-center justify-center border border-navy-700">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy-900 font-display">{user.email}</h2>
            <p className="text-xs text-gray-500 mt-0.5">LandingIQ Pro Member</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="p-4 rounded-xl bg-offwhite border border-gray-200 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Email Address</span>
            </span>
            <p className="text-sm font-semibold text-navy-900">{user.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-offwhite border border-gray-200 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member Since</span>
            </span>
            <p className="text-sm font-semibold text-navy-900">{createdDateStr}</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-offwhite font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4 text-amber" />
            <span>Log Out of Session</span>
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            className="w-full sm:w-auto px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold text-xs rounded-xl transition-colors border border-transparent hover:border-red-200 flex items-center justify-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-display text-navy-900">
              Delete LandingIQ Account?
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed">
              This action is permanent and cannot be undone. All your saved landing page audit reports and score histories will be permanently removed.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting Account...' : 'Yes, Delete Permanently'}
              </button>
              <button
                disabled={deleting}
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-navy-900 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
