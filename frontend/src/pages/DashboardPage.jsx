import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import {
  ExclamationCircleIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    rejected: 0,
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0
  });

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsResponse = await complaintAPI.getStats();
      const statsData = statsResponse.data.stats;

      setStats({
        total: statsData?.total || 0,
        pending: statsData?.byStatus?.Pending || 0,
        inProgress: statsData?.byStatus?.['In Progress'] || 0,
        resolved: statsData?.byStatus?.Resolved || 0,
        closed: statsData?.byStatus?.Closed || 0,
        rejected: statsData?.byStatus?.Rejected || 0,
        low: statsData?.byPriority?.Low || 0,
        medium: statsData?.byPriority?.Medium || 0,
        high: statsData?.byPriority?.High || 0,
        urgent: statsData?.byPriority?.Urgent || 0
      });

      const complaintsResponse = await complaintAPI.getAllComplaints();
      const allComplaints = complaintsResponse.data.complaints || [];

      const sorted = [...allComplaints].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setRecentComplaints(sorted.slice(0, 5));

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {isAdmin()
            ? 'Admin Dashboard - Manage all complaints'
            : 'Resident Dashboard - Submit and track complaints'}
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Profile Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Information
          </h2>

          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <UserCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            {user?.phoneNumber && (
              <div className="flex items-center text-gray-700">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{user.phoneNumber}</p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t">
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                isAdmin()
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Complaint Statistics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatBox label="Total" value={stats.total} link="/complaints" />
            <StatBox label="Pending" value={stats.pending} link="/complaints?status=Pending" />
            <StatBox label="In Progress" value={stats.inProgress} link="/complaints?status=In%20Progress" />
            <StatBox label="Resolved" value={stats.resolved} link="/complaints?status=Resolved" />
            <StatBox label="Closed" value={stats.closed} link="/complaints?status=Closed" />
          </div>

          {isAdmin() && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Priority Statistics
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label="Low" value={stats.low} link="/complaints?priority=Low" />
                <StatBox label="Medium" value={stats.medium} link="/complaints?priority=Medium" />
                <StatBox label="High" value={stats.high} link="/complaints?priority=High" />
                <StatBox label="Urgent" value={stats.urgent} link="/complaints?priority=Urgent" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Complaints
          </h2>
          <Link to="/complaints" className="text-sm text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="text-center py-8">
            <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No complaints yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentComplaints.map((complaint) => (
              <Link
                key={complaint._id}
                to={`/complaints/${complaint._id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {complaint.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {complaint.description}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500 ml-4">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatBox = ({ label, value, link }) => {
  const box = (
    <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition cursor-pointer">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );

  return link ? <Link to={link}>{box}</Link> : box;
};

export default DashboardPage;