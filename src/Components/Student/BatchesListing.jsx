import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, Loader2, FileText, Calendar, Users, ChevronRight, Search, Filter, Grid, List, TrendingUp, Award } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../config/API";
import { batchAccessAPI } from "../../services/apiService";

const StudentBatchList = () => {
  const [batches, setBatches] = useState([]); // all batches from server
  const [accessList, setAccessList] = useState([]); // access requests for this student
  const [loading, setLoading] = useState(true);
  const [requestingBatch, setRequestingBatch] = useState(null); // batchName being requested
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending', 'none'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();
  const studentId = localStorage.getItem('userId');


  


  useEffect(() => {
    if (!studentId) {
      setError("Student ID not found. Please login again.");
      setLoading(false);
      return;
    }

    // Fetch all batches
    const fetchBatches = async () => {
      try {
        const batchesRes = await API.get("/Batch/get-batches");
        setBatches(Array.isArray(batchesRes.data) ? batchesRes.data : []);
      } catch (err) {
        console.error("Failed to load batches:", err);
        setError("Failed to load batches. Please try again later.");
        toast.error("Failed to load batches");
      }
    };

    // Fetch this student's batch access list
    const fetchAccessList = async () => {
      try {
        const accessRes = await batchAccessAPI.getAccessList(studentId);
        setAccessList(Array.isArray(accessRes) ? accessRes : []);
      } catch (err) {
        console.error("Failed to load access list:", err);
        // Don't show error toast for this, just log it
        setAccessList([]);
      }
    };

    Promise.all([fetchBatches(), fetchAccessList()]).finally(() => setLoading(false));
  }, [studentId]);

  const handleRequestAccess = async (batchName) => {
    setRequestingBatch(batchName);
    setError(null);
    try {
      console.log('Requesting access for batch:', batchName, 'studentId:', studentId);
      const response = await batchAccessAPI.requestAccess(studentId, batchName);
      console.log('Request access response:', response);
      toast.success("Access request submitted successfully!");
      // Refresh access list after request
      const accessRes = await batchAccessAPI.getAccessList(studentId);
      setAccessList(Array.isArray(accessRes) ? accessRes : []);
    } catch (err) {
      console.error('Request access error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to send access request";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setRequestingBatch(null);
    }
  };

  const getBatchAccessStatus = (batchName) => {
    const access = accessList.find((a) => a.batchName === batchName);
    return access ? access.status : null;
  };

  // Filter and search batches
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesSearch = batch.batchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const status = getBatchAccessStatus(batch.batchName);
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'approved' && status === 'approved') ||
        (statusFilter === 'pending' && status === 'pending') ||
        (statusFilter === 'none' && !status);
      
      return matchesSearch && matchesStatus;
    });
  }, [batches, searchTerm, statusFilter, accessList]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    const approved = batches.filter(b => getBatchAccessStatus(b.batchName) === 'approved').length;
    const pending = batches.filter(b => getBatchAccessStatus(b.batchName) === 'pending').length;
    const totalExams = batches.reduce((sum, b) => sum + (b.exams?.length || 0), 0);
    const totalQuestions = batches.reduce((sum, batch) => {
      return sum + (batch.exams?.reduce((examSum, exam) => {
        const civilCount = exam.civilQuestions?.length || 0;
        const gkCount = exam.generalKnowledgeQuestions?.length || 0;
        return examSum + civilCount + gkCount;
      }, 0) || 0);
    }, 0);
    
    return { approved, pending, totalExams, totalQuestions };
  }, [batches, accessList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading batches and access status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Batch Access</h1>
                <p className="text-blue-100 text-xs sm:text-sm">Request access to batches and view available exams</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-right">
                <p className="text-blue-200 text-xs sm:text-sm">Total Batches</p>
                <p className="text-2xl sm:text-3xl font-bold">{batches.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Exams</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalExams}</p>
              </div>
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Questions</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalQuestions}</p>
              </div>
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="none">Not Requested</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 sm:p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {filteredBatches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              {searchTerm || statusFilter !== 'all' ? 'No batches found' : 'No batches available'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Check back later for new batches'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
            : 'space-y-6'
          }>
            {filteredBatches.map((batch) => {
              const status = getBatchAccessStatus(batch.batchName);
              const isApproved = status === "approved";
              const isPending = status === "pending";
              const isDeclined = status === "declined";
              const isLoading = requestingBatch === batch.batchName;
              const examCount = batch.exams?.length || 0;
              const totalQuestions = batch.exams?.reduce((sum, exam) => {
                const civilCount = exam.civilQuestions?.length || 0;
                const gkCount = exam.generalKnowledgeQuestions?.length || 0;
                return sum + civilCount + gkCount;
              }, 0) || 0;

              return (
                <div
                  key={batch.id || batch._id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${
                    isApproved ? 'ring-2 ring-green-200' : ''
                  }`}
                >
                  {/* Status Badge Header */}
                  <div className={`h-2 ${
                    isApproved ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    isPending ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    isDeclined ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                    'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`} />
                  
                  <div className="p-4 sm:p-6">
                    {/* Batch Header */}
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{batch.batchName}</h2>
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                              <CheckCircle className="w-4 h-4" />
                              Approved
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                              <Clock className="w-4 h-4" />
                              Pending
                            </span>
                          )}
                          {isDeclined && (
                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-100 to-pink-100 text-red-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                              <XCircle className="w-4 h-4" />
                              Declined
                            </span>
                          )}
                          {!status && (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold">
                              Not Requested
                            </span>
                          )}
                        </div>
                        {batch.description && (
                          <p className="text-sm text-gray-600 leading-relaxed">{batch.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Batch Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Exams</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{examCount}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                          <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Questions</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Status</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 capitalize">
                          {status === 'pending' ? 'Requested' : status || 'Not Requested'}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-orange-600" />
                          <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Created</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Exams List */}
                    {examCount > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Exams in this Batch
                          <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {examCount}
                          </span>
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                          {batch.exams.slice(0, 5).map((exam, idx) => {
                            const questionCount = (exam.civilQuestions?.length || 0) + (exam.generalKnowledgeQuestions?.length || 0);
                            return (
                              <div
                                key={exam.id || idx}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                                  isApproved 
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 hover:shadow-md cursor-pointer' 
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                                onClick={isApproved ? () => navigate(`/student/batches/${encodeURIComponent(batch.batchName)}/exams`) : undefined}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-gray-900">{exam.examName || exam.examCode}</span>
                                    {exam.examCode && exam.examName && (
                                      <span className="text-xs text-gray-500 font-mono bg-gray-200 px-2 py-0.5 rounded">
                                        {exam.examCode}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs flex-wrap">
                                    {exam.category && (
                                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                                        {exam.category}
                                      </span>
                                    )}
                                    {exam.duration && (
                                      <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                                        <Clock className="w-3.5 h-3.5" />
                                        {exam.duration} mins
                                      </span>
                                    )}
                                    {questionCount > 0 && (
                                      <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                                        <FileText className="w-3.5 h-3.5" />
                                        {questionCount} questions
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isApproved && (
                                  <ChevronRight className="w-6 h-6 text-blue-600 flex-shrink-0 ml-4" />
                                )}
                              </div>
                            );
                          })}
                          {examCount > 5 && (
                            <div className="text-center pt-2">
                              <span className="text-sm text-gray-500 font-medium">
                                +{examCount - 5} more exams
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-6 border-t-2 border-gray-100">
                      {isApproved ? (
                        <button
                          onClick={() => navigate(`/student/batches/${encodeURIComponent(batch.batchName)}/exams`)}
                          className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <BookOpen className="w-5 h-5" />
                          View All Exams
                        </button>
                      ) : isPending ? (
                        <div className="flex-1 px-6 py-3.5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl text-center">
                          <div className="flex items-center justify-center gap-2 text-yellow-800">
                            <Clock className="w-5 h-5 animate-pulse" />
                            <span className="font-bold">Request Pending - Waiting for Approval</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          disabled={isLoading || isPending}
                          onClick={() => handleRequestAccess(batch.batchName)}
                          className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Requesting...
                            </>
                          ) : (
                            <>
                              <Users className="w-5 h-5" />
                              {isDeclined ? "Request Again" : "Request Access"}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBatchList;
