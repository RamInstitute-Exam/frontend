import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../services/apiService";

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "student",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(
        formData.email,
        formData.password,
        formData.userType
      );

      if (response.success) {
        // Store user info in localStorage
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userType", response.user.userType);
        
        // Store roles and permissions for easy access
        if (response.user.roles) {
          localStorage.setItem("userRoles", JSON.stringify(response.user.roles));
        }

        // Remember me functionality
        if (formData.rememberMe) {
          localStorage.setItem("rememberEmail", formData.email);
        } else {
          localStorage.removeItem("rememberEmail");
        }

        toast.success("Login Successful!");
        
        // Redirect based on user type
        setTimeout(() => {
          if (formData.userType === "admin") {
            navigate("/admin");
          } else {
            navigate("/student");
          }
        }, 100);
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 404) {
        toast.error("User not found");
      } else if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Login Form (55%) */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-12 lg:py-16">
        <div className="w-full max-w-lg xl:max-w-xl min-h-[600px] flex flex-col justify-center">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              WELCOME BACK
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-8">
            <label className="block text-base font-medium text-gray-700 mb-3">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: "student" })}
                className={`py-3.5 px-6 rounded-lg font-semibold transition-all text-base ${
                  formData.userType === "student"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: "admin" })}
                className={`py-3.5 px-6 rounded-lg font-semibold transition-all text-base ${
                  formData.userType === "admin"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                onChange={handleChange}
                value={formData.email}
                className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                onChange={handleChange}
                value={formData.password}
                className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-2 text-base text-gray-700">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-base text-gray-600 hover:text-red-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-semibold rounded-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>

          </form>

          {/* Register Link - Only for Students */}
          {formData.userType === "student" && (
            <div className="mt-8 text-center">
              <p className="text-base text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/student-Register"
                  className="text-red-600 font-semibold hover:text-red-700 underline"
                >
                  Sign up for free!
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Professional Illustration (45%) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-red-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        {/* Professional Illustration Content */}
        <div className="relative z-10 w-full max-w-lg">
          {/* Main Professional Icon */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              {/* Large Book Icon with Professional Design */}
              <div className="w-48 h-48 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-28 h-28 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              
              {/* Success Checkmark Badge */}
              <div className="absolute -top-2 -right-2 w-14 h-14 bg-red-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Lightning Badge */}
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-red-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Professional Text Content */}
          <div className="text-center space-y-6">
            <h3 className="text-3xl font-bold text-gray-900 leading-tight">
              Your Success Journey Starts Here
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
              Join thousands of students preparing for their exams with Ram Institute's comprehensive platform
            </p>
          </div>

          {/* Professional Feature Cards */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">Study Materials</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">GK Questions</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">Civil Questions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
