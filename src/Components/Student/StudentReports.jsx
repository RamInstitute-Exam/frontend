import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, TrendingUp, Calendar, Clock, Award, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../config/API';

export const StudentReports = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem('userId');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!studentId) {
        setError('Student ID not found. Please login again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await API.get(`/Question/student/all-reports/${studentId}`);
        setReports(Array.isArray(res.data) ? res.data : []);
        console.log('Exam reports:', res.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Failed to load exam reports. Please try again.');
        toast.error('Failed to load exam reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate('/student')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Exam Reports Found</h2>
            <p className="text-gray-600 mb-6">You haven't completed any exams yet.</p>
            <button
              onClick={() => navigate('/student/batches')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Available Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalExams = reports.length;
  const avgScore = reports.reduce((sum, r) => sum + (r.result || 0), 0) / totalExams;
  const totalCorrect = reports.reduce((sum, r) => sum + (r.correctAnswers || 0), 0);
  const totalQuestions = reports.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Exam History</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">View all your completed exam reports and results</p>
            </div>
            <div className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-900">{totalExams}</span> exams
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-xs font-medium text-gray-600 uppercase">Total Exams</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalExams}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="text-xs font-medium text-gray-600 uppercase">Avg Score</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{Math.round(avgScore)}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="text-xs font-medium text-gray-600 uppercase">Total Correct</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalCorrect}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span className="text-xs font-medium text-gray-600 uppercase">Accuracy</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reports.map((report) => {
            const exam = report.exam || {};
            const percentage = report.totalQuestions > 0 
              ? Math.round((report.correctAnswers / report.totalQuestions) * 100) 
              : 0;
            const isPassed = percentage >= 50;

            return (
              <Link
                key={report.id}
                to={`/student/exam-review/${report.examId}/${studentId}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all hover:border-blue-300"
              >
                {/* Exam Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                      {exam.examName || 'Untitled Exam'}
                    </h3>
                    {isPassed && (
                      <Award className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-1">Code: {exam.examCode || report.examCode}</p>
                  {exam.category && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {exam.category}
                    </span>
                  )}
                </div>

                {/* Score Display */}
                <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Score</p>
                      <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Result</p>
                      <p className={`text-lg font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {isPassed ? 'Passed' : 'Failed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Correct</span>
                    </div>
                    <span className="font-semibold text-gray-900">{report.correctAnswers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-gray-700">Wrong</span>
                    </div>
                    <span className="font-semibold text-gray-900">{report.wrongAnswers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Total Questions</span>
                    </div>
                    <span className="font-semibold text-gray-900">{report.totalQuestions || 0}</span>
                  </div>
                  {report.durationInMinutes && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Duration</span>
                      </div>
                      <span className="font-semibold text-gray-900">{Math.round(report.durationInMinutes)} mins</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {report.endTime 
                        ? new Date(report.endTime).toLocaleDateString() 
                        : report.createdAt 
                        ? new Date(report.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2 font-medium">Click to view details →</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
