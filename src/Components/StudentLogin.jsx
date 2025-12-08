import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../services/apiService";
export default function StudentLogin() {
  const navigate = useNavigate();
  const [FormData, setFormData] = useState({
    email: "", // Changed from mobileNumber to email for unified login
    password: "",
  });
const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...FormData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      setLoading(true);
    try {
      // Use unified login endpoint
      const response = await authAPI.login(
        FormData.email,
        FormData.password,
        "student"
      );

      if (response.success) {
        // Store user info
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userType", "student");
        if (response.user.roles) {
          localStorage.setItem("userRoles", JSON.stringify(response.user.roles));
        }

        console.log("Login successful:", response);
        toast.success("Login Successful!");
        
        setTimeout(() => {
          navigate("/student");
        }, 100);
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
     if(error.response?.status === 404){
             toast.error('User not Found')
           }
           else{
              toast.error("Invalid credentials. Please try again.");
           }
    } finally {
    setLoading(false);
  }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <div>
          {/* <img src={logo} alt="Your company" className="mx-auto h-25 w-25" /> */}
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Sign in to your Student Account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={FormData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={FormData.password}
              autoComplete="current-password"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
          <div className="sm:col-span-2">
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
</div>

          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/student-Register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
}
