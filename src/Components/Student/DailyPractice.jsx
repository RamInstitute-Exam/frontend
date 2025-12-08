import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  Calendar
} from 'lucide-react';
import { practiceAPI } from '../../services/apiService';
import { toast } from 'react-toastify';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DailyPractice = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState(null);
  const [mastery, setMastery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('english');
  const [practiceDate, setPracticeDate] = useState(new Date().toISOString().split('T')[0]);
  
  const studentId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (studentId) {
      fetchDailyPractice();
      fetchStats();
      fetchMastery();
    }
  }, [studentId, practiceDate]);

  const fetchDailyPractice = async () => {
    try {
      setLoading(true);
      const data = await practiceAPI.getDailyPractice(studentId, practiceDate);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setSelectedOption(null);
      setShowResult(false);
    } catch (error) {
      console.error('Error fetching daily practice:', error);
      toast.error('Failed to load practice questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await practiceAPI.getStats(studentId, 30);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMastery = async () => {
    try {
      const data = await practiceAPI.getMastery(studentId);
      setMastery(data);
    } catch (error) {
      console.error('Error fetching mastery:', error);
    }
  };

  const handleAnswerSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.warning(language === 'tamil' ? 'தயவுசெய்து ஒரு பதிலைத் தேர்ந்தெடுக்கவும்' : 'Please select an answer');
      return;
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion || !currentQuestion.questionData) return;

    try {
      const startTime = Date.now();
      const result = await practiceAPI.submitAnswer({
        studentId,
        questionId: currentQuestion.question_id,
        questionType: currentQuestion.question_type,
        selectedOption,
        timeTaken: Math.floor((Date.now() - startTime) / 1000)
      });

      setShowResult(true);
      
      if (result.isCorrect) {
        toast.success(language === 'tamil' ? 'சரியான பதில்! 🎉' : 'Correct answer! 🎉');
      } else {
        toast.error(language === 'tamil' ? 'தவறான பதில்' : 'Incorrect answer');
      }

      // Refresh stats after submission
      setTimeout(() => {
        fetchStats();
        fetchMastery();
      }, 500);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      toast.info(language === 'tamil' ? 'இன்றைய பயிற்சி முடிந்தது!' : 'Today\'s practice completed!');
      fetchDailyPractice(); // Refresh for new questions
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion || !currentQuestion.questionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {language === 'tamil' ? 'இன்றைய பயிற்சி கேள்விகள் இல்லை' : 'No practice questions for today'}
          </p>
          <button
            onClick={() => navigate('/student')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {language === 'tamil' ? 'டாஷ்போர்டுக்கு செல்' : 'Go to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  const question = currentQuestion.questionData;
  const isCorrect = showResult && selectedOption === question.correctOption;
  const correctOption = showResult ? question.correctOption : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'tamil' ? 'தினசரி பயிற்சி' : 'Daily Practice'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'tamil' ? 'கேள்வி' : 'Question'} {currentIndex + 1} / {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={practiceDate}
                onChange={(e) => setPracticeDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={() => setLanguage(language === 'english' ? 'tamil' : 'english')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
              >
                {language === 'english' ? 'தமிழ்' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Question Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                      {language === 'tamil' ? 'கேள்வி' : 'Question'} {currentIndex + 1}
                    </div>
                    {currentQuestion.difficulty && (
                      <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {currentQuestion.difficulty}
                      </div>
                    )}
                  </div>
                  {currentQuestion.category_name && (
                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                      {currentQuestion.category_name}
                    </div>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <p className="text-lg text-gray-900 leading-relaxed">
                    {language === 'tamil' && question.questionTextTamil
                      ? question.questionTextTamil
                      : question.questionTextEnglish || question.questionText}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionText = language === 'tamil' && question.optionsTamil
                      ? question.optionsTamil[option]
                      : question.options?.[option] || '';
                    
                    const isSelected = selectedOption === option;
                    const isCorrectAnswer = showResult && correctOption === option;
                    const isWrongAnswer = showResult && isSelected && !isCorrect;

                    let bgColor = 'bg-white border-gray-200';
                    if (showResult && isCorrectAnswer) bgColor = 'bg-green-100 border-green-500';
                    if (isWrongAnswer) bgColor = 'bg-red-100 border-red-500';
                    if (!showResult && isSelected) bgColor = 'bg-blue-50 border-blue-500';

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          showResult ? 'cursor-default' : 'hover:border-gray-300 hover:bg-gray-50'
                        } ${bgColor}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected || isCorrectAnswer
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {(isSelected || isCorrectAnswer) && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                            {isWrongAnswer && (
                              <XCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="font-semibold text-gray-700 mr-2">{option}.</span>
                          <span className="text-gray-900">{optionText}</span>
                          {isCorrectAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showResult && question.explanation && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      {language === 'tamil' ? 'விளக்கம்' : 'Explanation'}:
                    </p>
                    <p className="text-sm text-gray-700">{question.explanation}</p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'tamil' ? 'முந்தைய' : 'Previous'}
                  </button>

                  {!showResult ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedOption}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {language === 'tamil' ? 'சமர்ப்பிக்க' : 'Submit'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                    >
                      {language === 'tamil' ? 'அடுத்து' : 'Next'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Stats */}
            <div className="space-y-6">
              {/* Today's Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  {language === 'tamil' ? 'இன்றைய புள்ளிவிவரங்கள்' : 'Today\'s Stats'}
                </h2>
                <div className="space-y-3">
                  <StatItem
                    label={language === 'tamil' ? 'முயற்சிகள்' : 'Attempts'}
                    value={currentIndex + 1}
                    total={questions.length}
                  />
                  {stats && (
                    <>
                      <StatItem
                        label={language === 'tamil' ? 'துல்லியம்' : 'Accuracy'}
                        value={`${stats.accuracy?.toFixed(1) || 0}%`}
                      />
                      <StatItem
                        label={language === 'tamil' ? 'சரியான பதில்கள்' : 'Correct'}
                        value={stats.correctAnswers || 0}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Topic Mastery */}
              {mastery.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    {language === 'tamil' ? 'தலைப்பு தேர்ச்சி' : 'Topic Mastery'}
                  </h2>
                  <div className="space-y-3">
                    {mastery.slice(0, 5).map((topic, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{topic.topic_name}</span>
                          <span className="text-sm font-bold text-gray-900">{topic.mastery_percentage?.toFixed(0) || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${topic.mastery_percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Chart */}
              {stats && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    {language === 'tamil' ? 'முன்னேற்றம்' : 'Progress'}
                  </h2>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {stats.daysPracticed || 0}
                    </div>
                    <p className="text-sm text-gray-600">
                      {language === 'tamil' ? 'பயிற்சி நாட்கள்' : 'Days Practiced'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, total }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900">{value}</span>
        {total && (
          <span className="text-sm text-gray-500">/ {total}</span>
        )}
      </div>
    </div>
  );
};

export default DailyPractice;

