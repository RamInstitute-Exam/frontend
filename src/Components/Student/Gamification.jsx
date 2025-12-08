import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Star,
  TrendingUp,
  Medal,
  Crown,
  Zap,
  Target,
  Calendar,
  Users,
  ArrowUp,
  CheckCircle
} from 'lucide-react';
import { gamificationAPI } from '../../services/apiService';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Gamification = () => {
  const [xpData, setXPData] = useState(null);
  const [badges, setBadges] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [xpHistory, setXPHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all_time');
  const [language, setLanguage] = useState('english');

  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    if (studentId) {
      fetchGamificationData();
    }
  }, [studentId, period]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const [xp, badgesData, leaderboardData, history] = await Promise.all([
        gamificationAPI.getXP(studentId),
        gamificationAPI.getBadges(studentId),
        gamificationAPI.getLeaderboard(period),
        gamificationAPI.getXPTransactions(studentId, 20)
      ]);

      setXPData(xp);
      setBadges(badgesData);
      setLeaderboard(leaderboardData);
      setXPHistory(history);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast.error('Failed to load gamification data');
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

  const xpProgress = xpData?.xpProgress || 0;
  const currentLevel = xpData?.currentLevel || 1;

  // Prepare leaderboard data for chart
  const topTen = leaderboard?.leaderboard?.slice(0, 10) || [];
  const studentRank = leaderboard?.leaderboard?.findIndex(entry => entry.id === parseInt(studentId)) + 1 || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'tamil' ? 'விளையாட்டு முறை' : 'Gamification'}
              </h1>
              <p className="text-gray-600">
                {language === 'tamil'
                  ? 'XP புள்ளிகள், பதக்கங்கள் மற்றும் தரவரிசை'
                  : 'XP Points, Badges, and Leaderboard'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="daily">{language === 'tamil' ? 'இன்று' : 'Daily'}</option>
                <option value="weekly">{language === 'tamil' ? 'வாரம்' : 'Weekly'}</option>
                <option value="monthly">{language === 'tamil' ? 'மாதம்' : 'Monthly'}</option>
                <option value="all_time">{language === 'tamil' ? 'அனைத்து நேரம்' : 'All Time'}</option>
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
        {/* XP & Level Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Star className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-purple-200 text-sm">
                    {language === 'tamil' ? 'நிலை' : 'Level'} {currentLevel}
                  </p>
                  <p className="text-3xl font-bold">
                    {xpData?.totalXP?.toLocaleString() || 0} {language === 'tamil' ? 'XP' : 'XP'}
                  </p>
                </div>
              </div>
              
              {/* XP Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{language === 'tamil' ? 'அடுத்த நிலைக்கு' : 'To Next Level'}</span>
                  <span>{xpData?.xpForNextLevel || 0} {language === 'tamil' ? 'XP தேவை' : 'XP needed'}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-300" />
                  <span className="text-sm">
                    {xpData?.streakDays || 0} {language === 'tamil' ? 'நாட்கள் தொடர்ச்சி' : 'day streak'}
                  </span>
                </div>
                <div className="text-sm text-purple-200">
                  {language === 'tamil' ? 'நீண்ட தொடர்ச்சி' : 'Longest'}: {xpData?.longestStreak || 0}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Trophy className="w-16 h-16 text-yellow-300" />
              </div>
              <p className="text-sm text-purple-200">
                {language === 'tamil' ? 'உங்கள் தரவரிசை' : 'Your Rank'}
              </p>
              <p className="text-2xl font-bold">
                #{studentRank || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Star className="w-6 h-6" />}
            label={language === 'tamil' ? 'மொத்த XP' : 'Total XP'}
            value={xpData?.totalXP?.toLocaleString() || 0}
            color="purple"
          />
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label={language === 'tamil' ? 'நிலை' : 'Level'}
            value={currentLevel}
            color="yellow"
          />
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            label={language === 'tamil' ? 'தொடர்ச்சி' : 'Streak'}
            value={`${xpData?.streakDays || 0} ${language === 'tamil' ? 'நாட்கள்' : 'days'}`}
            color="orange"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label={language === 'tamil' ? 'பதக்கங்கள்' : 'Badges'}
            value={`${badges?.totalEarned || 0} / ${badges?.totalAvailable || 0}`}
            color="blue"
          />
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Medal className="w-6 h-6 text-yellow-600" />
            {language === 'tamil' ? 'பதக்கங்கள்' : 'Badges'}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges?.available?.map((badge, index) => (
              <BadgeCard
                key={index}
                badge={badge}
                language={language}
              />
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            {language === 'tamil' ? 'தரவரிசை' : 'Leaderboard'}
          </h2>

          {topTen.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300} className="mb-6">
                <BarChart data={topTen}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_xp" fill="#8B5CF6" name={language === 'tamil' ? 'XP' : 'XP Points'} />
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {topTen.map((entry, index) => (
                  <LeaderboardEntry
                    key={entry.id}
                    entry={entry}
                    index={index}
                    isCurrentUser={entry.id === parseInt(studentId)}
                    language={language}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {language === 'tamil' ? 'தரவரிசை தரவு இல்லை' : 'No leaderboard data'}
            </p>
          )}
        </div>

        {/* XP History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            {language === 'tamil' ? 'XP வரலாறு' : 'XP History'}
          </h2>

          <div className="space-y-3">
            {xpHistory.length > 0 ? (
              xpHistory.map((transaction, index) => (
                <XPTransactionCard
                  key={index}
                  transaction={transaction}
                  language={language}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {language === 'tamil' ? 'XP பரிவர்த்தனைகள் இல்லை' : 'No XP transactions'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500'
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

const BadgeCard = ({ badge, language }) => {
  const isEarned = badge.isEarned;
  const canEarn = badge.canEarn && !isEarned;

  return (
    <div className={`relative p-4 rounded-lg border-2 text-center transition-all ${
      isEarned
        ? 'border-yellow-400 bg-yellow-50'
        : canEarn
        ? 'border-green-400 bg-green-50'
        : 'border-gray-200 bg-gray-50 opacity-60'
    }`}>
      {isEarned && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
        isEarned ? 'bg-yellow-100' : 'bg-gray-100'
      }`}>
        <Award className={`w-8 h-8 ${isEarned ? 'text-yellow-600' : 'text-gray-400'}`} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{badge.name}</h3>
      <p className="text-xs text-gray-600 line-clamp-2">{badge.description}</p>
      {isEarned && badge.earnedAt && (
        <p className="text-xs text-gray-500 mt-2">
          {new Date(badge.earnedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const LeaderboardEntry = ({ entry, index, isCurrentUser, language }) => {
  const rankColors = {
    1: 'bg-yellow-100 border-yellow-400',
    2: 'bg-gray-100 border-gray-400',
    3: 'bg-orange-100 border-orange-400'
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
      isCurrentUser ? 'bg-blue-50 border-blue-400' : rankColors[index + 1] || 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 font-bold text-gray-700">
        {index === 0 && <Crown className="w-5 h-5 text-yellow-600" />}
        {index === 1 && <Medal className="w-5 h-5 text-gray-600" />}
        {index === 2 && <Medal className="w-5 h-5 text-orange-600" />}
        {index > 2 && <span>{index + 1}</span>}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{entry.name}</h3>
          {isCurrentUser && (
            <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
              {language === 'tamil' ? 'நீங்கள்' : 'You'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{language === 'tamil' ? 'நிலை' : 'Level'} {entry.current_level}</span>
          <span>{entry.total_tests} {language === 'tamil' ? 'தேர்வுகள்' : 'tests'}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">{entry.total_xp?.toLocaleString() || 0} XP</p>
        {entry.avg_score && (
          <p className="text-sm text-gray-600">{parseFloat(entry.avg_score).toFixed(1)}%</p>
        )}
      </div>
    </div>
  );
};

const XPTransactionCard = ({ transaction, language }) => {
  const typeIcons = {
    test_completed: <Trophy className="w-4 h-4" />,
    practice_question: <Target className="w-4 h-4" />,
    daily_streak: <Flame className="w-4 h-4" />,
    achievement: <Award className="w-4 h-4" />,
    bonus: <Star className="w-4 h-4" />
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg text-green-600">
          {typeIcons[transaction.transaction_type] || <Zap className="w-4 h-4" />}
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.description || transaction.transaction_type}</p>
          <p className="text-xs text-gray-500">
            {new Date(transaction.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-green-600 font-bold">
        <ArrowUp className="w-4 h-4" />
        +{transaction.xp_amount} XP
      </div>
    </div>
  );
};

export default Gamification;

