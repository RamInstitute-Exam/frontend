import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, BookOpen, FileText, AlertCircle, Flag, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../config/API';
import jsPDF from 'jspdf';

const QUESTIONS_PER_PAGE = 20;
const AUTO_SAVE_INTERVAL = 60000; // 60s

const ExamViewer = () => {
  const { examCode, batchName } = useParams();
  const navigate = useNavigate();
  const studentId = localStorage.getItem('userId');

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hr default
  const [submitted, setSubmitted] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [sidebarPage, setSidebarPage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [result, setResult] = useState(null);
  
  // ✅ Performance: Memoize fetchExam to prevent unnecessary re-creations
  const fetchExam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required parameters
      if (!examCode || !batchName) {
        throw new Error('Exam code or batch name is missing');
      }
      
      if (!studentId) {
        throw new Error('User not logged in. Please login again.');
      }

      const res = await API.get(
        `/Question/student/exam/${examCode}/${encodeURIComponent(batchName)}?studentId=${studentId}`
      );
      
      if (!res.data) {
        throw new Error('No exam data received');
      }
      
      setExam(res.data);
      console.log('📊 Exam data received:', res.data);
      console.log('📝 First question sample:', res.data?.questions?.[0]);
      console.log('📝 First question options:', res.data?.questions?.[0]?.options);
      console.log('📝 First question Tamil text:', res.data?.questions?.[0]?.questionTextTamil);
      
      // Convert duration from minutes to seconds
      const durationInSeconds = (res.data.examDuration || res.data.duration || 60) * 60;
      setTimeLeft(durationInSeconds);
    } catch (error) {
      console.error('Error fetching exam:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load exam. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [examCode, batchName, studentId]);

  // ✅ Performance: Memoize autoSave to prevent unnecessary re-creations
  const autoSave = useCallback(async () => {
    try {
      await API.post('/Exam/save-progress', {
        examCode,
        batchName,
        studentId,
        answers,
        marked,
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error toast for auto-save failures
    }
  }, [examCode, batchName, studentId, answers, marked]);

  // ✅ Performance: Memoize handlers to prevent unnecessary re-renders
  const handleOptionChange = useCallback((qNo, value) => {
    setAnswers((prev) => ({ ...prev, [qNo]: value }));
  }, []);

  const toggleMark = useCallback((qNo) => {
    setMarked((prev) => ({ ...prev, [qNo]: !prev[qNo] }));
  }, []);

  // ✅ Performance: Memoize handleSubmit - MUST be defined before useEffect that uses it
  const handleSubmit = useCallback(async () => {
    try {
      if (!exam || !exam.examId) {
        toast.error('Exam data not loaded. Please refresh the page.');
        return;
      }

      const res = await API.post('/Question/student/submit', {
        examCode,
        batchName,
        examId: exam.examId || exam.id,
        studentId,
        answers: answers,
        reviewedQuestions: reviewFilter,
      });
      setResult(res.data);
      setSubmitted(true);
      toast.success('Exam submitted successfully!');
      navigate(`/student/exam-review/${exam.examId}/${studentId}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.message || 'Failed to submit exam. Please try again.');
    }
  }, [exam, examCode, batchName, studentId, answers, reviewFilter, navigate]);

  useEffect(() => {
    if (examCode && batchName) {
      fetchExam();
    } else {
      setError('Missing exam code or batch name');
      setLoading(false);
    }
  }, [examCode, batchName, fetchExam]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleSubmit]);

  useEffect(() => {
    const interval = setInterval(autoSave, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [autoSave]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    exam.questions.forEach((q, i) => {
      doc.text(`${i + 1}. ${q.questionTextEnglish}`, 10, 10 + i * 10);
      doc.text(`Correct: ${q.correctAnswer}`, 10, 15 + i * 10);
      doc.text(`Your Ans: ${answers[q.questionNumber] || '-'}`, 10, 20 + i * 10);
    });
    doc.save(`${exam.examName}-review.pdf`);
  };

  // ✅ Performance: Memoize filtered questions to prevent unnecessary recalculations
  const filteredQuestions = useMemo(() => {
    if (!exam?.questions) return [];
    if (submitted && reviewFilter !== 'all') {
      return exam.questions.filter((q) => {
        const userAns = answers[q.questionNumber];
        if (reviewFilter === 'correct') return userAns === q.correctAnswer;
        if (reviewFilter === 'incorrect') return userAns && userAns !== q.correctAnswer;
        return true;
      });
    }
    return exam.questions;
  }, [exam?.questions, submitted, reviewFilter, answers]);

  // ✅ Performance: Memoize paginated numbers
  const paginatedNumbers = useMemo(() => {
    return (exam?.questions || []).slice(
      sidebarPage * QUESTIONS_PER_PAGE,
      (sidebarPage + 1) * QUESTIONS_PER_PAGE
    );
  }, [exam?.questions, sidebarPage]);

  // ✅ Performance: Memoize current question
  const currentQuestion = useMemo(() => {
    if (submitted) {
      return filteredQuestions[currentQIndex] || {};
    }
    return exam?.questions?.[currentQIndex] || {};
  }, [submitted, filteredQuestions, currentQIndex, exam?.questions]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load exam</h2>
            <p className="text-gray-600 mb-6">{error || 'Exam not found or unavailable.'}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  fetchExam();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/student')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Question Navigator */}
      <div
        className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${
          sidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Questions
            </h2>
            <button
              className="md:hidden p-1 hover:bg-gray-200 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-600">
            {Object.keys(answers).length} / {exam?.questions?.length || 0} answered
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-3">
            {paginatedNumbers.map((q, idx) => {
              const qNo = q.questionNumber;
              const answered = answers[qNo];
              const isMarked = marked[qNo];
              const isCurrent = currentQIndex === qNo - 1;
              
              let bg = 'bg-gray-200 text-gray-800 border-2 border-gray-300';
              let shadow = 'shadow-sm';
              if (isCurrent) {
                bg = 'bg-blue-600 text-white ring-4 ring-blue-300 border-2 border-blue-700';
                shadow = 'shadow-lg shadow-blue-200';
              } else if (answered && isMarked) {
                bg = 'bg-purple-500 text-white border-2 border-purple-600';
                shadow = 'shadow-md';
              } else if (answered) {
                bg = 'bg-green-500 text-white border-2 border-green-600';
                shadow = 'shadow-md';
              } else if (isMarked) {
                bg = 'bg-yellow-400 text-gray-900 border-2 border-yellow-500';
                shadow = 'shadow-md';
              }

              return (
                <button
                  key={idx}
                  className={`p-4 rounded-xl font-bold text-base transition-all hover:scale-110 hover:shadow-lg ${bg} ${shadow}`}
                  onClick={() => {
                    setCurrentQIndex(qNo - 1);
                    setSidebarOpen(false);
                  }}
                >
                  {qNo}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between gap-2 mb-3">
            <button
              disabled={sidebarPage === 0}
              onClick={() => setSidebarPage((p) => p - 1)}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              disabled={(sidebarPage + 1) * QUESTIONS_PER_PAGE >= (exam?.questions?.length || 0)}
              onClick={() => setSidebarPage((p) => p + 1)}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Marked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Answered & Marked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <BookOpen className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{exam?.examName || 'Exam'}</h2>
                <p className="text-sm text-gray-500">
                  Question {currentQIndex + 1} of {exam?.questions?.length || 0}
                </p>
              </div>
            </div>
            {!submitted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-bold text-lg">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {submitted ? (
            <>
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    reviewFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    reviewFilter === 'correct' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Correct
                </button>
                <button
                  onClick={() => setReviewFilter('incorrect')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    reviewFilter === 'incorrect' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Incorrect
                </button>
                <button
                  onClick={exportPDF}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Export PDF
                </button>
              </div>
              {result && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Score: {result?.score || 0} / {exam.questions.length}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Correct</p>
                      <p className="text-2xl font-bold text-green-600">{result?.correctCount || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Incorrect</p>
                      <p className="text-2xl font-bold text-red-600">{result?.incorrectCount || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Attempted</p>
                      <p className="text-2xl font-bold text-blue-600">{Object.keys(answers).length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Unanswered</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {(exam.questions.length || 0) - Object.keys(answers).length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={handleSubmit}
              className="mb-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Submit Exam
            </button>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 p-8 mb-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                  Q{currentQuestion.questionNumber}
                </span>
                {marked[currentQuestion.questionNumber] && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    Marked for Review
                  </span>
                )}
              </div>
              <div className="mb-6">
                <p className="text-xl font-medium text-gray-900 leading-relaxed mb-3 tracking-wide">
                  {currentQuestion.questionTextEnglish || currentQuestion.questionText || 'No question text available'}
                </p>
                {currentQuestion.questionTextTamil && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p 
                      className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap" 
                      style={{ 
                        fontFamily: '"Noto Sans Tamil", "Arial Unicode MS", Tahoma, sans-serif',
                        fontSize: '18px',
                        lineHeight: '1.8',
                        wordBreak: 'break-word',
                        letterSpacing: '0.3px'
                      }}
                    >
                      {String(currentQuestion.questionTextTamil)}
                    </p>
                  </div>
                )}
              </div>
              
              {currentQuestion.imageUrl && (
                <div className="mb-6 border-2 border-gray-300 rounded-xl p-4 bg-gray-50 shadow-sm">
                  <img
                    src={currentQuestion.imageUrl}
                    alt={`Question ${currentQuestion.questionNumber}`}
                    className="max-w-full h-auto rounded-lg mx-auto"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Image failed to load:', currentQuestion.imageUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Sub-Options (i, ii, iii, iv) - Display before main options */}
            {currentQuestion.subOptions && Object.values(currentQuestion.subOptions).some(v => v && v.trim()) && (
              <div className="mb-6 bg-blue-50 rounded-xl border-2 border-blue-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">Sub-Options</span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(currentQuestion.subOptions)
                    .filter(([_, val]) => val && val.trim())
                    .map(([key, val]) => (
                      <div
                        key={key}
                        className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-bold text-blue-700 text-lg min-w-[40px]">
                            ({key.toUpperCase()})
                          </span>
                          <span
                            className="flex-1 text-gray-800 whitespace-pre-wrap"
                            style={{
                              fontFamily: '"Noto Sans Tamil", "Arial Unicode MS", Tahoma, sans-serif',
                              fontSize: '16px',
                              lineHeight: '1.7',
                              wordBreak: 'break-word',
                              letterSpacing: '0.2px'
                            }}
                          >
                            {String(val || '')}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-4">
              {(() => {
                // Handle both formats: options object or optionA/optionB/optionC/optionD fields
                const options = currentQuestion.options || {
                  A: currentQuestion.optionA || '',
                  B: currentQuestion.optionB || '',
                  C: currentQuestion.optionC || '',
                  D: currentQuestion.optionD || ''
                };
                
                return Object.entries(options).map(([key, val], i) => {
                  const isSelected = answers[currentQuestion.questionNumber] === key;
                  const isCorrect = submitted && (currentQuestion.correctAnswer === key || currentQuestion.correctOption === key);
                  const isWrong = submitted && isSelected && (currentQuestion.correctAnswer !== key && currentQuestion.correctOption !== key);

                  return (
                    <label
                      key={i}
                      className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                        isSelected
                          ? isCorrect
                            ? 'bg-green-50 border-green-500 shadow-green-100'
                            : isWrong
                            ? 'bg-red-50 border-red-500 shadow-red-100'
                            : 'bg-blue-50 border-blue-500 shadow-blue-100'
                          : submitted && isCorrect
                          ? 'bg-green-50 border-green-300 shadow-green-50'
                          : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      } ${submitted ? 'cursor-default' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q${currentQuestion.questionNumber}`}
                        value={key}
                        disabled={submitted}
                        checked={isSelected}
                        onChange={() => handleOptionChange(currentQuestion.questionNumber, key)}
                        className="mt-1 w-6 h-6 text-blue-600 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-lg text-gray-900 mr-2">{key}.</span>
                        <span 
                          className={`${isSelected || (submitted && isCorrect) ? 'font-semibold' : 'font-normal'} text-gray-900 whitespace-pre-wrap`}
                          style={{ 
                            fontFamily: '"Noto Sans Tamil", "Arial Unicode MS", Tahoma, sans-serif',
                            fontSize: '17px',
                            lineHeight: '1.7',
                            wordBreak: 'break-word',
                            letterSpacing: '0.2px'
                          }}
                        >
                          {String(val || 'N/A')}
                        </span>
                        {submitted && isCorrect && (
                          <span className="ml-3 text-green-700 font-bold flex items-center gap-1 text-base">
                            <CheckCircle className="w-5 h-5" />
                            Correct Answer
                          </span>
                        )}
                        {submitted && isWrong && (
                          <span className="ml-3 text-red-700 font-bold flex items-center gap-1 text-base">
                            <XCircle className="w-5 h-5" />
                            Your Answer (Incorrect)
                          </span>
                        )}
                      </div>
                    </label>
                  );
                });
              })()}
            </div>

            {/* Mark for Review Button */}
            {!submitted && (
              <button
                onClick={() => toggleMark(currentQuestion.questionNumber)}
                className={`mt-4 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                  marked[currentQuestion.questionNumber]
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                <Flag className="w-4 h-4" />
                {marked[currentQuestion.questionNumber] ? 'Unmark for Review' : 'Mark for Review'}
              </button>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((i) => i - 1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <span className="text-sm text-gray-600 font-medium">
              {currentQIndex + 1} / {filteredQuestions.length}
            </span>
            <button
              disabled={currentQIndex === (filteredQuestions.length - 1)}
              onClick={() => setCurrentQIndex((i) => i + 1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamViewer;