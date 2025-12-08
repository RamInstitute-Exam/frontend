import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Users,
  Star,
  Calendar,
  ChevronRight,
  Grid,
  List
} from 'lucide-react';
import { testSeriesAPI } from '../../services/apiService';
import { toast } from 'react-toastify';

const TestListingPage = () => {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [language, setLanguage] = useState('english');

  useEffect(() => {
    fetchCategories();
    fetchTests();
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const data = await testSeriesAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTests = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const response = await testSeriesAPI.getMockTests(filters);
      setTests(response.data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'tamil' ? 'தேர்வு தொடர்' : 'Test Series'}
          </h1>
          <p className="text-gray-600">
            {language === 'tamil' 
              ? 'TNPSC, அரசு தேர்வுகள் மற்றும் போட்டித் தேர்வுகளுக்கு தயாராகுங்கள்'
              : 'Prepare for TNPSC, Government and Competitive Exams'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'tamil' ? 'தேர்வுகளைத் தேடுங்கள்...' : 'Search tests...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">{language === 'tamil' ? 'அனைத்து வகைகள்' : 'All Categories'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Test Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tests.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {tests.map((test) => (
              <TestCard key={test.id} test={test} viewMode={viewMode} language={language} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'tamil' ? 'தேர்வுகள் எதுவும் கிடைக்கவில்லை' : 'No tests found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Test Card Component
const TestCard = ({ test, viewMode, language }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
            <p className="text-gray-600 mb-3">{test.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {test.duration_minutes} {language === 'tamil' ? 'நிமிடங்கள்' : 'mins'}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {test.total_questions} {language === 'tamil' ? 'கேள்விகள்' : 'questions'}
              </span>
              {test.test_series_title && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {test.test_series_title}
                </span>
              )}
            </div>
          </div>
          <Link
            to={`/student/test/${test.exam_code}/instructions`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            {language === 'tamil' ? 'தொடங்க' : 'Start Test'}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{test.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{test.description}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {language === 'tamil' ? 'காலம்' : 'Duration'}
            </span>
            <span className="font-medium text-gray-900">{test.duration_minutes} {language === 'tamil' ? 'நிமிடங்கள்' : 'mins'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {language === 'tamil' ? 'கேள்விகள்' : 'Questions'}
            </span>
            <span className="font-medium text-gray-900">{test.total_questions}</span>
          </div>
          {test.category_name && (
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs inline-block">
              {test.category_name}
            </div>
          )}
        </div>

        <Link
          to={`/student/test/${test.exam_code}/instructions`}
          className="block w-full text-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {language === 'tamil' ? 'தேர்வு தொடங்க' : 'Start Test'}
        </Link>
      </div>
    </div>
  );
};

export default TestListingPage;

