import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  BarChart3,
  Zap,
  Trophy,
  PlayCircle,
  ArrowRight
} from 'lucide-react';
import { studentAPI } from '../../services/apiService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const ModernDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [language, setLanguage] = useState('english'); // 'english' or 'tamil'

  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    if (studentId) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summary, analyticsData, upcoming] = await Promise.all([
        studentAPI.getDashboardSummary(studentId),
        studentAPI.getAnalytics(studentId),
        studentAPI.getUpcomingTests(studentId)
      ]);
      
      setDashboardData(summary);
      setAnalytics(analyticsData);
      setUpcomingTests(upcoming);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const stats = dashboardData?.stats || {};
  const recentReports = dashboardData?.recentReports || [];

  // Chart data
  const performanceData = analytics?.attemptHistory?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: parseFloat(item.score) || 0
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {language === 'tamil' ? 'வணக்கம்' : 'Welcome'}, {dashboardData?.student?.name || 'Student'}!
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'tamil' 
                ? 'உங்கள் TNPSC மற்றும் அரசு தேர்வுகளுக்கு தயாராகுங்கள்'
                : 'Prepare for your TNPSC and Government exams with ease'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'english' ? 'tamil' : 'english')}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              {language === 'english' ? 'தமிழ்' : 'English'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 space-y-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title={language === 'tamil' ? 'மொத்த தேர்வுகள்' : 'Total Tests'}
            value={stats.totalExams || 0}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title={language === 'tamil' ? 'சராசரி மதிப்பெண்' : 'Average Score'}
            value={`${stats.avgScore || 0}%`}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title={language === 'tamil' ? 'இந்த மாதம்' : 'This Month'}
            value={stats.completedExams || 0}
            color="orange"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            title={language === 'tamil' ? 'துல்லியம்' : 'Accuracy'}
            value={`${analytics?.accuracy?.toFixed(1) || 0}%`}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                {language === 'tamil' ? 'விரைவு செயல்கள்' : 'Quick Actions'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <ActionCard
                  icon={<PlayCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                  title={language === 'tamil' ? 'தேர்வு தொடங்க' : 'Start Test'}
                  color="bg-green-500"
                  href="/student/exams-list"
                />
                {/* Bookmarks and Study Materials features have been removed */}
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  {language === 'tamil' ? 'செயல்திறன் போக்கு' : 'Performance Trend'}
                </h2>
                <Link
                  to="/student/analytics"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {language === 'tamil' ? 'மேலும் பார்க்க' : 'View More'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minHeight={200}>
                  <LineChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12 }}
                      width={40}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Score %"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Upcoming Tests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {language === 'tamil' ? 'வரவிருக்கும் தேர்வுகள்' : 'Upcoming Tests'}
              </h2>
              <div className="space-y-3">
                {upcomingTests.length > 0 ? (
                  upcomingTests.slice(0, 5).map((test) => (
                    <UpcomingTestCard key={test.id} test={test} language={language} />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {language === 'tamil' ? 'வரவிருக்கும் தேர்வுகள் இல்லை' : 'No upcoming tests'}
                  </p>
                )}
              </div>
              <Link
                to="/student/exams-list"
                className="mt-4 block text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {language === 'tamil' ? 'அனைத்தையும் பார்க்க' : 'View All'} <ArrowRight className="inline w-4 h-4" />
              </Link>
            </div>

            {/* Recent Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                {language === 'tamil' ? 'சமீபத்திய செயல்திறன்' : 'Recent Performance'}
              </h2>
              <div className="space-y-3">
                {recentReports.length > 0 ? (
                  recentReports.slice(0, 5).map((report) => (
                    <RecentPerformanceCard key={report.id} report={report} />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {language === 'tamil' ? 'இன்னும் தேர்வுகள் எடுக்கவில்லை' : 'No tests taken yet'}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 ${colorClasses[color]} rounded-lg text-white`}>
          {icon}
        </div>
      </div>
      <h3 className="text-xs sm:text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// Action Card Component
const ActionCard = ({ icon, title, color, href }) => {
  return (
    <Link
      to={href}
      className={`${color} rounded-xl p-3 sm:p-4 text-white hover:opacity-90 transition-opacity active:scale-95`}
    >
      <div className="flex flex-col items-center text-center gap-1.5 sm:gap-2">
        {icon}
        <span className="text-xs sm:text-sm font-medium leading-tight">{title}</span>
      </div>
    </Link>
  );
};

// Upcoming Test Card
const UpcomingTestCard = ({ test, language }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{test.examName}</h4>
      <p className="text-xs text-gray-600 mb-2">{test.category}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(test.scheduledStartDate).toLocaleDateString()}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {test.duration} {language === 'tamil' ? 'நிமிடங்கள்' : 'mins'}
        </span>
      </div>
    </div>
  );
};

// Recent Performance Card
const RecentPerformanceCard = ({ report }) => {
  const percentage = parseFloat(report.percentage) || 0;
  const colorClass = percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{report.examName}</h4>
        <span className={`font-bold ${colorClass}`}>{percentage.toFixed(1)}%</span>
      </div>
      <p className="text-xs text-gray-600">{report.category}</p>
      <p className="text-xs text-gray-500 mt-1">
        {new Date(report.submittedAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ModernDashboard;

