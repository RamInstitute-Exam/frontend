import { Link, useNavigate } from "react-router-dom";
import API from "../config/API";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
export default function AdminRegister() {
  const navigate = useNavigate();
  const [FormData, setFormData] = useState({
    username: "",
    mobileNumber: "",
    email: "",
    password: "",
  });

  
const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

     if(!FormData.username || !FormData.mobileNumber || !FormData.email || !FormData.password){
          toast.error('Please fill in all fields')
          return;
        }
    try {
      const response = await axios.post("https://institute-backend-wro4.onrender.com/Admin/Register", { ...FormData },{withCredentials: true});
      console.log("response", response);
      toast.success('Register Successful!')
      setTimeout(()=>{
      navigate("/institute-exam-admin-Login");
      },100)
    } catch (error) {
      console.error("Registration failed", error);
      
    }
    finally{
    setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white p-6 sm:p-10 rounded-xl shadow-lg">
        <div className="text-center mb-6">
          {/* <img
            className="mx-auto h-35 w-auto"
            src={logo}
            alt="Logo"
          /> */}
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Admin Signup Form</h2>
          <p className="mt-1 text-sm text-gray-500">Please fill in the details accurately</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            id="username"
            name="username"
            placeholder="Enter Username"
            value={FormData.username}
            onChange={handleChange}
          />

          <Input
            label="Mobile Number"
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            pattern="[0-9]{10}"
            maxLength="10"
            placeholder="Enter 10-digit mobile number"
            value={FormData.mobileNumber}
            onChange={handleChange}
          />

          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="Enter Email Address"
            value={FormData.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="Enter Password"
            value={FormData.password}
            onChange={handleChange}
          />

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
        Registering...
      </div>
    ) : (
      "Register"
    )}
  </button>
        </form>

       
      </div>
    </div>
  );
}

// ✅ Updated reusable Input component
function Input({ label, id, name, type = "text", placeholder = "", pattern, maxLength, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        pattern={pattern}
        maxLength={maxLength}
        required
        value={value}
        onChange={onChange}
        className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
