import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  // Briefcase, // Not currently used
  // BookOpen, // Commented out - Saved tab not implemented
  // Award, // Commented out - Gamification not implemented
  // Star, // Commented out - Gamification not implemented
  // Flame, // Commented out - Gamification not implemented
  Edit,
  Save,
  X,
  Clock,
  CheckCircle2,
  FileText,
  Trophy,
  XCircle
} from 'lucide-react';
import { profileAPI } from '../../services/apiService';
import { toast } from 'react-toastify';

const EnhancedProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState('english');

  const studentId = localStorage.getItem('userId');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getProfile(studentId);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await profileAPI.updateProfile(studentId, {
        name: profile.student.name,
        email: profile.student.email,
        mobileNumber: profile.student.mobileNumber,
        whatsappNumber: profile.student.whatsappNumber
      });
      toast.success(language === 'tamil' ? 'சுயவிவரம் புதுப்பிக்கப்பட்டது' : 'Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };


  useEffect(() => {
    if (studentId) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  const student = profile.student || {};
  const testHistory = profile.testHistory || [];
  // const savedMaterials = profile.savedMaterials || []; // Not currently implemented
  // const gamification = profile.gamification || {}; // Not currently implemented

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'tamil' ? 'சுயவிவரம்' : 'My Profile'}
              </h1>
              <p className="text-gray-600">
                {language === 'tamil'
                  ? 'உங்கள் தகவல்கள் மற்றும் வரலாறு'
                  : 'Your information and history'}
              </p>
            </div>
            <div className="flex items-center gap-2">
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

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              {/* Profile Photo */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {student.profilePhoto ? (
                    <img
                      src={student.profilePhoto}
                      alt={student.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center border-4 border-blue-200">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {editing && (
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">{student.name}</h2>
                <p className="text-gray-600">{student.email}</p>
              </div>

              {/* Quick Stats - Currently showing exam history summary */}
              <div className="space-y-3 mb-6">
                <StatItem
                  icon={<FileText className="w-5 h-5" />}
                  label={language === 'tamil' ? 'மொத்த தேர்வுகள்' : 'Total Exams'}
                  value={testHistory.length || 0}
                />
                {testHistory.length > 0 && (
                  <>
                    <StatItem
                      icon={<CheckCircle2 className="w-5 h-5" />}
                      label={language === 'tamil' ? 'சராசரி மதிப்பெண்' : 'Average Score'}
                      value={`${(testHistory.reduce((sum, test) => sum + parseFloat(test.percentage || 0), 0) / testHistory.length).toFixed(1)}%`}
                    />
                    <StatItem
                      icon={<Trophy className="w-5 h-5" />}
                      label={language === 'tamil' ? 'மிக உயர்ந்த மதிப்பெண்' : 'Highest Score'}
                      value={`${Math.max(...testHistory.map(test => parseFloat(test.percentage || 0))).toFixed(1)}%`}
                    />
                  </>
                )}
              </div>

              {/* Quick Actions - Only show implemented features */}
              <div className="space-y-2">
                <Link
                  to="/student/batches"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
                >
                  {language === 'tamil' ? 'தொகுப்புகளைக் காண்க' : 'View Batches'}
                </Link>
                <Link
                  to="/student/exam-history"
                  className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center font-medium"
                >
                  {language === 'tamil' ? 'தேர்வு வரலாறு' : 'Exam History'}
                </Link>
              </div>

              {/* Commented out - Not currently implemented */}
              {/* <div className="space-y-2">
                <Link
                  to="/student/gamification"
                  className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center font-medium"
                >
                  {language === 'tamil' ? 'விளையாட்டு முறை' : 'View Gamification'}
                </Link>
                <Link
                  to="/student/analytics"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
                >
                  {language === 'tamil' ? 'பகுப்பாய்வு' : 'View Analytics'}
                </Link>
              </div> */}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'overview', label: language === 'tamil' ? 'கண்ணோட்டம்' : 'Overview', icon: User },
                  { id: 'history', label: language === 'tamil' ? 'தேர்வு வரலாறு' : 'Exam History', icon: Clock }
                  // { id: 'saved', label: language === 'tamil' ? 'சேமிக்கப்பட்டது' : 'Saved', icon: BookOpen } // Not currently implemented
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <OverviewTab
                    student={student}
                    editing={editing}
                    setEditing={setEditing}
                    onSave={handleSaveProfile}
                    language={language}
                  />
                )}

                {/* History Tab - Exam History (Currently Implemented) */}
                {activeTab === 'history' && (
                  <HistoryTab
                    testHistory={testHistory}
                    language={language}
                  />
                )}

                {/* Saved Tab - Not currently implemented */}
                {/* {activeTab === 'saved' && (
                  <SavedTab
                    savedMaterials={savedMaterials}
                    language={language}
                  />
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
};

const OverviewTab = ({ student, editing, setEditing, onSave, language }) => {
  const [formData, setFormData] = useState({
    name: student.name || '',
    email: student.email || '',
    mobileNumber: student.mobileNumber || '',
    whatsappNumber: student.whatsappNumber || ''
  });

  useEffect(() => {
    setFormData({
      name: student.name || '',
      email: student.email || '',
      mobileNumber: student.mobileNumber || '',
      whatsappNumber: student.whatsappNumber || ''
    });
  }, [student]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          {language === 'tamil' ? 'அடிப்படை தகவல்கள்' : 'Basic Information'}
        </h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {language === 'tamil' ? 'திருத்த' : 'Edit'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {language === 'tamil' ? 'சேமிக்க' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {language === 'tamil' ? 'ரத்துசெய்' : 'Cancel'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField
          icon={<User className="w-5 h-5" />}
          label={language === 'tamil' ? 'முழு பெயர்' : 'Full Name'}
          value={formData.name}
          editing={editing}
          onChange={(value) => setFormData({ ...formData, name: value })}
        />
        <InfoField
          icon={<Mail className="w-5 h-5" />}
          label={language === 'tamil' ? 'மின்னஞ்சல்' : 'Email'}
          value={formData.email}
          editing={editing}
          onChange={(value) => setFormData({ ...formData, email: value })}
        />
        <InfoField
          icon={<Phone className="w-5 h-5" />}
          label={language === 'tamil' ? 'மொபைல் எண்' : 'Mobile Number'}
          value={formData.mobileNumber}
          editing={editing}
          onChange={(value) => setFormData({ ...formData, mobileNumber: value })}
        />
        <InfoField
          icon={<Phone className="w-5 h-5" />}
          label={language === 'tamil' ? 'வாட்ஸ்அப் எண்' : 'WhatsApp Number'}
          value={formData.whatsappNumber}
          editing={editing}
          onChange={(value) => setFormData({ ...formData, whatsappNumber: value })}
        />
        <InfoField
          icon={<GraduationCap className="w-5 h-5" />}
          label={language === 'tamil' ? 'பட்டம்' : 'Degree'}
          value={student.degree || 'N/A'}
          editing={false}
        />
        <InfoField
          icon={<Calendar className="w-5 h-5" />}
          label={language === 'tamil' ? 'படிப்பு ஆண்டு' : 'Year of Passing'}
          value={student.yearOfPassing || 'N/A'}
          editing={false}
        />
        <InfoField
          icon={<MapPin className="w-5 h-5" />}
          label={language === 'tamil' ? 'நிரந்தர முகவரி' : 'Permanent Address'}
          value={student.permanentAddress || 'N/A'}
          editing={false}
          fullWidth
        />
      </div>
    </div>
  );
};

const InfoField = ({ icon, label, value, editing, onChange, fullWidth }) => {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      {editing && onChange ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      ) : (
        <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">{value}</p>
      )}
    </div>
  );
};

const HistoryTab = ({ testHistory, language }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {language === 'tamil' ? 'தேர்வு வரலாறு' : 'Test History'}
      </h3>
      {testHistory.length > 0 ? (
        <div className="space-y-3">
          {testHistory.map((test) => (
            <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{test.test_title || test.exam_code}</h4>
                  {test.category_name && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mb-2 inline-block">
                      {test.category_name}
                    </span>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(test.submitted_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {test.correct_count} {language === 'tamil' ? 'சரி' : 'Correct'}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      {test.wrong_count} {language === 'tamil' ? 'தவறு' : 'Wrong'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    parseFloat(test.percentage) >= 70 ? 'text-green-600' :
                    parseFloat(test.percentage) >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {parseFloat(test.percentage).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {test.obtained_marks} / {test.total_marks} {language === 'tamil' ? 'மதிப்பெண்கள்' : 'marks'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {language === 'tamil' ? 'தேர்வு வரலாறு இல்லை' : 'No test history'}
          </p>
        </div>
      )}
    </div>
  );
};

// SavedTab component - Not currently implemented
// const SavedTab = ({ savedMaterials, language }) => {
//   return (
//     <div>
//       <h3 className="text-xl font-bold text-gray-900 mb-4">
//         {language === 'tamil' ? 'சேமிக்கப்பட்ட பொருட்கள்' : 'Saved Materials'}
//       </h3>
//       {savedMaterials.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {savedMaterials.map((material) => (
//             <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
//               <div className="flex items-start justify-between mb-2">
//                 <h4 className="font-semibold text-gray-900 flex-1">{material.title}</h4>
//                 <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
//               </div>
//               <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
//               <div className="flex items-center justify-between text-xs text-gray-500">
//                 <span>{material.category_name || 'General'}</span>
//                 <span>{new Date(material.saved_at).toLocaleDateString()}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-500">
//             {language === 'tamil' ? 'சேமிக்கப்பட்ட பொருட்கள் இல்லை' : 'No saved items'}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };


export default EnhancedProfile;

