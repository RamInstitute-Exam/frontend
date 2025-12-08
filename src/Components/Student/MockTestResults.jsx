import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Download,
  ArrowLeft,
  Eye,
  Target
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const MockTestResults = () => {
  const { examCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('english');
  const [showSolutions, setShowSolutions] = useState(false);

  const resultData = location.state || {
    totalQuestions: 50,
    answered: 45,
    correct: 35,
    wrong: 10,
    skipped: 5,
    timeTaken: 3200
  };

  const { totalQuestions, answered, correct, wrong, skipped, timeTaken, answers, questions } = resultData;

  const percentage = ((correct / totalQuestions) * 100).toFixed(1);
  const accuracy = answered > 0 ? ((correct / answered) * 100).toFixed(1) : 0;

  // Chart data
  const performanceData = [
    { name: language === 'tamil' ? 'சரி' : 'Correct', value: correct, color: '#10B981' },
    { name: language === 'tamil' ? 'தவறு' : 'Wrong', value: wrong, color: '#EF4444' },
    { name: language === 'tamil' ? 'தவிர்க்கப்பட்டது' : 'Skipped', value: skipped, color: '#6B7280' }
  ];

  const topicData = [
    { topic: language === 'tamil' ? 'கணிதம்' : 'Mathematics', correct: 12, wrong: 3, total: 15 },
    { topic: language === 'tamil' ? 'பொது அறிவு' : 'General Knowledge', correct: 10, wrong: 2, total: 12 },
    { topic: language === 'tamil' ? 'பகுத்தறிவு' : 'Reasoning', correct: 8, wrong: 4, total: 12 },
    { topic: language === 'tamil' ? 'ஆங்கிலம்' : 'English', correct: 5, wrong: 1, total: 6 }
  ];

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const handleDownloadPDF = () => {
    // Implement PDF download
    toast.info(language === 'tamil' ? 'PDF பதிவிறக்கம் தொடங்குகிறது...' : 'Starting PDF download...');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'tamil' ? 'தேர்வு முடிவுகள்' : 'Test Results'}
            </h1>
            <button
              onClick={() => navigate('/student/test-series')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'tamil' ? 'மீண்டும்' : 'Back'}
            </button>
          </div>

          {/* Score Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-2">
                  {language === 'tamil' ? 'உங்கள் மதிப்பெண்' : 'Your Score'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold">{correct}</span>
                  <span className="text-2xl text-blue-200">/ {totalQuestions}</span>
                </div>
                <p className="text-2xl font-semibold mt-2">{percentage}%</p>
              </div>
              <div className="text-right">
                <Trophy className="w-20 h-20 text-yellow-300 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label={language === 'tamil' ? 'சரியான பதில்கள்' : 'Correct Answers'}
            value={correct}
            color="green"
          />
          <StatCard
            icon={<XCircle className="w-6 h-6" />}
            label={language === 'tamil' ? 'தவறான பதில்கள்' : 'Wrong Answers'}
            value={wrong}
            color="red"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label={language === 'tamil' ? 'துல்லியம்' : 'Accuracy'}
            value={`${accuracy}%`}
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label={language === 'tamil' ? 'எடுத்த நேரம்' : 'Time Taken'}
            value={formatTime(timeTaken)}
            color="purple"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              {language === 'tamil' ? 'செயல்திறன் பிரிவு' : 'Performance Breakdown'}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Topic-wise Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              {language === 'tamil' ? 'தலைப்பு வாரியாக செயல்திறன்' : 'Topic-wise Performance'}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="correct" fill="#10B981" name={language === 'tamil' ? 'சரி' : 'Correct'} />
                <Bar dataKey="wrong" fill="#EF4444" name={language === 'tamil' ? 'தவறு' : 'Wrong'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              {language === 'tamil' ? 'விரிவான பகுப்பாய்வு' : 'Detailed Analysis'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSolutions(!showSolutions)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showSolutions 
                  ? (language === 'tamil' ? 'தீர்வுகளை மறை' : 'Hide Solutions')
                  : (language === 'tamil' ? 'தீர்வுகளை காட்டு' : 'Show Solutions')
                }
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {language === 'tamil' ? 'PDF பதிவிறக்க' : 'Download PDF'}
              </button>
            </div>
          </div>

          {/* Question Review */}
          {questions && questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctOption;
                const isSkipped = !userAnswer;

                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 ${
                      isCorrect ? 'border-green-500 bg-green-50' :
                      isSkipped ? 'border-gray-300 bg-gray-50' :
                      'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {language === 'tamil' ? 'கேள்வி' : 'Question'} {index + 1}
                        </span>
                        {isCorrect && (
                          <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium">
                            {language === 'tamil' ? 'சரி' : 'Correct'}
                          </span>
                        )}
                        {!isCorrect && !isSkipped && (
                          <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium">
                            {language === 'tamil' ? 'தவறு' : 'Wrong'}
                          </span>
                        )}
                        {isSkipped && (
                          <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-medium">
                            {language === 'tamil' ? 'தவிர்க்கப்பட்டது' : 'Skipped'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {language === 'tamil' ? 'மதிப்பெண்கள்' : 'Marks'}: {isCorrect ? question.marks : 0} / {question.marks}
                      </span>
                    </div>

                    <p className="text-gray-900 mb-4">
                      {language === 'tamil' ? question.questionTextTamil : question.questionText}
                    </p>

                    <div className="space-y-2 mb-4">
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const isUserAnswer = userAnswer === option;
                        const isCorrectAnswer = question.correctOption === option;
                        const optionText = language === 'tamil' 
                          ? question.optionsTamil[option]
                          : question.options[option];

                        let bgColor = 'bg-white border-gray-300';
                        if (isCorrectAnswer) bgColor = 'bg-green-100 border-green-500';
                        if (isUserAnswer && !isCorrect) bgColor = 'bg-red-100 border-red-500';

                        return (
                          <div
                            key={option}
                            className={`p-3 rounded-lg border-2 ${bgColor}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{option}.</span>
                              <span>{optionText}</span>
                              {isCorrectAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                              )}
                              {isUserAnswer && !isCorrect && (
                                <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {showSolutions && question.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {language === 'tamil' ? 'விளக்கம்' : 'Explanation'}:
                        </p>
                        <p className="text-sm text-gray-700">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/student/test-series')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            {language === 'tamil' ? 'மேலும் தேர்வுகளை எடுக்க' : 'Take More Tests'}
          </button>
          <button
            onClick={() => navigate('/student')}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            {language === 'tamil' ? 'டாஷ்போர்டுக்கு செல்' : 'Go to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${colorClasses[color]} rounded-lg text-white`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default MockTestResults;

