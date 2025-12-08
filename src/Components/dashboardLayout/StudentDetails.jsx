import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Mail, Phone, GraduationCap, Calendar, MapPin, Briefcase, Users, User } from 'lucide-react';
import { studentAPI } from '../../services/apiService';
import { toast } from 'react-toastify';

export default function StudentDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchStudentDetails();
    // Check if edit mode is requested via query parameter
    if (searchParams.get('edit') === 'true') {
      setIsEdit(true);
    }
  }, [studentId, searchParams]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getList();
      const studentsData = Array.isArray(res) ? res : (res.students || []);
      const foundStudent = studentsData.find(
        s => (s.id || s._id)?.toString() === studentId?.toString()
      );
      
      if (foundStudent) {
        setStudent(foundStudent);
        setFormData(foundStudent);
      } else {
        toast.error('Student not found');
        navigate('/admin/users');
      }
    } catch (err) {
      console.error('Error fetching student:', err);
      toast.error('Failed to load student details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await studentAPI.update(student.id || student._id, formData);
      toast.success('Student updated successfully');
      fetchStudentDetails();
      setIsEdit(false);
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to update student');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
                <p className="text-sm text-gray-500 mt-1">View and manage student information</p>
              </div>
            </div>
            {!isEdit && (
              <button
                onClick={() => setIsEdit(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
              >
                <Pencil size={20} />
                Edit Student
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {isEdit ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Edit Student Information</h2>
                <button
                  onClick={() => {
                    setIsEdit(false);
                    setFormData(student);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    name="name"
                    value={formData.name || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    name="mobileNumber"
                    value={formData.mobileNumber || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                  <input
                    name="batch"
                    value={formData.batch || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                  <input
                    name="degree"
                    value={formData.degree || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                {formData.yearOfPassing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year of Passing</label>
                    <input
                      name="yearOfPassing"
                      value={formData.yearOfPassing || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsEdit(false);
                    setFormData(student);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="text-center pb-8 border-b border-gray-200">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-lg">
                  {student.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{student.name || 'N/A'}</h2>
                <p className="text-sm text-gray-500">Student ID: {student.id || student._id || 'N/A'}</p>
              </div>

              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                      <p className="text-base font-semibold text-gray-900 break-all">{student.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mobile Number</p>
                      <p className="text-base font-semibold text-gray-900">{student.mobileNumber || 'N/A'}</p>
                    </div>
                  </div>
                  {student.whatsappNumber && (
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex items-start gap-4">
                      <div className="bg-emerald-100 p-3 rounded-lg">
                        <Phone className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">WhatsApp Number</p>
                        <p className="text-base font-semibold text-gray-900">{student.whatsappNumber || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                  {student.gender && (
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex items-start gap-4">
                      <div className="bg-pink-100 p-3 rounded-lg">
                        <User className="w-6 h-6 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                        <p className="text-base font-semibold text-gray-900">{student.gender || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-6 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-200 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-700" />
                      </div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Batch</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{student.batch || 'N/A'}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-purple-200 p-2 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-purple-700" />
                      </div>
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Degree</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{student.degree || 'N/A'}</p>
                  </div>
                  {student.yearOfPassing && (
                    <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-200 p-2 rounded-lg">
                          <Calendar className="w-5 h-5 text-green-700" />
                        </div>
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Year of Passing</p>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{student.yearOfPassing || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Family Information Section */}
              {(student.fathername || student.mothername) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Family Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {student.fathername && (
                      <div className="bg-amber-50 rounded-lg p-5 border border-amber-100 flex items-start gap-4">
                        <div className="bg-amber-200 p-3 rounded-lg">
                          <User className="w-6 h-6 text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Father's Name</p>
                          <p className="text-base font-semibold text-amber-900">{student.fathername || 'N/A'}</p>
                          {student.fatherOccupation && (
                            <p className="text-sm text-amber-700 mt-2">Occupation: {student.fatherOccupation}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {student.mothername && (
                      <div className="bg-pink-50 rounded-lg p-5 border border-pink-100 flex items-start gap-4">
                        <div className="bg-pink-200 p-3 rounded-lg">
                          <User className="w-6 h-6 text-pink-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-pink-600 uppercase tracking-wide mb-1">Mother's Name</p>
                          <p className="text-base font-semibold text-pink-900">{student.mothername || 'N/A'}</p>
                          {student.motherOccupation && (
                            <p className="text-sm text-pink-700 mt-2">Occupation: {student.motherOccupation}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Address Information Section */}
              {(student.permanentAddress || student.residentialAddress) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {student.permanentAddress && (
                      <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100 flex items-start gap-4">
                        <div className="bg-indigo-200 p-3 rounded-lg">
                          <MapPin className="w-6 h-6 text-indigo-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-2">Permanent Address</p>
                          <p className="text-sm font-medium text-indigo-900 leading-relaxed">{student.permanentAddress || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                    {student.residentialAddress && (
                      <div className="bg-teal-50 rounded-lg p-5 border border-teal-100 flex items-start gap-4">
                        <div className="bg-teal-200 p-3 rounded-lg">
                          <MapPin className="w-6 h-6 text-teal-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-2">Residential Address</p>
                          <p className="text-sm font-medium text-teal-900 leading-relaxed">{student.residentialAddress || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Work Information Section */}
              {student.working && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex items-start gap-4">
                    <div className="bg-gray-200 p-3 rounded-lg">
                      <Briefcase className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Employment Status</p>
                      <p className="text-base font-semibold text-gray-900">{student.working || 'N/A'}</p>
                      {student.workdesc && (
                        <p className="text-sm text-gray-700 mt-3 leading-relaxed">{student.workdesc}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

