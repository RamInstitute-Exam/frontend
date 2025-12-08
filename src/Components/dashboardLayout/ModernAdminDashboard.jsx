import { useEffect, useState } from "react";
import { 
  FiUsers, 
  FiBook, 
  FiCheckCircle, 
  FiClock, 
  FiTrendingUp, 
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw
} from "react-icons/fi";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { adminAPI, reportsAPI } from "../../services/apiService";
import { toast } from "react-toastify";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ModernAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalCompletedExams: 0,
    totalPendingExams: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalAdmins: 0,
    averageScore: 0,
    passRate: 0,
  });

  const [charts, setCharts] = useState({
    studentAttendance: [],
    passFailData: { pass: 0, fail: 0 },
    dailyActivity: [],
    examPerformance: [],
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statistics = await adminAPI.getStatistics();
      
      // Calculate additional metrics
      const activeUsers = statistics.totalStudents || 0; // You can add active/inactive logic
      const inactiveUsers = 0; // Add logic to calculate inactive users
      const totalAdmins = 0; // Add endpoint to get admin count
      
      // Calculate pass rate
      const totalAttempts = statistics.passFailData?.pass + statistics.passFailData?.fail || 0;
      const passRate = totalAttempts > 0 
        ? ((statistics.passFailData?.pass / totalAttempts) * 100).toFixed(1)
        : 0;

      setStats({
        totalStudents: statistics.totalStudents || 0,
        totalExams: statistics.totalExams || 0,
        totalCompletedExams: statistics.totalCompletedExams || 0,
        totalPendingExams: statistics.totalPendingExams || 0,
        activeUsers,
        inactiveUsers,
        totalAdmins,
        averageScore: 0, // Add calculation
        passRate: parseFloat(passRate),
      });

      setCharts({
        studentAttendance: statistics.studentAttendance || [],
        passFailData: statistics.passFailData || { pass: 0, fail: 0 },
        dailyActivity: [],
        examPerformance: [],
      });

      // Fetch recent activity (exam reports)
      try {
        const reports = await reportsAPI.getAllReports();
        const recent = Array.isArray(reports) ? reports.slice(0, 5) : [];
        setRecentActivity(recent);
      } catch (err) {
        console.error("Error fetching recent activity:", err);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const attendanceChartData = {
    labels: charts.studentAttendance.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: "Student Attendance",
        data: charts.studentAttendance.map((item) => item.attended),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const passFailChartData = {
    labels: ["Pass", "Fail"],
    datasets: [
      {
        data: [charts.passFailData.pass, charts.passFailData.fail],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600",
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const StatCard = ({ icon: Icon, label, value, change, changeType, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      green: "bg-green-50 border-green-200 text-green-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600",
      red: "bg-red-50 border-red-200 text-red-600",
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color]}`}>
            {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
          </div>
          {change && (
            <div className={`flex items-center text-xs sm:text-sm font-medium ${
              changeType === "up" ? "text-green-600" : "text-red-600"
            }`}>
              {changeType === "up" ? <FiArrowUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <FiArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="ml-1">{change}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{typeof value === 'string' ? value : value.toLocaleString()}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 md:py-6 space-y-4 md:space-y-6 w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={FiUsers}
            label="Total Students"
            value={stats.totalStudents}
            change={5.2}
            changeType="up"
            color="blue"
          />
          <StatCard
            icon={FiBook}
            label="Total Exams"
            value={stats.totalExams}
            change={12.5}
            changeType="up"
            color="purple"
          />
          <StatCard
            icon={FiCheckCircle}
            label="Completed Exams"
            value={stats.totalCompletedExams}
            change={8.3}
            changeType="up"
            color="green"
          />
          <StatCard
            icon={FiClock}
            label="Pending Exams"
            value={stats.totalPendingExams}
            change={-2.1}
            changeType="down"
            color="orange"
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            icon={FiActivity}
            label="Active Users"
            value={stats.activeUsers}
            color="green"
          />
          <StatCard
            icon={FiTrendingUp}
            label="Pass Rate"
            value={`${stats.passRate}%`}
            color="blue"
          />
          <StatCard
            icon={FiUsers}
            label="Total Admins"
            value={stats.totalAdmins}
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Attendance Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="text-sm sm:text-base">Student Attendance Trends</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Last 30 days</p>
              </div>
            </div>
            <div className="h-48 sm:h-64">
              {charts.studentAttendance.length > 0 ? (
                <Line data={attendanceChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>No attendance data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Pass/Fail Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiPieChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  <span className="text-sm sm:text-base">Pass vs Fail Distribution</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Overall performance</p>
              </div>
            </div>
            <div className="h-48 sm:h-64">
              {charts.passFailData.pass + charts.passFailData.fail > 0 ? (
                <Doughnut data={passFailChartData} options={doughnutOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>No exam data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiActivity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-sm sm:text-base">Recent Exam Activities</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Latest exam submissions</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Code
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Student
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {activity.examCode || "N/A"}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                          {activity.student?.name || activity.studentId || "N/A"}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          <span className={`font-semibold ${
                            activity.result >= 50 ? "text-green-600" : "text-red-600"
                          }`}>
                            {activity.result?.toFixed(1) || "0"}%
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            activity.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {activity.status || "pending"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                          {activity.startTime
                            ? new Date(activity.startTime).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                        No recent activity
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdminDashboard;

