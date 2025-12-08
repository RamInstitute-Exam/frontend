import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../config/API';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#9ca3af'];

export const ExamReview = () => {
  const { examId, studentId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all');
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  useEffect(() => {
    const fetchReport = async () => {
      if (!examId || !studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await API.get(
          `/Question/student/exam-report/${examId}/${studentId}`
        );

        setReport(res.data);
        console.log('📄 Exam Report:', res.data);
      } catch (err) {
        console.error('❌ Failed to load exam report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [examId, studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam review...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Report not found</p>
          <Link
            to="/student"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const answers = report.answerDetails || [];
  const examName = report.examInfo?.examName || report.examId?.examName || 'Exam Review';
  
  // Separate correct and wrong answers
  const correctAnswers = answers.filter((ans) => {
    const question = ans.questionData;
    if (!question) return false;
    return ans.selectedOption === question.correctOption;
  });

  const wrongAnswers = answers.filter((ans) => {
    const question = ans.questionData;
    if (!question) return false;
    return ans.selectedOption && ans.selectedOption !== question.correctOption;
  });

  const unansweredQuestions = answers.filter((ans) => !ans.selectedOption);

  const filteredAnswers =
    viewMode === 'correct'
      ? correctAnswers
      : viewMode === 'wrong'
      ? wrongAnswers
      : viewMode === 'unanswered'
      ? unansweredQuestions
      : answers;

  const chartData = [
    { name: 'Correct', value: report.correctAnswers || 0 },
    { name: 'Wrong', value: report.wrongAnswers || 0 },
    { name: 'Unanswered', value: report.unansweredQuestions || 0 },
  ];

  const toggleQuestion = (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getQuestionStatus = (answer) => {
    const question = answer.questionData;
    if (!question) return 'unknown';
    if (!answer.selectedOption) return 'unanswered';
    if (answer.selectedOption === question.correctOption) return 'correct';
    return 'wrong';
  };

  const getStatusBadge = (status) => {
    const badges = {
      correct: (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          ✓ Correct
        </span>
      ),
      wrong: (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
          ✗ Wrong
        </span>
      ),
      unanswered: (
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
          ○ Unanswered
        </span>
      ),
    };
    return badges[status] || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{examName} - Review</h1>
              <p className="text-sm text-gray-600 mt-1">
                Exam Code: {report.examInfo?.examCode || report.examCode || 'N/A'}
              </p>
            </div>
            <Link
              to="/student"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {report.totalQuestions || 0}
                </p>
              </div>
              <div className="text-blue-500 text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {report.correctAnswers || 0}
                </p>
              </div>
              <div className="text-green-500 text-4xl">✓</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wrong Answers</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {report.wrongAnswers || 0}
                </p>
              </div>
              <div className="text-red-500 text-4xl">✗</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {report.totalQuestions
                    ? Math.round(((report.correctAnswers || 0) / report.totalQuestions) * 100)
                    : 0}%
                </p>
              </div>
              <div className="text-purple-500 text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setViewMode('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Questions ({answers.length})
            </button>
            <button
              onClick={() => setViewMode('correct')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'correct'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Correct ({correctAnswers.length})
            </button>
            <button
              onClick={() => setViewMode('wrong')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'wrong'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Wrong ({wrongAnswers.length})
            </button>
            <button
              onClick={() => setViewMode('unanswered')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'unanswered'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unanswered ({unansweredQuestions.length})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredAnswers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">No questions found for this filter.</p>
            </div>
          ) : (
            filteredAnswers.map((answer, index) => {
              const question = answer.questionData;
              if (!question) return null;

              const status = getQuestionStatus(answer);
              const isExpanded = expandedQuestions.has(question.id);
              const isCorrect = status === 'correct';
              const isWrong = status === 'wrong';

              return (
                <div
                  key={answer.id || index}
                  className={`bg-white rounded-lg shadow-lg border-2 transition-all ${
                    isCorrect
                      ? 'border-green-300 bg-green-50'
                      : isWrong
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {/* Question Header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            Q{question.questionNumber}
                          </span>
                          {getStatusBadge(status)}
                        </div>
                        <p className="text-gray-900 font-medium text-lg mb-2">
                          {question.questionTextEnglish}
                        </p>
                        {question.questionTextTamil && (
                          <p className="text-gray-600 text-sm mb-3">
                            {question.questionTextTamil}
                          </p>
                        )}
                      </div>
                      <button className="ml-4 text-gray-500 hover:text-gray-700">
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-200 pt-4">
                      {/* Question Image */}
                      {question.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={question.imageUrl}
                            alt={`Question ${question.questionNumber}`}
                            className="max-w-full h-auto rounded-lg border border-gray-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Options:</h4>
                        {Object.entries(question.options || {}).map(([key, value]) => {
                          const isCorrectOption = key === question.correctOption;
                          const isSelectedOption = key === answer.selectedOption;
                          const showAsWrong = isWrong && isSelectedOption && !isCorrectOption;

                          return (
                            <div
                              key={key}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                isCorrectOption
                                  ? 'bg-green-100 border-green-400 text-green-900'
                                  : showAsWrong
                                  ? 'bg-red-100 border-red-400 text-red-900'
                                  : 'bg-white border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`font-bold text-lg ${
                                    isCorrectOption
                                      ? 'text-green-700'
                                      : showAsWrong
                                      ? 'text-red-700'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {key})
                                </span>
                                <span className="flex-1">{value}</span>
                                {isCorrectOption && (
                                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                                    Correct Answer
                                  </span>
                                )}
                                {showAsWrong && (
                                  <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Sub-options (for GK questions) */}
                      {question.subOptions &&
                        Object.keys(question.subOptions).length > 0 && (
                          <div className="space-y-2 mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Sub-options:</h4>
                            {Object.entries(question.subOptions).map(([key, value]) => (
                              <div
                                key={key}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-300"
                              >
                                <span className="font-semibold text-gray-700">{key})</span>{' '}
                                <span className="text-gray-700">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Answer Summary */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Your Answer:</p>
                            <p className="font-semibold text-gray-900">
                              {answer.selectedOption
                                ? `${answer.selectedOption}) ${question.options?.[answer.selectedOption] || 'N/A'}`
                                : 'Not Attempted'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Correct Answer:</p>
                            <p className="font-semibold text-green-700">
                              {question.correctOption
                                ? `${question.correctOption}) ${question.options?.[question.correctOption] || 'N/A'}`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h4 className="font-semibold text-gray-900 mb-2">Explanation:</h4>
                          <p className="text-gray-700">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 mb-6 text-center">
          <Link
            to={`/student/reports/${studentId}`}
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            View All Exam Reports
          </Link>
        </div>
      </div>
    </div>
  );
};
