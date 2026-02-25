import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const ComplaintsList = () => {
  const { user, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });

  // ✅ FIX: Use useCallback to avoid hook dependency warnings
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;

      const response = await complaintAPI.getAllComplaints(params);
      setComplaints(response.data.complaints);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.category]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'text-gray-600 bg-gray-50',
      'Medium': 'text-blue-600 bg-blue-50',
      'High': 'text-orange-600 bg-orange-50',
      'Urgent': 'text-red-600 bg-red-50',
    };
    return colors[priority] || 'text-gray-600 bg-gray-50';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'Urgent' || priority === 'High') {
      return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
    return null;
  };

  const isOwner = (complaint) => {
    return complaint.createdBy?._id === user?.id;
  };

  // Filter complaints by search, status, category, AND priority
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      complaint.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesPriority = !filters.priority || complaint.priority === filters.priority;
    
    return matchesSearch && matchesPriority;
  });

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            All Complaints
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''} found
            {!isAdmin() && (
              <span className="ml-2 text-sm">
                (You can edit/delete only your own complaints)
              </span>
            )}
          </p>
        </div>
        {!isAdmin() && (
          <Link to="/complaints/new" className="btn-primary inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Complaint
          </Link>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          
          {/* Active Filter Indicator */}
          {(filters.status || filters.category || filters.priority || filters.search) && (
            <button
              onClick={() => setFilters({ status: '', category: '', priority: '', search: '' })}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search complaints..."
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All Categories</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Cleanliness">Cleanliness</option>
            <option value="Security">Security</option>
            <option value="Noise">Noise</option>
            <option value="Parking">Parking</option>
            <option value="Electricity">Electricity</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Internet/WiFi">Internet/WiFi</option>
            <option value="Common Areas">Common Areas</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">🔥 Urgent</option>
          </select>
        </div>

        {/* Active Filters Display */}
        {(filters.status || filters.category || filters.priority) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filters.status}
                <button
                  onClick={() => setFilters({ ...filters, status: '' })}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Category: {filters.category}
                <button
                  onClick={() => setFilters({ ...filters, category: '' })}
                  className="ml-2 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Priority: {filters.priority}
                <button
                  onClick={() => setFilters({ ...filters, priority: '' })}
                  className="ml-2 hover:text-orange-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">
            {filters.search || filters.status || filters.category || filters.priority
              ? 'No complaints match your filters'
              : 'No complaints found'}
          </p>
          {!isAdmin() && (
            <Link to="/complaints/new" className="btn-primary mt-4 inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Complaint
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Link
              key={complaint._id}
              to={`/complaints/${complaint._id}`}
              className="card hover:shadow-md transition-shadow cursor-pointer block"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {complaint.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    {/* Priority Badge with Icon */}
                    <span className={`px-2 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 ${getPriorityColor(complaint.priority)}`}>
                      {getPriorityIcon(complaint.priority)}
                      {complaint.priority}
                    </span>
                    {!isAdmin() && isOwner(complaint) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        Your Complaint
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {complaint.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="font-medium mr-1">Category:</span>
                      {complaint.category}
                    </span>
                    {complaint.location && (
                      <span className="flex items-center">
                        <span className="font-medium mr-1">Location:</span>
                        {complaint.location}
                      </span>
                    )}
                    <span className="flex items-center">
                      <span className="font-medium mr-1">By:</span>
                      {complaint.createdBy?.name}
                    </span>
                  </div>
                </div>

                <div className="text-right text-sm text-gray-500 ml-4">
                  <p>{new Date(complaint.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs">{new Date(complaint.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintsList;