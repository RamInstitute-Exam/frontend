import React, { useEffect, useState } from 'react';
import { Trophy, Plus, Search, Edit, Trash, Award, Users, TrendingUp, Star, X } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../config/API.jsx';

export default function GamificationManagement() {
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('badges'); // badges, leaderboard, xp-rules
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [savingBadge, setSavingBadge] = useState(false);
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    badge_type: 'achievement',
    icon_url: '',
    criteria_xp: '',
    criteria_tests: '',
    criteria_streak: '',
    is_active: true
  });

  useEffect(() => {
    if (activeTab === 'badges') {
      fetchBadges();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/gamification/badges');
      setBadges(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching badges:', err);
      toast.error(err.response?.data?.error || 'Failed to load badges');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/gamification/leaderboard?period=all');
      setLeaderboard(response.data?.leaderboard || response.data?.data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      toast.error(err.response?.data?.error || 'Failed to load leaderboard');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBadgeClick = () => {
    setEditingBadge(null);
    setBadgeForm({
      name: '',
      description: '',
      badge_type: 'achievement',
      icon_url: '',
      criteria_xp: '',
      criteria_tests: '',
      criteria_streak: '',
      is_active: true
    });
    setShowBadgeModal(true);
  };

  const handleEditBadgeClick = (badge) => {
    setEditingBadge(badge);
    setBadgeForm({
      name: badge.name || '',
      description: badge.description || '',
      badge_type: badge.badge_type || 'achievement',
      icon_url: badge.icon_url || '',
      criteria_xp: badge.criteria_xp || '',
      criteria_tests: badge.criteria_tests || '',
      criteria_streak: badge.criteria_streak || '',
      is_active: badge.is_active !== undefined ? badge.is_active : true
    });
    setShowBadgeModal(true);
  };

  const handleBadgeSubmit = async (e) => {
    e.preventDefault();
    if (!badgeForm.name) {
      toast.error('Badge name is required');
      return;
    }

    // Validate at least one criteria is set
    if (!badgeForm.criteria_xp && !badgeForm.criteria_tests && !badgeForm.criteria_streak) {
      toast.error('Please set at least one award criteria (XP, Tests, or Streak)');
      return;
    }

    try {
      setSavingBadge(true);
      const payload = {
        ...badgeForm,
        criteria_xp: badgeForm.criteria_xp ? parseInt(badgeForm.criteria_xp) : null,
        criteria_tests: badgeForm.criteria_tests ? parseInt(badgeForm.criteria_tests) : null,
        criteria_streak: badgeForm.criteria_streak ? parseInt(badgeForm.criteria_streak) : null
      };

      if (editingBadge) {
        await API.put(`/api/gamification/badges/${editingBadge.id}`, payload);
        toast.success('Badge updated successfully!');
      } else {
        await API.post('/api/gamification/badges', payload);
        toast.success('Badge created successfully!');
      }

      setShowBadgeModal(false);
      setEditingBadge(null);
      fetchBadges();
    } catch (error) {
      console.error('Badge save error:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || `Failed to ${editingBadge ? 'update' : 'create'} badge`);
    } finally {
      setSavingBadge(false);
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!window.confirm('Are you sure you want to delete this badge?')) return;

    try {
      await API.delete(`/api/gamification/badges/${badgeId}`);
      toast.success('Badge deleted successfully');
      fetchBadges();
    } catch (error) {
      console.error('Delete badge error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete badge');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Gamification Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage badges, XP rules, and view leaderboard
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'badges' && (
              <button 
                onClick={handleCreateBadgeClick}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus size={18} />
                Create Badge
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'badges'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Award className="w-4 h-4 inline mr-2" />
              Badges
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'leaderboard'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('xp-rules')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'xp-rules'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              XP Rules
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'badges' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading badges...</p>
                </div>
              ) : badges.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No badges found</p>
                  <p className="text-gray-400 text-sm mt-2">Create your first badge to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-6 h-6 text-yellow-500" />
                          <span className="font-semibold">{badge.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditBadgeClick(badge)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Edit badge"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBadge(badge.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete badge"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading leaderboard...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No leaderboard data</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">XP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badges</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaderboard.map((student, index) => (
                        <tr key={student.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-yellow-600">#{index + 1}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.totalXP || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.level || 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.badgeCount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'xp-rules' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">XP Rules Configuration</h4>
                <p className="text-sm text-gray-600">Configure XP points for different activities</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Complete Mock Test</span>
                    <input type="number" defaultValue="100" className="w-20 px-2 py-1 border rounded" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Daily Practice</span>
                    <input type="number" defaultValue="10" className="w-20 px-2 py-1 border rounded" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Streak Bonus</span>
                    <input type="number" defaultValue="5" className="w-20 px-2 py-1 border rounded" />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Save Rules
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBadge ? 'Edit Badge' : 'Create Badge'}
              </h2>
              <button
                onClick={() => {
                  setShowBadgeModal(false);
                  setEditingBadge(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleBadgeSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={badgeForm.name}
                  onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  placeholder="e.g., First Test Completed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={badgeForm.description}
                  onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  placeholder="Describe what this badge represents"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge Type
                </label>
                <select
                  value={badgeForm.badge_type}
                  onChange={(e) => setBadgeForm({ ...badgeForm, badge_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                >
                  <option value="achievement">Achievement</option>
                  <option value="milestone">Milestone</option>
                  <option value="streak">Streak</option>
                  <option value="special">Special</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon URL (Optional)
                </label>
                <input
                  type="url"
                  value={badgeForm.icon_url}
                  onChange={(e) => setBadgeForm({ ...badgeForm, icon_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  placeholder="https://example.com/badge-icon.png"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Award Criteria (At least one required)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum XP Required
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={badgeForm.criteria_xp}
                      onChange={(e) => setBadgeForm({ ...badgeForm, criteria_xp: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="e.g., 1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Tests Completed
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={badgeForm.criteria_tests}
                      onChange={(e) => setBadgeForm({ ...badgeForm, criteria_tests: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Streak Days
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={badgeForm.criteria_streak}
                      onChange={(e) => setBadgeForm({ ...badgeForm, criteria_streak: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="e.g., 7"
                    />
                  </div>
                </div>
              </div>

              {editingBadge && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={badgeForm.is_active}
                      onChange={(e) => setBadgeForm({ ...badgeForm, is_active: e.target.checked })}
                      className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={savingBadge}
                  className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {savingBadge 
                    ? (editingBadge ? 'Updating...' : 'Creating...') 
                    : (editingBadge ? 'Update Badge' : 'Create Badge')
                  }
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBadgeModal(false);
                    setEditingBadge(null);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

