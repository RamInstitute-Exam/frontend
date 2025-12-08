import React, { useState, useEffect } from "react";
import { BookOpen, Search, Download, Plus, Edit, Trash, Eye, Filter, X, CheckCircle, XCircle } from "lucide-react";
import { batchAPI, examPublishAPI } from "../../services/apiService";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AdminExamsList = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingExam, setDeletingExam] = useState(null);
  const [publishingExam, setPublishingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        // ✅ Fetch all exams directly (including drafts for admin view)
        const examsResponse = await batchAPI.getAllExams(true);
        console.log("Exams response:", examsResponse);
        
        // ✅ Group exams by batch
        const exams = Array.isArray(examsResponse) ? examsResponse : [];
        const batchMap = {};
        
        exams.forEach(exam => {
          const batchName = exam.batch?.batchName || 'Unassigned';
          if (!batchMap[batchName]) {
            batchMap[batchName] = {
              id: exam.batch?.id || `batch-${batchName}`,
              batchName: batchName,
              name: batchName,
              exams: []
            };
          }
          batchMap[batchName].exams.push({
            id: exam.id,
            examCode: exam.examCode,
            examName: exam.examName,
            examDescription: exam.examDescription,
            category: exam.category,
            duration: exam.duration,
            status: exam.status,
            year: exam.year,
            month: exam.month,
            createdAt: exam.createdAt
          });
        });
        
        const batchesArray = Object.values(batchMap);
        setBatches(batchesArray);
        console.log(`✅ Loaded ${exams.length} exams in ${batchesArray.length} batches`);
      } catch (error) {
        console.error("Error fetching exams", error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to load exams");
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const exportToExcel = () => {
    const allExams = batches.flatMap((batch) =>
      (batch.exams || []).map((exam) => ({
        Batch: batch.batchName || batch.name,
        Code: exam.examCode,
        Name: exam.examName,
        Category: exam.category,
        Duration: exam.duration,
      }))
    );

    if (allExams.length === 0) {
      toast.error("No exams to export");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(allExams);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exams");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `ExamsList_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Exams exported successfully");
  };

  const handleDelete = async (examCode) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this exam?");
    if (!confirmDelete) return;

    try {
      setDeletingExam(examCode);
      await batchAPI.deleteExam(examCode);
      toast.success("Exam deleted successfully");
      setBatches((prev) =>
        prev.map((batch) => ({
          ...batch,
          exams: (batch.exams || []).filter((exam) => exam.examCode !== examCode),
        }))
      );
    } catch (error) {
      console.error("Error deleting exam", error);
      toast.error("Failed to delete exam");
    } finally {
      setDeletingExam(null);
    }
  };

  const handlePublish = async (examCode, batchName, currentStatus) => {
    try {
      setPublishingExam(examCode);
      if (currentStatus === 'draft') {
        await examPublishAPI.publishExam(examCode, batchName);
        toast.success("Exam published successfully! Students can now access it.");
      } else {
        await examPublishAPI.unpublishExam(examCode, batchName);
        toast.success("Exam unpublished. Students can no longer access it.");
      }
      
      // Update the exam status in state
      setBatches((prev) =>
        prev.map((batch) => ({
          ...batch,
          exams: (batch.exams || []).map((exam) =>
            exam.examCode === examCode
              ? { ...exam, status: currentStatus === 'draft' ? 'active' : 'draft' }
              : exam
          ),
        }))
      );
    } catch (error) {
      console.error("Error publishing/unpublishing exam", error);
      toast.error(error?.response?.data?.message || "Failed to update exam status");
    } finally {
      setPublishingExam(null);
    }
  };

  const filteredBatches = batches.filter((batch) => {
    if (filterBatch !== "all" && batch.batchName !== filterBatch) return false;
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      batch.batchName?.toLowerCase().includes(searchLower) ||
      (batch.exams || []).some(
        (exam) =>
          exam.examName?.toLowerCase().includes(searchLower) ||
          exam.examCode?.toLowerCase().includes(searchLower) ||
          exam.category?.toLowerCase().includes(searchLower)
      )
    );
  });

  const totalExams = batches.reduce((sum, batch) => sum + (batch.exams?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <span>Exams Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage all exams organized by batches
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={exportToExcel}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>Export Excel</span>
            </button>
            <button 
              onClick={() => navigate('/admin/pdf-upload')}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>Add Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Total Batches</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{batches.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Total Exams</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{totalExams}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Avg Exams/Batch</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">
            {batches.length > 0 ? (totalExams / batches.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search exams by name, code, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="w-full sm:w-auto pl-9 sm:pl-10 pr-8 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
            >
              <option value="all">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.id || batch._id} value={batch.batchName || batch.name}>
                  {batch.batchName || batch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading exams...</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No exams found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBatches.map((batch) => {
            const batchExams = (batch.exams || []).filter((exam) => {
              if (!searchTerm) return true;
              const searchLower = searchTerm.toLowerCase();
              return (
                exam.examName?.toLowerCase().includes(searchLower) ||
                exam.examCode?.toLowerCase().includes(searchLower) ||
                exam.category?.toLowerCase().includes(searchLower)
              );
            });

            if (batchExams.length === 0) return null;

            return (
              <div key={batch.id || batch._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <BookOpen size={20} />
                    {batch.batchName || batch.name}
                    <span className="ml-auto text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                      {batchExams.length} {batchExams.length === 1 ? 'exam' : 'exams'}
                    </span>
                  </h2>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batchExams.map((exam) => (
                        <tr key={exam.id || exam._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              {exam.category || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{exam.examCode || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{exam.examName || 'N/A'}</div>
                            {exam.examDescription && (
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                {exam.examDescription}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">{exam.duration || 0} mins</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              exam.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : exam.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {exam.status || 'draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handlePublish(exam.examCode, batch.batchName || batch.name, exam.status || 'draft')}
                                disabled={publishingExam === exam.examCode}
                                className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                                  exam.status === 'draft' || !exam.status
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg'
                                    : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-md hover:shadow-lg'
                                } ${publishingExam === exam.examCode ? "opacity-50 cursor-wait" : ""}`}
                                title={exam.status === 'draft' || !exam.status ? "Click to Publish Exam - Make it visible to students" : "Click to Unpublish Exam - Hide from students"}
                              >
                                {publishingExam === exam.examCode ? (
                                  <span className="flex items-center gap-1">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs">...</span>
                                  </span>
                                ) : exam.status === 'draft' || !exam.status ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle size={16} />
                                    <span>Publish</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <XCircle size={16} />
                                    <span>Unpublish</span>
                                  </span>
                                )}
                              </button>
                              <Link
                                to={`/admin/exams/edit/${batch.batchName || batch.name}/${exam.examCode}`}
                                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </Link>
                              <button
                                onClick={() => handleDelete(exam.examCode)}
                                disabled={deletingExam === exam.examCode}
                                className={`p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors ${
                                  deletingExam === exam.examCode ? "opacity-50 cursor-wait" : ""
                                }`}
                                title="Delete"
                              >
                                <Trash size={18} />
                              </button>
                              <Link
                                to={`/admin/exams/preview/${encodeURIComponent(batch.batchName || batch.name)}/${exam.examCode}`}
                                className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Preview Questions"
                              >
                                <Eye size={18} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {batchExams.map((exam) => (
                    <div key={exam.id || exam._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">{exam.examName || 'N/A'}</h3>
                          <p className="text-xs text-gray-500 mt-1">Code: {exam.examCode || 'N/A'}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          {exam.category || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-500">Duration: {exam.duration || 0} mins</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full w-fit ${
                            exam.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : exam.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {exam.status || 'draft'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePublish(exam.examCode, batch.batchName || batch.name, exam.status || 'draft')}
                            disabled={publishingExam === exam.examCode}
                            className={`px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-xs ${
                              exam.status === 'draft' || !exam.status
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg'
                                : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-md hover:shadow-lg'
                            } ${publishingExam === exam.examCode ? "opacity-50 cursor-wait" : ""}`}
                            title={exam.status === 'draft' || !exam.status ? "Click to Publish Exam" : "Click to Unpublish Exam"}
                          >
                            {publishingExam === exam.examCode ? (
                              <span className="flex items-center gap-1">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </span>
                            ) : exam.status === 'draft' || !exam.status ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle size={14} />
                                <span>Publish</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <XCircle size={14} />
                                <span>Unpublish</span>
                              </span>
                            )}
                          </button>
                          <Link
                            to={`/admin/exams/edit/${batch.batchName || batch.name}/${exam.examCode}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(exam.examCode)}
                            disabled={deletingExam === exam.examCode}
                            className={`p-2 text-red-600 hover:bg-red-50 rounded-lg ${
                              deletingExam === exam.examCode ? "opacity-50" : ""
                            }`}
                          >
                            <Trash size={16} />
                          </button>
                          <Link
                            to={`/admin/exams/preview/${encodeURIComponent(batch.batchName || batch.name)}/${exam.examCode}`}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AdminExamsList;
