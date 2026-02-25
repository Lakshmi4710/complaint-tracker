import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';
import {
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Admin update data
  const [adminUpdateData, setAdminUpdateData] = useState({
    status: '',
    adminNotes: '',
    resolutionDetails: '',
    priority: '',
  });

  // Resident edit data
  const [residentEditData, setResidentEditData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    priority: '',
  });

  const categories = [
    'Maintenance',
    'Cleanliness',
    'Security',
    'Noise',
    'Parking',
    'Electricity',
    'Water Supply',
    'Internet/WiFi',
    'Common Areas',
    'Other'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const fetchComplaint = useCallback(async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getComplaint(id);
      setComplaint(response.data.complaint);
      
      // Set admin update data
      setAdminUpdateData({
        status: response.data.complaint.status,
        adminNotes: response.data.complaint.adminNotes || '',
        resolutionDetails: response.data.complaint.resolutionDetails || '',
        priority: response.data.complaint.priority,
      });

      // Set resident edit data
      setResidentEditData({
        title: response.data.complaint.title,
        description: response.data.complaint.description,
        location: response.data.complaint.location || '',
        category: response.data.complaint.category,
        priority: response.data.complaint.priority,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaint');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  const isOwner = complaint?.createdBy?._id === user?.id;
  const canEdit = isAdmin() || isOwner;
  const canDelete = isAdmin() || isOwner;

  const handleAdminUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await complaintAPI.updateComplaint(id, adminUpdateData);
      if (response.data.success) {
        setSuccess('Complaint updated successfully');
        setComplaint(response.data.complaint);
        setShowUpdateForm(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  const handleResidentEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await complaintAPI.updateComplaint(id, residentEditData);
      if (response.data.success) {
        setSuccess('Complaint updated successfully');
        setComplaint(response.data.complaint);
        setShowUpdateForm(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    try {
      await complaintAPI.deleteComplaint(id);
      setSuccess('Complaint deleted successfully');
      setTimeout(() => {
        navigate('/complaints');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete complaint');
    }
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
      'Low': 'text-gray-600',
      'Medium': 'text-blue-600',
      'High': 'text-orange-600',
      'Urgent': 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert type="error" message="Complaint not found" />
        <Link to="/complaints" className="btn-primary mt-4 inline-flex items-center">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <Link
          to="/complaints"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Complaints
        </Link>
        
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="btn-secondary inline-flex items-center"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              {isAdmin() ? 'Update Status' : 'Edit Complaint'}
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 inline-flex items-center"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {!canEdit && (
        <Alert 
          type="info" 
          message="You can view this complaint but cannot edit it. Only the complaint owner or admin can make changes."
        />
      )}

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Complaint Details */}
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
            {isOwner && !isAdmin() && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                Your Complaint
              </span>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
            {complaint.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{complaint.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Priority</p>
            <p className={`font-medium ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Updated</p>
            <p className="font-medium">{new Date(complaint.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {complaint.location && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{complaint.location}</p>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 mb-2">Description</p>
          <p className="text-gray-900 whitespace-pre-wrap">{complaint.description}</p>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-500 mb-2">Submitted By</p>
          <div>
            <p className="font-medium">{complaint.createdBy?.name}</p>
            <p className="text-sm text-gray-600">{complaint.createdBy?.email}</p>
            {complaint.createdBy?.phoneNumber && (
              <p className="text-sm text-gray-600">{complaint.createdBy.phoneNumber}</p>
            )}
          </div>
        </div>

        {complaint.adminNotes && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-2">Admin Notes</p>
            <p className="text-gray-900">{complaint.adminNotes}</p>
          </div>
        )}

        {complaint.resolutionDetails && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-2">Resolution Details</p>
            <p className="text-gray-900">{complaint.resolutionDetails}</p>
          </div>
        )}

        {complaint.resolvedAt && (
          <div className="border-t pt-4 mt-4 flex items-center text-green-600">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span>Resolved on {new Date(complaint.resolvedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Update/Edit Form */}
      {canEdit && showUpdateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {isAdmin() ? 'Update Complaint (Admin)' : 'Edit Your Complaint'}
          </h3>
          
          {/* Admin Form */}
          {isAdmin() && (
            <form onSubmit={handleAdminUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={adminUpdateData.status}
                    onChange={(e) => setAdminUpdateData({ ...adminUpdateData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={adminUpdateData.priority}
                    onChange={(e) => setAdminUpdateData({ ...adminUpdateData, priority: e.target.value })}
                    className="input-field"
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminUpdateData.adminNotes}
                  onChange={(e) => setAdminUpdateData({ ...adminUpdateData, adminNotes: e.target.value })}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="Add notes about this complaint..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Details
                </label>
                <textarea
                  value={adminUpdateData.resolutionDetails}
                  onChange={(e) => setAdminUpdateData({ ...adminUpdateData, resolutionDetails: e.target.value })}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="Describe how this was resolved..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {updating ? <Spinner size="small" /> : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Resident Form */}
          {!isAdmin() && isOwner && (
            <form onSubmit={handleResidentEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  value={residentEditData.title}
                  onChange={(e) => setResidentEditData({ ...residentEditData, title: e.target.value })}
                  required
                  maxLength="100"
                  className="input-field"
                  placeholder="Brief summary of the issue"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {residentEditData.title.length}/100 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={residentEditData.category}
                    onChange={(e) => setResidentEditData({ ...residentEditData, category: e.target.value })}
                    required
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    value={residentEditData.priority}
                    onChange={(e) => setResidentEditData({ ...residentEditData, priority: e.target.value })}
                    required
                    className="input-field"
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={residentEditData.location}
                  onChange={(e) => setResidentEditData({ ...residentEditData, location: e.target.value })}
                  maxLength="200"
                  className="input-field"
                  placeholder="Building, floor, room number, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={residentEditData.description}
                  onChange={(e) => setResidentEditData({ ...residentEditData, description: e.target.value })}
                  required
                  maxLength="1000"
                  rows="6"
                  className="input-field resize-none"
                  placeholder="Provide detailed information about the issue..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {residentEditData.description.length}/1000 characters
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium">Note:</p>
                <p>You can edit all details of your complaint except the <strong>status</strong>, which is managed by administrators.</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {updating ? <Spinner size="small" /> : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateForm(false);
                    setResidentEditData({
                      title: complaint.title,
                      description: complaint.description,
                      location: complaint.location || '',
                      category: complaint.category,
                      priority: complaint.priority,
                    });
                  }}
                  className="btn-secondary flex-1 inline-flex items-center justify-center"
                >
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintDetail;