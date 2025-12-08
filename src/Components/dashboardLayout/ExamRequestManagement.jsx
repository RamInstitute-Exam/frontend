import React, { useEffect, useState } from 'react';
import { FileText, Search, Filter, CheckCircle, XCircle, Clock, User, Mail, Phone, BookOpen } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { examRequestAPI } from '../../services/apiService';

export default function ExamRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ 
    open: false, 
    id: null, 
    status: '', 
    studentId: null, 
    examCode: null,
    requestId: null
  });

  const pageSize = 10;

  const fetchRequests = async () => {
    try {
      const res = await examRequestAPI.getAllExamRequests(statusFilter !== 'all' ? statusFilter : null);
      const requestsData = Array.isArray(res.requests) ? res.requests : (res.requests || []);
      setRequests(requestsData);
    } catch (err) {
      console.error('Failed to load exam requests:', err);
      toast.error('Failed to load exam requests');
    }
  };

  const updateStatus = async (requestId, status, examCode, studentId) => {
    try {
      setLoadingRequestId(requestId);
      if (status === 'approved') {
        await examRequestAPI.approveRequest(requestId, examCode, studentId);
      } else if (status === 'denied') {
        await examRequestAPI.rejectRequest(requestId, examCode, studentId);
      }
      toast.success(`Request ${status} successfully!`);
      fetchRequests();
    } catch (err) {
      toast.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} request.`);
    } finally {
      setLoadingRequestId(null);
      setConfirmModal({ 
        open: false, 
        id: null, 
        status: '', 
        studentId: null, 
        examCode: null,
        requestId: null
      });
    }
  };

  useEffect(() => {
    let data = [...requests];
    const lowerSearch = searchTerm.toLowerCase();

    data = data.filter((req) => {
      const student = req.student || {};
      const name = student.name?.toLowerCase() || '';
      const email = student.email?.toLowerCase() || '';
      const mobileNumber = student.mobileNumber?.toLowerCase() || '';
      const examCode = req.examCode?.toLowerCase() || '';

      return name.includes(lowerSearch) || 
             email.includes(lowerSearch) || 
             mobileNumber.includes(lowerSearch) ||
             examCode.includes(lowerSearch);
    });

    if (statusFilter !== 'all') {
      data = data.filter((req) => req.status === statusFilter);
    }

    if (sortBy === 'status') {
      data.sort((a, b) => a.status.localeCompare(b.status));
    } else {
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    setFilteredRequests(data);
    setCurrentPage(1);
  }, [requests, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    denied: requests.filter(r => r.status === 'denied').length,
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Exam Access Requests</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage student exam access requests</p>
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
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
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
              <p className="text-xs sm:text-sm text-gray-500">Denied</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.denied}</p>
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
              placeholder="Search by name, email, mobile, or exam code..."
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
              <option value="denied">Denied</option>
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
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No exam requests found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {paginatedRequests.map((req) => {
              const student = req.student || {};
              const isLoading = loadingRequestId === req.id;
              const isApproved = req.status === 'approved';
              const isDenied = req.status === 'denied';
              const isPending = req.status === 'pending';

              return (
                <div
                  key={req.id}
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
                          : isDenied
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Exam Code</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <BookOpen size={14} />
                        {req.examCode || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Requested</p>
                      <p className="text-sm text-gray-600">
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t border-gray-200">
                      <button
                        onClick={() =>
                          setConfirmModal({
                            open: true,
                            id: req.id,
                            status: 'approved',
                            studentId: student.id,
                            examCode: req.examCode,
                            requestId: req.id,
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
                            id: req.id,
                            status: 'denied',
                            studentId: student.id,
                            examCode: req.examCode,
                            requestId: req.id,
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
                            <span>Deny</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
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
              Are you sure you want to <strong>{confirmModal.status}</strong> this exam access request?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ 
                  open: false, 
                  id: null, 
                  status: '', 
                  studentId: null, 
                  examCode: null,
                  requestId: null
                })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateStatus(
                    confirmModal.requestId,
                    confirmModal.status,
                    confirmModal.examCode,
                    confirmModal.studentId
                  )
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
    </div>
  );
}

