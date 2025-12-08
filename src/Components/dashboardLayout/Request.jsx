import React, { useEffect, useState } from 'react';
import { FilePlus, Search, Filter, CheckCircle, XCircle, Clock, User, Mail, Phone, Edit2, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { batchAccessAPI, batchAPI } from '../../services/apiService';

export default function AdminExamRequests() {
  const [request, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, status: '', studentId: null, batchName: '' });
  const [editModal, setEditModal] = useState({ open: false, request: null });
  const [editForm, setEditForm] = useState({ status: '', batchName: '' });
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const pageSize = 10;

  const fetchRequests = async () => {
    try {
      const res = await batchAccessAPI.getAllRequests();
      const requestsData = Array.isArray(res) ? res : (res.requests || []);
      setRequests(requestsData);
    } catch (err) {
      console.error('Failed to load requests:', err);
      toast.error('Failed to load requests');
    }
  };

  const updateStatus = async (studentId, status, batchName) => {
    try {
      setLoadingRequestId(studentId);
      await batchAccessAPI.updateRequestStatus(studentId, status, batchName);
      toast.success(`Request ${status} successfully!`);
      fetchRequests();
    } catch (err) {
      toast.error('Error updating request.');
    } finally {
      setLoadingRequestId(null);
      setConfirmModal({ open: false, id: null, status: '', studentId: null, batchName: '' });
    }
  };

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const batches = await batchAPI.getBatches();
      setAvailableBatches(Array.isArray(batches) ? batches : []);
    } catch (err) {
      console.error('Failed to load batches:', err);
      toast.error('Failed to load batches');
      setAvailableBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleEdit = async (request) => {
    setEditForm({
      status: request.status || 'pending',
      batchName: request.batchName || ''
    });
    setEditModal({ open: true, request });
    // Fetch batches when opening edit modal
    if (availableBatches.length === 0) {
      await fetchBatches();
    }
  };

  const handleSaveEdit = async () => {
    if (!editModal.request) return;
    
    const student = editModal.request.student || {};
    const studentId = student.id || editModal.request.studentId;
    
    try {
      setLoadingRequestId(studentId);
      await batchAccessAPI.updateRequestStatus(studentId, editForm.status, editForm.batchName);
      toast.success('Request updated successfully!');
      fetchRequests();
      setEditModal({ open: false, request: null });
      setEditForm({ status: '', batchName: '' });
    } catch (err) {
      toast.error('Error updating request.');
    } finally {
      setLoadingRequestId(null);
    }
  };

  useEffect(() => {
    let data = [...request];
    const lowerSearch = searchTerm.toLowerCase();

    data = data.filter((req) => {
      const student = req.student || {};
      const name = student.name?.toLowerCase() || '';
      const email = student.email?.toLowerCase() || '';
      const mobileNumber = student.mobileNumber?.toLowerCase() || '';

      return name.includes(lowerSearch) || email.includes(lowerSearch) || mobileNumber.includes(lowerSearch);
    });

    if (statusFilter !== 'all') {
      data = data.filter((req) => req.status === statusFilter);
    }

    if (sortBy === 'status') {
      data.sort((a, b) => a.status.localeCompare(b.status));
    } else {
      data.sort((a, b) => {
        const dateA = new Date(a.requestedAt || a.requested_at || a.createdAt || 0);
        const dateB = new Date(b.requestedAt || b.requested_at || b.createdAt || 0);
        return dateB - dateA;
      });
    }

    setFilteredRequests(data);
    setCurrentPage(1);
  }, [request, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = {
    total: request.length,
    pending: request.filter(r => r.status === 'pending').length,
    approved: request.filter(r => r.status === 'approved').length,
    declined: request.filter(r => r.status === 'declined').length,
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
            <FilePlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Access Requests</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage student batch access requests</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Total Requests</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FilePlus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Approved</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Declined</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.declined}</p>
            </div>
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-9 sm:pl-10 pr-8 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {paginatedRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FilePlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No requests found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {paginatedRequests.map((req) => {
              const student = req.student || {};
              const studentId = student.id || req.studentId;
              const isLoading = loadingRequestId === studentId;
              const isApproved = req.status === 'approved';
              const isDeclined = req.status === 'declined';
              const isPending = req.status === 'pending';

              return (
                <div
                  key={req.id || req._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm sm:text-base">
                        {student.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{student.name || 'N/A'}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                          <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 truncate">
                            <Mail size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
                            <span className="truncate">{student.email || 'N/A'}</span>
                          </span>
                          {student.mobileNumber && (
                            <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                              <Phone size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
                              {student.mobileNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                        isApproved
                          ? 'bg-green-100 text-green-800'
                          : isDeclined
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Batch Name</p>
                      <p className="text-sm font-medium text-gray-900">{req.batchName || 'N/A'}</p>
                    </div>
                    {req.examCode && (
                      <div>
                        <p className="text-xs text-gray-500">Exam Code</p>
                        <p className="text-sm font-medium text-gray-900">{req.examCode}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Requested</p>
                      <p className="text-sm text-gray-600">
                        {req.requestedAt || req.requested_at || req.createdAt
                          ? new Date(req.requestedAt || req.requested_at || req.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t border-gray-200 ${isPending ? '' : 'sm:justify-end'}`}>
                    {isPending && (
                      <>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              id: req.id || req._id,
                              status: 'approved',
                              studentId: studentId,
                              batchName: req.batchName,
                            })
                          }
                          disabled={isLoading}
                          className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span className="hidden sm:inline">Processing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                              <span>Approve</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              id: req.id || req._id,
                              status: 'declined',
                              studentId: studentId,
                              batchName: req.batchName,
                            })
                          }
                          disabled={isLoading}
                          className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span className="hidden sm:inline">Processing...</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                              <span>Decline</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(req)}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-4">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, filteredRequests.length)}</span> of{' '}
                <span className="font-medium">{filteredRequests.length}</span> results
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to <strong>{confirmModal.status}</strong> this request?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, id: null, status: '', studentId: null, batchName: '' })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateStatus(confirmModal.studentId, confirmModal.status, confirmModal.batchName)
                }
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                  confirmModal.status === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && editModal.request && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Request</h3>
              <button
                onClick={() => {
                  setEditModal({ open: false, request: null });
                  setEditForm({ status: '', batchName: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={editModal.request.student?.name || 'N/A'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name
                </label>
                {loadingBatches ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                    Loading batches...
                  </div>
                ) : (
                  <select
                    value={editForm.batchName}
                    onChange={(e) => setEditForm({ ...editForm, batchName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select a batch</option>
                    {availableBatches.map((batch) => (
                      <option key={batch.id || batch._id} value={batch.batchName}>
                        {batch.batchName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditModal({ open: false, request: null });
                  setEditForm({ status: '', batchName: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loadingRequestId === (editModal.request.student?.id || editModal.request.studentId)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingRequestId === (editModal.request.student?.id || editModal.request.studentId) ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
