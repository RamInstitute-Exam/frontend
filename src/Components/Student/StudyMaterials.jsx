import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  Download,
  Bookmark,
  BookmarkCheck,
  Eye,
  Calendar,
  Tag,
  Grid,
  List,
  File,
  Video,
  BookOpen,
  FileType
} from 'lucide-react';
import { studyMaterialsAPI, testSeriesAPI } from '../../services/apiService';
import { API_BASE_URL } from '../../config/API';
import { toast } from 'react-toastify';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [language, setLanguage] = useState('english');

  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    fetchCategories();
    fetchMaterials();
    if (studentId) {
      fetchBookmarks();
    }
  }, [selectedCategory, selectedType, searchTerm]);

  const fetchCategories = async () => {
    try {
      const data = await testSeriesAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (selectedType !== 'all') {
        filters.type = selectedType;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await studyMaterialsAPI.getAll(filters);
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const data = await studyMaterialsAPI.getBookmarks(studentId);
      setBookmarks(data.map(b => b.item_id));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleBookmark = async (materialId, isBookmarked) => {
    if (!studentId) {
      toast.warning(language === 'tamil' ? 'தயவுசெய்து உள்நுழையுங்கள்' : 'Please login first');
      return;
    }

    try {
      if (isBookmarked) {
        await studyMaterialsAPI.removeBookmark(studentId, 'material', materialId);
        setBookmarks(bookmarks.filter(id => id !== materialId));
        toast.success(language === 'tamil' ? 'புத்தகக்குறி நீக்கப்பட்டது' : 'Bookmark removed');
      } else {
        await studyMaterialsAPI.addBookmark({
          studentId,
          itemType: 'material',
          itemId: materialId
        });
        setBookmarks([...bookmarks, materialId]);
        toast.success(language === 'tamil' ? 'புத்தகக்குறி சேர்க்கப்பட்டது' : 'Bookmark added');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleDownload = async (materialId, title) => {
    try {
      // Since backend may redirect to Cloudinary, we'll use a direct approach
      // First try to get the file as blob (if server-side fetch succeeds)
      try {
        const blob = await studyMaterialsAPI.download(materialId);
        
        if (blob && blob.size > 0 && blob instanceof Blob) {
          // Determine file extension from blob type or default to pdf
          let fileExtension = 'pdf';
          if (blob.type) {
            if (blob.type.includes('pdf')) fileExtension = 'pdf';
            else if (blob.type.includes('video') || blob.type.includes('mp4')) fileExtension = 'mp4';
            else if (blob.type.includes('epub')) fileExtension = 'epub';
            else if (blob.type.includes('word') || blob.type.includes('document')) fileExtension = 'docx';
          }
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title}.${fileExtension}`;
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);
          
          toast.success(language === 'tamil' ? 'பதிவிறக்கம் தொடங்கப்பட்டது' : 'Download started');
          return;
        }
      } catch (blobError) {
        // If blob download fails (redirect response), use direct URL
        console.log('Blob download not available, using direct URL approach');
      }
      
      // Fallback: Open download URL directly (backend will redirect to Cloudinary)
      // Use centralized API_BASE_URL (always points to backend, e.g. http://localhost:5000)
      const base = (API_BASE_URL || '').replace(/\/+$/, ''); // remove trailing slashes
      const downloadUrl = `${base}/api/study-materials/download/${materialId}`;
      
      // Create a temporary link and click it to trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.download = `${title}.pdf`; // Default to PDF
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(language === 'tamil' ? 'பதிவிறக்கம் தொடங்கப்பட்டது' : 'Download started');
    } catch (error) {
      console.error('Error downloading:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to download material';
      toast.error(language === 'tamil' ? `பதிவிறக்க முடியவில்லை: ${errorMessage}` : `Failed to download: ${errorMessage}`);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'ebook':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-6 w-full">
        <div className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'tamil' ? 'படிப்பு பொருட்கள்' : 'Study Materials'}
              </h1>
              <p className="text-gray-600">
                {language === 'tamil'
                  ? 'PDF குறிப்புகள், வீடியோ விரிவுரைகள் மற்றும் புத்தகங்கள்'
                  : 'PDF Notes, Video Lectures, and E-books'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'english' ? 'tamil' : 'english')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
              >
                {language === 'english' ? 'தமிழ்' : 'English'}
              </button>
              <Link
                to="/student/bookmarks"
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium flex items-center gap-2"
              >
                <BookmarkCheck className="w-4 h-4" />
                {language === 'tamil' ? 'புத்தகக்குறிகள்' : 'Bookmarks'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'tamil' ? 'பொருட்களைத் தேடுங்கள்...' : 'Search materials...'}
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

            {/* Type Filter */}
            <div className="relative">
              <FileType className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">{language === 'tamil' ? 'அனைத்து வகைகள்' : 'All Types'}</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="ebook">E-book</option>
                <option value="notes">Notes</option>
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

        {/* Materials Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : materials.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
            : 'space-y-4'
          }>
            {materials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                viewMode={viewMode}
                language={language}
                isBookmarked={bookmarks.includes(material.id)}
                onBookmark={() => handleBookmark(material.id, bookmarks.includes(material.id))}
                onDownload={() => handleDownload(material.id, material.title)}
                getTypeIcon={getTypeIcon}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'tamil' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No materials found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const MaterialCard = ({ material, viewMode, language, isBookmarked, onBookmark, onDownload, getTypeIcon, formatFileSize }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              {getTypeIcon(material.material_type)}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{material.title}</h3>
            <p className="text-gray-600 mb-3 line-clamp-2">{material.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {material.category_name && (
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {material.category_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {material.view_count || 0} {language === 'tamil' ? 'பார்வைகள்' : 'views'}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                {material.download_count || 0} {language === 'tamil' ? 'பதிவிறக்கங்கள்' : 'downloads'}
              </span>
              {material.file_size && (
                <span>{formatFileSize(material.file_size)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBookmark}
              className={`p-3 rounded-lg transition-colors ${
                isBookmarked
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button
              onClick={onDownload}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      {material.thumbnail_url ? (
        <img
          src={material.thumbnail_url}
          alt={material.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <div className="text-blue-600">
            {getTypeIcon(material.material_type)}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{material.title}</h3>
            {material.category_name && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {material.category_name}
              </span>
            )}
          </div>
          <button
            onClick={onBookmark}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isBookmarked
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{material.description}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {material.view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {material.download_count || 0}
            </span>
          </div>
          {material.file_size && (
            <span>{formatFileSize(material.file_size)}</span>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={onDownload}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {language === 'tamil' ? 'பதிவிறக்க' : 'Download'}
        </button>
      </div>
    </div>
  );
};

export default StudyMaterials;

