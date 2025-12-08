import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Award,
  Clock,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { analyticsAPI } from '../../services/apiService';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [comprehensiveData, setComprehensiveData] = useState(null);
  const [topicsData, setTopicsData] = useState(null);
  const [comparativeData, setComparativeData] = useState(null);
  const [timeBasedData, setTimeBasedData] = useState(null);
  const [period, setPeriod] = useState(30);
  const [language, setLanguage] = useState('english');

  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    if (studentId) {
      fetchAllAnalytics();
    }
  }, [studentId, period]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const [comprehensive, topics, comparative, timeBased] = await Promise.all([
        analyticsAPI.getComprehensive(studentId, period),
        analyticsAPI.getTopics(studentId),
        analyticsAPI.getComparative(studentId),
        analyticsAPI.getTimeBased(studentId, period)
      ]);

      setComprehensiveData(comprehensive);
      setTopicsData(topics);
      setComparativeData(comparative);
      setTimeBasedData(timeBased);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#10B981', '#EF4444', '#6B7280', '#3B82F6', '#F59E0B'];

  // Prepare chart data
  const improvementData = comprehensiveData?.improvementTrend?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: parseFloat(item.score) || 0
  })) || [];

  const testAttemptsData = comprehensiveData?.testAttempts?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    tests: item.tests_taken || 0,
    avgScore: parseFloat(item.avg_score) || 0
  })) || [];

  const practiceData = comprehensiveData?.practiceAttempts?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    questions: item.questions_answered || 0,
    accuracy: item.questions_answered > 0 
      ? ((item.correct / item.questions_answered) * 100).toFixed(1)
      : 0
  })) || [];

  const topicChartData = topicsData?.all?.slice(0, 10).map(topic => ({
    name: topic.topic_name,
    mastery: parseFloat(topic.mastery_percentage) || 0,
    correct: topic.correct_answers || 0,
    wrong: topic.wrong_answers || 0
  })) || [];

  const weakTopics = topicsData?.weak || [];
  const strongTopics = topicsData?.strong || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'tamil' ? 'விரிவான பகுப்பாய்வு' : 'Comprehensive Analytics'}
              </h1>
              <p className="text-gray-600">
                {language === 'tamil'
                  ? 'உங்கள் செயல்திறன், முன்னேற்றம் மற்றும் பலவீனமான பகுதிகளை பகுப்பாய்வு செய்யுங்கள்'
                  : 'Analyze your performance, progress, and weak areas'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={7}>{language === 'tamil' ? '7 நாட்கள்' : '7 Days'}</option>
                <option value={30}>{language === 'tamil' ? '30 நாட்கள்' : '30 Days'}</option>
                <option value={90}>{language === 'tamil' ? '90 நாட்கள்' : '90 Days'}</option>
                <option value={180}>{language === 'tamil' ? '6 மாதங்கள்' : '6 Months'}</option>
              </select>
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

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            label={language === 'tamil' ? 'மொத்த தேர்வுகள்' : 'Total Tests'}
            value={comprehensiveData?.summary?.totalTests || 0}
            color="blue"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label={language === 'tamil' ? 'சராசரி மதிப்பெண்' : 'Avg Test Score'}
            value={`${comprehensiveData?.summary?.avgTestScore || 0}%`}
            color="green"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label={language === 'tamil' ? 'பயிற்சி துல்லியம்' : 'Practice Accuracy'}
            value={`${comprehensiveData?.summary?.practiceAccuracy || 0}%`}
            color="purple"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label={language === 'tamil' ? 'பயிற்சி கேள்விகள்' : 'Practice Questions'}
            value={comprehensiveData?.summary?.totalPracticeQuestions || 0}
            color="orange"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label={language === 'tamil' ? 'பயிற்சி நாட்கள்' : 'Days Practiced'}
            value={comprehensiveData?.summary?.daysPracticed || 0}
            color="indigo"
          />
        </div>

        {/* Improvement Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {language === 'tamil' ? 'முன்னேற்ற போக்கு' : 'Improvement Trend'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={improvementData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#3B82F6" fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Test vs Practice Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Attempts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              {language === 'tamil' ? 'தேர்வு முயற்சிகள்' : 'Test Attempts'}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testAttemptsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tests" fill="#10B981" name={language === 'tamil' ? 'தேர்வுகள்' : 'Tests'} />
                <Bar dataKey="avgScore" fill="#3B82F6" name={language === 'tamil' ? 'சராசரி மதிப்பெண்' : 'Avg Score'} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Practice Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              {language === 'tamil' ? 'பயிற்சி செயல்திறன்' : 'Practice Performance'}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={practiceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#8B5CF6" strokeWidth={2} name={language === 'tamil' ? 'துல்லியம் %' : 'Accuracy %'} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weak vs Strong Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weak Topics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              {language === 'tamil' ? 'பலவீனமான தலைப்புகள்' : 'Weak Topics'}
            </h2>
            <div className="space-y-3">
              {weakTopics.length > 0 ? (
                weakTopics.slice(0, 5).map((topic, index) => (
                  <TopicBar
                    key={index}
                    topic={topic}
                    language={language}
                    color="red"
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {language === 'tamil' ? 'பலவீனமான தலைப்புகள் இல்லை' : 'No weak topics'}
                </p>
              )}
            </div>
          </div>

          {/* Strong Topics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {language === 'tamil' ? 'வலுவான தலைப்புகள்' : 'Strong Topics'}
            </h2>
            <div className="space-y-3">
              {strongTopics.length > 0 ? (
                strongTopics.slice(0, 5).map((topic, index) => (
                  <TopicBar
                    key={index}
                    topic={topic}
                    language={language}
                    color="green"
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {language === 'tamil' ? 'வலுவான தலைப்புகள் இல்லை' : 'No strong topics'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Topic Mastery Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            {language === 'tamil' ? 'தலைப்பு தேர்ச்சி' : 'Topic Mastery'}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topicChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="mastery" fill="#3B82F6" name={language === 'tamil' ? 'தேர்ச்சி %' : 'Mastery %'} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparative Analytics */}
        {comparativeData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              {language === 'tamil' ? 'ஒப்பீட்டு பகுப்பாய்வு' : 'Comparative Analytics'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{language === 'tamil' ? 'உங்கள் சராசரி' : 'Your Average'}</p>
                <p className="text-3xl font-bold text-blue-600">{comparativeData.student.avgScore}%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{language === 'tamil' ? 'மொத்த சராசரி' : 'Overall Average'}</p>
                <p className="text-3xl font-bold text-gray-600">{comparativeData.overall.avgScore}%</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{language === 'tamil' ? 'தரவரிசை' : 'Rank'}</p>
                <p className="text-3xl font-bold text-yellow-600">
                  #{comparativeData.rank.position} / {comparativeData.rank.totalStudents}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${colorClasses[color]} rounded-lg text-white`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const TopicBar = ({ topic, language, color }) => {
  const mastery = parseFloat(topic.mastery_percentage) || 0;
  const bgColor = color === 'red' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{topic.topic_name}</span>
        <span className="text-sm font-bold text-gray-900">{mastery.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${bgColor} h-2 rounded-full transition-all`}
          style={{ width: `${mastery}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
        <span>{topic.correct_answers} {language === 'tamil' ? 'சரி' : 'Correct'}</span>
        <span>{topic.wrong_answers} {language === 'tamil' ? 'தவறு' : 'Wrong'}</span>
      </div>
    </div>
  );
};

export default Analytics;

