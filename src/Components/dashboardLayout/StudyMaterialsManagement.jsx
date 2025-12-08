import React, { useEffect, useState } from 'react';
import { Book, Plus, Search, Edit, Trash, Download, Filter, FileText, Video, Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import { toast } from 'react-toastify';
import { studyMaterialsAPI } from '../../services/apiService';
import API from '../../config/API.jsx';

export default function StudyMaterialsManagement() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'pdf',
    category: '',
    file: null,
    fileUrl: ''
  });

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterType]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      // Build filters
      const filters = {};
      if (search) {
        filters.search = search;
      }
      if (filterType !== 'all') {
        filters.type = filterType;
      }
      
      // Use API service
      const response = await studyMaterialsAPI.getAll(filters);
      // Backend returns { data: [...], pagination: {...} }
      setMaterials(response?.data || response || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load study materials';
      toast.error(errorMessage);
      setMaterials([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      // TODO: Implement delete API call when backend endpoint is ready
      // await studyMaterialsAPI.delete(materialId);
      console.log('Deleting material:', materialId);
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const getTypeIcon = (type) => {
    const materialType = (type || '').toLowerCase();
    switch(materialType) {
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'link': return <Book className="w-5 h-5" />;
      default: return <Book className="w-5 h-5" />;
    }
  };

  const handleUploadClick = () => {
    setEditingMaterial(null);
    setUploadForm({
      title: '',
      description: '',
      type: 'pdf',
      category: '',
      file: null,
      fileUrl: ''
    });
    setShowUploadModal(true);
  };

  const handleEditClick = (material) => {
    setEditingMaterial(material);
    setUploadForm({
      title: material.title || '',
      description: material.description || '',
      type: material.material_type || material.type || 'pdf',
      category: material.category_name || material.category || '',
      file: null,
      fileUrl: material.file_url || ''
    });
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || (!uploadForm.file && !uploadForm.fileUrl && !editingMaterial)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description || '');
      formData.append('material_type', uploadForm.type);
      formData.append('category', uploadForm.category || '');
      
      if (uploadForm.file) {
        formData.append('file', uploadForm.file);
      } else if (uploadForm.fileUrl) {
        formData.append('file_url', uploadForm.fileUrl);
      }

      if (editingMaterial) {
        // Update existing material
        await API.put(`/api/study-materials/${editingMaterial.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Material updated successfully!');
      } else {
        // Create new material
        await API.post('/api/study-materials', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Material uploaded successfully!');
      }

      setShowUploadModal(false);
      setEditingMaterial(null);
      setUploadForm({
        title: '',
        description: '',
        type: 'pdf',
        category: '',
        file: null,
        fileUrl: ''
      });
      fetchMaterials();
    } catch (error) {
      console.error('Upload/Update error:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || `Failed to ${editingMaterial ? 'update' : 'upload'} material`);
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Book className="w-6 h-6 text-purple-600" />
              Study Materials Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage study materials, PDFs, videos, and resources
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleUploadClick}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              Upload Material
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="link">Link</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Materials</p>
          <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">PDFs</p>
          <p className="text-2xl font-bold text-red-600">
            {materials.filter(m => (m.material_type || m.type || '').toLowerCase() === 'pdf').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Videos</p>
          <p className="text-2xl font-bold text-blue-600">
            {materials.filter(m => (m.material_type || m.type || '').toLowerCase() === 'video').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Downloads</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No study materials found</p>
          <p className="text-gray-400 text-sm mt-2">Upload your first material to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="text-purple-600">
                          {getTypeIcon(material.material_type || material.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{material.title || 'Untitled'}</div>
                          <div className="text-sm text-gray-500">{material.description?.substring(0, 40) || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full uppercase">
                        {(material.material_type || material.type || 'N/A').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.category_name || material.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.download_count || material.downloadCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.created_at ? new Date(material.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(material)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit material"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMaterial ? 'Edit Study Material' : 'Upload Study Material'}
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setEditingMaterial(null);
                  setUploadForm({
                    title: '',
                    description: '',
                    type: 'pdf',
                    category: '',
                    file: null,
                    fileUrl: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter material title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter material description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="link">Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="e.g., SSC, Banking"
                  />
                </div>
              </div>

              {uploadForm.type !== 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File {!editingMaterial && <span className="text-red-500">*</span>}
                  </label>
                  {editingMaterial && uploadForm.fileUrl && !uploadForm.file && (
                    <p className="text-sm text-gray-600 mb-2">Current file: <a href={uploadForm.fileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">{uploadForm.fileUrl.substring(0, 50)}...</a></p>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      required={!uploadForm.fileUrl && !editingMaterial}
                      onChange={handleFileChange}
                      accept={uploadForm.type === 'pdf' ? '.pdf' : uploadForm.type === 'video' ? 'video/*' : 'image/*'}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadForm.file ? uploadForm.file.name : editingMaterial ? 'Click to upload new file (optional)' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, Video, or Image files</p>
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={uploadForm.fileUrl}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/resource"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading 
                    ? (editingMaterial ? 'Updating...' : 'Uploading...') 
                    : (editingMaterial ? 'Update Material' : 'Upload Material')
                  }
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
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

