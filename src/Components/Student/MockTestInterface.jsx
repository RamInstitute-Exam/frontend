import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Flag,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Send,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const MockTestInterface = () => {
  const { examCode } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewed, setReviewed] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [testStarted, setTestStarted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [language, setLanguage] = useState('english');
  
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Fetch questions - this would need actual API
    loadQuestions();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [examCode]);

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [testStarted, timeRemaining]);

  const loadQuestions = async () => {
    // Mock questions - replace with actual API call
    const mockQuestions = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      questionNumber: i + 1,
      questionText: `Question ${i + 1}: What is the answer to this question?`,
      questionTextTamil: `கேள்வி ${i + 1}: இந்த கேள்விக்கான பதில் என்ன?`,
      options: {
        A: `Option A for question ${i + 1}`,
        B: `Option B for question ${i + 1}`,
        C: `Option C for question ${i + 1}`,
        D: `Option D for question ${i + 1}`
      },
      optionsTamil: {
        A: `விருப்பம் A கேள்வி ${i + 1}க்கு`,
        B: `விருப்பம் B கேள்வி ${i + 1}க்கு`,
        C: `விருப்பம் C கேள்வி ${i + 1}க்கு`,
        D: `விருப்பம் D கேள்வி ${i + 1}க்கு`
      },
      correctOption: 'A',
      marks: 1
    }));
    
    setQuestions(mockQuestions);
    setTestStarted(true);
  };

  const handleAnswerSelect = (option) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: option
    });
  };

  const handleMarkForReview = () => {
    setReviewed({
      ...reviewed,
      [currentQuestionIndex]: !reviewed[currentQuestionIndex]
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleAutoSubmit = () => {
    toast.warning(language === 'tamil' 
      ? 'நேரம் முடிந்தது! தேர்வு தானாக சமர்ப்பிக்கப்படுகிறது' 
      : 'Time up! Auto-submitting test...');
    submitTest();
  };

  const submitTest = async () => {
    try {
      // Calculate results
      const totalQuestions = questions.length;
      const answered = Object.keys(answers).length;
      const correct = questions.reduce((count, q, index) => {
        return count + (answers[index] === q.correctOption ? 1 : 0);
      }, 0);
      const wrong = answered - correct;
      const skipped = totalQuestions - answered;
      
      // Navigate to results page
      navigate(`/student/test/${examCode}/results`, {
        state: {
          totalQuestions,
          answered,
          correct,
          wrong,
          skipped,
          answers,
          questions,
          timeTaken: 3600 - timeRemaining
        }
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Failed to submit test');
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const reviewedCount = Object.keys(reviewed).filter(k => reviewed[k]).length;

  if (!testStarted || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">
                {language === 'tamil' ? 'தேர்வு நடைபெறுகிறது' : 'Test in Progress'}
              </h1>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
                <span className={`font-mono font-bold text-lg ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {language === 'tamil' ? 'பதிலளிக்கப்பட்டது' : 'Answered'}: <span className="font-bold text-green-600">{answeredCount}</span> / {questions.length}
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {language === 'tamil' ? 'சமர்ப்பிக்க' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Question Panel */}
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                  {language === 'tamil' ? 'கேள்வி' : 'Question'} {currentQuestionIndex + 1} / {questions.length}
                </div>
                {reviewed[currentQuestionIndex] && (
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm flex items-center gap-1">
                    <Flag className="w-4 h-4" />
                    {language === 'tamil' ? 'மதிப்பாய்வு' : 'Review'}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'tamil' ? 'மதிப்பெண்கள்' : 'Marks'}: {currentQuestion.marks}
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <p className="text-lg text-gray-900 leading-relaxed">
                {language === 'tamil' ? currentQuestion.questionTextTamil : currentQuestion.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {['A', 'B', 'C', 'D'].map((option) => {
                const isSelected = answers[currentQuestionIndex] === option;
                const optionText = language === 'tamil' 
                  ? currentQuestion.optionsTamil[option]
                  : currentQuestion.options[option];
                
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        {!isSelected && <Circle className="w-4 h-4 text-gray-400" />}
                      </div>
                      <span className="font-semibold text-gray-700 mr-2">{option}.</span>
                      <span className="text-gray-900">{optionText}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'tamil' ? 'முந்தைய' : 'Previous'}
              </button>
              
              <button
                onClick={handleMarkForReview}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  reviewed[currentQuestionIndex]
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Flag className="w-4 h-4" />
                {language === 'tamil' ? 'மதிப்பாய்வுக்கு குறி' : 'Mark for Review'}
              </button>

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {language === 'tamil' ? 'அடுத்து' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette */}
        <div className="lg:w-80 bg-white border-l border-gray-200 p-4 md:p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            {language === 'tamil' ? 'கேள்வி பேலட்' : 'Question Palette'}
          </h3>
          
          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((q, index) => {
              const isAnswered = answers[index];
              const isReviewed = reviewed[index];
              const isCurrent = index === currentQuestionIndex;
              
              let bgColor = 'bg-gray-100 border-gray-300';
              if (isCurrent) bgColor = 'bg-blue-600 border-blue-700 text-white';
              else if (isAnswered && isReviewed) bgColor = 'bg-yellow-500 border-yellow-600 text-white';
              else if (isAnswered) bgColor = 'bg-green-500 border-green-600 text-white';
              else if (isReviewed) bgColor = 'bg-yellow-200 border-yellow-400';
              
              return (
                <button
                  key={index}
                  onClick={() => handleQuestionNavigation(index)}
                  className={`w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all hover:scale-110 ${bgColor}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded border border-green-600"></div>
              <span className="text-gray-700">{language === 'tamil' ? 'பதிலளிக்கப்பட்டது' : 'Answered'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 rounded border border-yellow-400"></div>
              <span className="text-gray-700">{language === 'tamil' ? 'மதிப்பாய்வு' : 'Review'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
              <span className="text-gray-700">{language === 'tamil' ? 'பதிலளிக்கப்படவில்லை' : 'Not Answered'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded border border-blue-700"></div>
              <span className="text-gray-700">{language === 'tamil' ? 'தற்போதைய கேள்வி' : 'Current'}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">
              {language === 'tamil' ? 'சுருக்கம்' : 'Summary'}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'tamil' ? 'மொத்த கேள்விகள்' : 'Total Questions'}</span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'tamil' ? 'பதிலளிக்கப்பட்டது' : 'Answered'}</span>
                <span className="font-semibold text-green-600">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'tamil' ? 'மதிப்பாய்வு' : 'Review'}</span>
                <span className="font-semibold text-yellow-600">{reviewedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'tamil' ? 'பதிலளிக்கப்படவில்லை' : 'Not Answered'}</span>
                <span className="font-semibold text-gray-600">{questions.length - answeredCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <SubmitModal
          onConfirm={submitTest}
          onCancel={() => setShowSubmitModal(false)}
          answeredCount={answeredCount}
          totalQuestions={questions.length}
          language={language}
        />
      )}
    </div>
  );
};

const SubmitModal = ({ onConfirm, onCancel, answeredCount, totalQuestions, language }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'tamil' ? 'தேர்வை சமர்ப்பிக்கவா?' : 'Submit Test?'}
          </h2>
        </div>
        
        <p className="text-gray-700 mb-4">
          {language === 'tamil'
            ? `நீங்கள் ${answeredCount} / ${totalQuestions} கேள்விகளுக்கு பதிலளித்துள்ளீர்கள். நீங்கள் உறுதியாக இருக்கிறீர்களா?`
            : `You have answered ${answeredCount} / ${totalQuestions} questions. Are you sure you want to submit?`}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {language === 'tamil' ? 'ரத்துசெய்' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {language === 'tamil' ? 'சமர்ப்பிக்க' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockTestInterface;

