import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { authAPI } from "../services/apiService";
export default function AdminLogin() {
  const navigate = useNavigate();
  const [Form, setForm] = useState({
    email: "",
    password: "",
  });
const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...Form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    if (!Form.email || !Form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // Use unified login endpoint
      const response = await authAPI.login(
        Form.email,
        Form.password,
        "admin"
      );

      if (response.success) {
        // Store user info
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userType", "admin");
        if (response.user.roles) {
          localStorage.setItem("userRoles", JSON.stringify(response.user.roles));
        }

        console.log("Login successful:", response);
        toast.success("Login Successful!");
        setTimeout(() => {
          navigate("/admin");
        }, 50);
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        toast.error("User not Found");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    }
    finally{
    setLoading(false)
      
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md">
        {/* Logo + Heading */}
        <div className="text-center mb-6">
          {/* <img
            alt="Your Company"
            src={logo}
            className="mx-auto h-35 w-auto"
          /> */}
          <h2 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900">
            Sign in to your Admin Dashboard
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={handleChange}
              value={Form.email}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              onChange={handleChange}
              value={Form.password}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="Enter your password"
            />   
          </div>

           <button
    type="submit"
    disabled={loading}
    className={`w-full py-3 font-bold rounded-lg shadow transition duration-200 ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-indigo-600 hover:bg-indigo-500 text-white"
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
        Logging...
      </div>
    ) : (
      "Login"
    )}
  </button>
        </form>

      
      </div>
    </div>
  );
}
