import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  GraduationCap, 
  Briefcase, 
  Home, 
  Camera,
  UserCircle,
  Calendar,
  MapPin,
  Building,
  CheckCircle,
  X,
  Upload,
  Info,
  Shield,
  Sparkles
} from "lucide-react";
import { studentAPI } from "../services/apiService";
import logo from "../assets/Icon.jpeg";

export default function StudentRegister() {
  const [formData, setFormData] = useState({
    Batch: "",
    name: "",
    mobileNumber: "",
    whatsappNumber: "",
    email: "",
    password: "",
    gender: "",
    fathername: "",
    fatherOccupation: "",
    mothername: "",
    motherOccupation: "",
    Degree: "",
    Year_of_passing: "",
    working: "",
    workdesc: "",
    permanent_address: "",
    residential_address: "",
  });

  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Batch.trim()) newErrors.Batch = "Batch is required";
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = "Invalid mobile number";
    
    if (!formData.whatsappNumber.trim()) newErrors.whatsappNumber = "WhatsApp number is required";
    else if (!/^[0-9]{10}$/.test(formData.whatsappNumber)) newErrors.whatsappNumber = "Invalid WhatsApp number";
    
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.fathername.trim()) newErrors.fathername = "Father's name is required";
    if (!formData.mothername.trim()) newErrors.mothername = "Mother's name is required";
    if (!formData.Degree.trim()) newErrors.Degree = "Degree is required";
    if (!formData.Year_of_passing.trim()) newErrors.Year_of_passing = "Year of passing is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setProfilePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "profile");
      data.append("folder", "students/profiles");

      const res = await fetch("https://api.cloudinary.com/v1_1/dfrfq0ch8/image/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await res.json();
      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";
      if (profilePhoto) {
        imageUrl = await uploadToCloudinary(profilePhoto);
      }

      await studentAPI.register({
        ...formData,
        profilePhoto: imageUrl,
      });

      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration failed", err);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate form completion percentage
  const calculateProgress = () => {
    const totalFields = 14;
    const filledFields = Object.values(formData).filter(value => value && value.toString().trim() !== '').length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full">
        {/* Header Section - Enhanced */}
        <div className="text-center py-6 md:py-8 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl mb-4 border-2 border-white/30">
              <img className="w-14 h-14 md:w-18 md:h-18 rounded-2xl object-cover" src={logo} alt="Logo" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
              Student Registration
            </h1>
            <p className="text-base md:text-lg text-blue-100 mb-4">Create your account to get started with exams</p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mt-6">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-blue-100">Form Progress</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-green-400 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-2xl">
          <div className="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10 max-w-7xl mx-auto">
            {/* Personal Information Section */}
            <SectionHeader 
              icon={<UserCircle className="w-4 h-4 md:w-5 md:h-5" />} 
              title="Personal Information" 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <FormInput
                label="Batch"
                name="Batch"
                icon={<Calendar className="w-4 h-4" />}
                value={formData.Batch}
                onChange={handleChange}
                placeholder="e.g. 2021 - 2025"
                error={errors.Batch}
                required
              />
              <FormInput
                label="Full Name"
                name="name"
                icon={<User className="w-4 h-4" />}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                error={errors.name}
                required
              />
              <FormInput
                label="Mobile Number"
                name="mobileNumber"
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength="10"
                error={errors.mobileNumber}
                required
              />
              <FormInput
                label="WhatsApp Number"
                name="whatsappNumber"
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="10-digit WhatsApp number"
                maxLength="10"
                error={errors.whatsappNumber}
                required
              />
              <FormInput
                label="Email"
                name="email"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                error={errors.email}
                required
              />
              <FormInput
                label="Password"
                name="password"
                type="password"
                icon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                error={errors.password}
                required
              />
              <SelectInput
                label="Gender"
                name="gender"
                icon={<User className="w-4 h-4" />}
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select Gender" },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
                error={errors.gender}
                required
              />
            </div>

            {/* Parent Information Section */}
            <SectionHeader 
              icon={<User className="w-4 h-4 md:w-5 md:h-5" />} 
              title="Parent Information" 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <FormInput
                label="Father's Name"
                name="fathername"
                icon={<User className="w-4 h-4" />}
                value={formData.fathername}
                onChange={handleChange}
                placeholder="Father's full name"
                error={errors.fathername}
                required
              />
              <FormInput
                label="Father's Occupation"
                name="fatherOccupation"
                icon={<Briefcase className="w-4 h-4" />}
                value={formData.fatherOccupation}
                onChange={handleChange}
                placeholder="Occupation"
                error={errors.fatherOccupation}
              />
              <FormInput
                label="Mother's Name"
                name="mothername"
                icon={<User className="w-4 h-4" />}
                value={formData.mothername}
                onChange={handleChange}
                placeholder="Mother's full name"
                error={errors.mothername}
                required
              />
              <FormInput
                label="Mother's Occupation"
                name="motherOccupation"
                icon={<Briefcase className="w-4 h-4" />}
                value={formData.motherOccupation}
                onChange={handleChange}
                placeholder="Occupation"
                error={errors.motherOccupation}
              />
            </div>

            {/* Academic Information Section */}
            <SectionHeader 
              icon={<GraduationCap className="w-4 h-4 md:w-5 md:h-5" />} 
              title="Academic Information" 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <FormInput
                label="Degree"
                name="Degree"
                icon={<GraduationCap className="w-4 h-4" />}
                value={formData.Degree}
                onChange={handleChange}
                placeholder="e.g. B.E. Civil Engineering"
                error={errors.Degree}
                required
              />
              <FormInput
                label="Year of Passing"
                name="Year_of_passing"
                icon={<Calendar className="w-4 h-4" />}
                value={formData.Year_of_passing}
                onChange={handleChange}
                placeholder="e.g. 2025"
                error={errors.Year_of_passing}
                required
              />
              <SelectInput
                label="Are You Working?"
                name="working"
                icon={<Briefcase className="w-4 h-4" />}
                value={formData.working}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select Option" },
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
                error={errors.working}
              />
              <FormInput
                label="Work Description"
                name="workdesc"
                icon={<Building className="w-4 h-4" />}
                value={formData.workdesc}
                onChange={handleChange}
                placeholder="Job description (if working)"
                error={errors.workdesc}
                disabled={formData.working === "No"}
              />
            </div>

            {/* Address Information Section */}
            <SectionHeader 
              icon={<MapPin className="w-4 h-4 md:w-5 md:h-5" />} 
              title="Address Information" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="flex flex-col group">
                <label htmlFor="permanent_address" className="text-sm md:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                    <Home className="w-4 h-4" />
                  </div>
                  <span>Permanent Address</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 md:left-4 top-4 transform text-gray-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <textarea
                    id="permanent_address"
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    placeholder="Complete permanent address"
                    rows={3}
                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md border-gray-300 hover:border-blue-300 focus:bg-blue-50/30 resize-none"
                  />
                  {formData.permanent_address && (
                    <div className="absolute right-3 top-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col group">
                <label htmlFor="residential_address" className="text-sm md:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                    <Home className="w-4 h-4" />
                  </div>
                  <span>Residential Address</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 md:left-4 top-4 transform text-gray-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <textarea
                    id="residential_address"
                    name="residential_address"
                    value={formData.residential_address}
                    onChange={handleChange}
                    placeholder="Current residential address"
                    rows={3}
                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md border-gray-300 hover:border-blue-300 focus:bg-blue-50/30 resize-none"
                  />
                  {formData.residential_address && (
                    <div className="absolute right-3 top-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Photo Section */}
            <SectionHeader 
              icon={<Camera className="w-4 h-4 md:w-5 md:h-5" />} 
              title="Profile Photo" 
            />
            <div className="mb-6 md:mb-8">
              <PhotoUpload
                previewUrl={previewUrl}
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileChange={(e) => handleFileChange(e.target.files[0])}
                onRemove={() => {
                  setProfilePhoto(null);
                  setPreviewUrl("");
                }}
              />
            </div>

            {/* Submit Button Section */}
            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t-2 border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 border-2 border-blue-100">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-sm md:text-base text-gray-700 mb-1">
                      Already have an account?
                    </p>
                    <Link 
                      to="/login" 
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors inline-flex items-center gap-1 text-sm md:text-base"
                    >
                      <User className="w-4 h-4" />
                      Login here
                    </Link>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 text-base md:text-lg font-bold rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent"></div>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                        <span>Register Now</span>
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Your information is secure and will be kept confidential</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 pb-3 md:pb-4 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-t-xl px-4 py-3 -mx-4 md:-mx-8 lg:-mx-12 shadow-sm">
      <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
        {icon}
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
    </div>
  );
}

// Form Input Component
function FormInput({ 
  label, 
  name, 
  type = "text", 
  icon, 
  placeholder = "", 
  value, 
  onChange, 
  error,
  required = false,
  maxLength,
  ...props 
}) {
  return (
    <div className="flex flex-col group">
      <label htmlFor={name} className="text-sm md:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <div className={`p-1.5 rounded-lg transition-colors ${error ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'}`}>
          {icon}
        </div>
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <div className="relative">
        <div className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
          error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-600'
        }`}>
          {icon}
        </div>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          required={required}
          disabled={props.disabled}
          className={`w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 text-sm md:text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm ${
            props.disabled
              ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              : error 
                ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500 hover:shadow-md" 
                : "border-gray-300 bg-white hover:border-blue-300 focus:bg-blue-50/30 hover:shadow-md"
          }`}
          {...props}
        />
        {value && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-700">{error}</p>
        </div>
      )}
      {!error && placeholder && (
        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {placeholder}
        </p>
      )}
    </div>
  );
}

// Select Input Component
function SelectInput({ 
  label, 
  name, 
  icon, 
  value, 
  onChange, 
  options, 
  error,
  required = false 
}) {
  return (
    <div className="flex flex-col group">
      <label htmlFor={name} className="text-sm md:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <div className={`p-1.5 rounded-lg transition-colors ${error ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'}`}>
          {icon}
        </div>
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <div className="relative">
        <div className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors ${
          error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-600'
        }`}>
          {icon}
        </div>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-3.5 text-sm md:text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none bg-white shadow-sm hover:shadow-md cursor-pointer ${
            error 
              ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 hover:border-blue-300 focus:bg-blue-50/30"
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={`absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors ${
          error ? 'text-red-400' : 'text-gray-400'
        }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {value && !error && value !== "" && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

// Photo Upload Component
function PhotoUpload({ 
  previewUrl, 
  isDragging, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onFileChange, 
  onRemove 
}) {
  return (
    <div className="flex flex-col items-center w-full">
      {previewUrl ? (
        <div className="relative group">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gradient-to-r from-blue-400 to-purple-400 shadow-2xl ring-4 ring-blue-100"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Profile photo uploaded</p>
            <button
              type="button"
              onClick={() => document.querySelector('input[type="file"]')?.click()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change Photo
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${
            isDragging
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-xl"
              : "border-gray-300 hover:border-blue-400 bg-gradient-to-br from-gray-50 to-blue-50/30 hover:shadow-lg"
          }`}
        >
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className={`p-4 md:p-6 rounded-full transition-all duration-300 ${
              isDragging 
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 scale-110" 
                : "bg-gradient-to-br from-blue-100 to-indigo-100"
            }`}>
              <Camera className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${
                isDragging ? "text-white" : "text-blue-600"
              }`} />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                {isDragging ? "Drop your photo here" : "Upload Profile Photo"}
              </p>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Drag & drop your photo here, or{" "}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold underline decoration-2 underline-offset-2">
                  browse files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>PNG, JPG up to 5MB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
