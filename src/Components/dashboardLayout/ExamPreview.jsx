import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, FileText, Clock, Calendar, Edit, Globe, EyeOff } from 'lucide-react';
import API from '../../config/API';
import { toast } from 'react-toastify';
import { examPublishAPI } from '../../services/apiService';

export default function ExamPreview() {
  const { batchName, examCode } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true); // Admin can see answers
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchExamDetails();
  }, [batchName, examCode]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      // Fetch exam with all questions directly from Batch API
      const response = await API.get(`/Batch/${encodeURIComponent(batchName)}/exams/${examCode}`);
      const data = response.data;
      
      if (data) {
        setExam(data);
        
        // Combine civil and GK questions
        const civilQuestions = data.civilQuestions || [];
        const gkQuestions = data.generalKnowledgeQuestions || [];
        
        // Sort by question number
        const allQuestions = [
          ...civilQuestions.map(q => ({ ...q, questionSource: 'civil' })),
          ...gkQuestions.map(q => ({ ...q, questionSource: 'gk' }))
        ].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
        
        setQuestions(allQuestions);
      } else {
        toast.error('Exam not found');
        navigate('/admin/Exams');
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      toast.error('Failed to load exam details');
      navigate('/admin/Exams');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      setPublishing(true);
      const currentStatus = exam.status || 'draft';
      
      if (currentStatus === 'draft') {
        await examPublishAPI.publishExam(examCode, batchName);
        toast.success('Exam published successfully! Students can now access it.');
        setExam({ ...exam, status: 'active' });
      } else {
        await examPublishAPI.unpublishExam(examCode, batchName);
        toast.success('Exam unpublished. Students can no longer access it.');
        setExam({ ...exam, status: 'draft' });
      }
    } catch (error) {
      console.error('Error publishing/unpublishing exam:', error);
      toast.error(error?.response?.data?.message || 'Failed to update exam status');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam preview...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Exam not found</p>
          <button
            onClick={() => navigate('/admin/Exams')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin/Exams')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Exams</span>
            </button>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Answers</span>
              </label>
              <button
                onClick={handlePublishToggle}
                disabled={publishing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg ${
                  (exam?.status || 'draft') === 'draft'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800'
                } ${publishing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {(exam?.status || 'draft') === 'draft' ? (
                  <>
                    <Globe size={16} />
                    <span>{publishing ? 'Publishing...' : 'Publish Exam'}</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={16} />
                    <span>{publishing ? 'Unpublishing...' : 'Unpublish Exam'}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => navigate(`/admin/exams/edit/${batchName}/${examCode}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Edit size={16} />
                <span>Edit Exam</span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.examName || 'Untitled Exam'}</h1>
              <p className="text-gray-600 mb-4">{exam.examDescription || 'No description'}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={16} />
                  <span><strong>Code:</strong> {exam.examCode}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    {exam.category || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span><strong>Duration:</strong> {exam.duration || 0} mins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exam.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : exam.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {exam.status || 'draft'}
                  </span>
                </div>
              </div>

              {exam.year && exam.month && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Year: {exam.year}, Month: {exam.month}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions Count */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions Preview ({questions.length} total)
            </h2>
            <div className="text-sm text-gray-600">
              {questions.filter(q => q.questionSource === 'civil').length} Civil | {' '}
              {questions.filter(q => q.questionSource === 'gk').length} GK
            </div>
          </div>
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No questions found in this exam</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id || index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg font-bold">
                      {question.questionNumber || index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Question {question.questionNumber || index + 1}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {question.questionSource === 'gk' ? 'GK' : 'Civil'}
                        </span>
                        {question.questionType && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {question.questionType}
                          </span>
                        )}
                        {question.difficulty && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full capitalize">
                            {question.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {showAnswers && question.correctOption && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg">
                      <CheckCircle size={16} />
                      <span className="text-sm font-semibold">Answer: {question.correctOption}</span>
                    </div>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {question.questionTextEnglish || question.questionText || 'No question text available'}
                  </p>
                  {question.questionTextTamil && (
                    <p className="text-base text-gray-600 mt-2 leading-relaxed">
                      {question.questionTextTamil}
                    </p>
                  )}
                  
                  {/* Question Image - Display after question text */}
                  {(question.imageUrl || question.image_url) && (
                    <div className="mt-4 mb-4">
                      <div className="border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
                        <img
                          src={question.imageUrl || question.image_url}
                          alt={`Question ${question.questionNumber}`}
                          className="max-w-full h-auto rounded-lg mx-auto"
                          onError={(e) => {
                            console.error('Image failed to load:', question.imageUrl || question.image_url);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionText = question[`option${option}`] || '';
                    const isCorrect = showAnswers && question.correctOption === option;
                    
                    return (
                      <div
                        key={option}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCorrect
                            ? 'bg-green-50 border-green-500'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {option}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 leading-relaxed">
                              {optionText || 'N/A'}
                            </p>
                            {isCorrect && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-green-700 font-medium">
                                <CheckCircle size={12} />
                                <span>Correct Answer</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* GK Sub-options (if applicable) */}
                {question.questionSource === 'gk' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub-options:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['i', 'ii', 'iii', 'iv'].map((subOpt) => {
                        const subOptText = question[`subOption${subOpt.charAt(0).toUpperCase() + subOpt.slice(1)}`] || 
                                          question[`subOption${subOpt.toUpperCase()}`] || '';
                        return subOptText ? (
                          <div key={subOpt} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-gray-600">({subOpt})</span>
                              <p className="text-sm text-gray-700">{subOptText}</p>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {showAnswers && question.explanation && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Explanation:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/Exams')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

