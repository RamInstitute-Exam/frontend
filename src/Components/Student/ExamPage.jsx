import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOpen, Clock, FileText, ArrowLeft, Play, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../config/API";

const Examlist = () => {
  const { batchName } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const decodedBatchName = decodeURIComponent(batchName);
        const res = await API.get(`/batch/exams/${encodeURIComponent(decodedBatchName)}`);
        setExams(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load exams:", err);
        const errorMessage = err.response?.data?.message || "Failed to load exams for this batch";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (batchName) {
      fetchExams();
    }
  }, [batchName]);

  const handleStartExam = (examCode) => {
    navigate(`/student/exam/${examCode}/${encodeURIComponent(batchName)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/student/batches')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Exams in {decodeURIComponent(batchName)}</h1>
                <p className="text-sm text-gray-500 mt-1">Select an exam to start</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-900">{exams.length}</span> exams
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {exams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No exams available for this batch</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for new exams</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id || exam._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Exam Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
                      {exam.examName || exam.exam_code || 'Untitled Exam'}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-3">Code: {exam.examCode || exam.exam_code}</p>
                </div>

                {/* Exam Details */}
                <div className="space-y-3 mb-4 flex-1">
                  {exam.category && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        <span className="font-medium">Category:</span> {exam.category}
                      </span>
                    </div>
                  )}
                  {exam.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        <span className="font-medium">Duration:</span> {exam.duration} minutes
                      </span>
                    </div>
                  )}
                  {exam.year && exam.month && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        <span className="font-medium">Year/Month:</span> {exam.year} / {exam.month}
                      </span>
                    </div>
                  )}
                  {exam.examDescription && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 line-clamp-2">{exam.examDescription}</p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleStartExam(exam.examCode || exam.exam_code)}
                  className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Exam
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Examlist;
