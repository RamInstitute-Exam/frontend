import {
  Home,
  Users,
  FileBarChart,
  Upload,
  FilePlus,
  BookOpen,
  LogOut,
  X,
  TrendingUp,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../../services/apiService";
import { useState, useEffect } from "react";

export default function Sidebar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const SideBarItems = [
    { name: "Dashboard", href: "/admin/Dashboard", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Reports", href: "/admin/Reports", icon: FileBarChart },
    { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
    { name: "PDF Upload", href: "/admin/pdf-upload", icon: Upload },
    { name: "GK Question Upload", href: "/admin/upload", icon: Upload },
    { name: "Civil Question Upload", href: "/admin/civil-upload", icon: Upload },
    { name: "Batch Requests", href: "/admin/Request", icon: FilePlus },
    { name: "Exam Requests", href: "/admin/exam-requests", icon: FilePlus },
    { name: "Exams", href: "/admin/Exams", icon: BookOpen },
  ];

  const handleLogout = async () => {
    try {
      await authAPI.logout('admin');
      toast.success("Logout successful!");
      
      // Clear localStorage
      localStorage.clear();
      
      // Delay navigation slightly to allow toast to show
      setTimeout(() => {
        navigate("/");
      }, 300);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
      // Clear localStorage even on error
      localStorage.clear();
      navigate("/");
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && typeof setSidebarOpen === "function") {
      setSidebarOpen(false);
    }
  };

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-full md:w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-full flex flex-col shadow-2xl">
      {/* Logo/Brand Section */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        {user && (
          <p className="text-xs sm:text-sm text-gray-400 mt-2 truncate">{user.email}</p>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 sm:px-3">
        <ul className="space-y-1 sm:space-y-2">
          {SideBarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 text-sm sm:text-base
                    ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} className={`sm:w-5 sm:h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-400"}`} />
                  <span className="font-medium truncate">{item.name}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-3 sm:p-4 border-t border-gray-700">
        <button
          onClick={() => {
            handleLogout();
            handleLinkClick();
          }}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 font-medium text-sm sm:text-base"
        >
          <LogOut size={18} className="sm:w-5 sm:h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
