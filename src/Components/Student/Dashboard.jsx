import React from 'react';
import ModernDashboard from './ModernDashboard';

const StudentHomeDashboard = () => {
  return <ModernDashboard />;
  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-6 mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome to Ram Institute</h1>
        <p className="mt-2 text-gray-600">
          Prepare for your <span className="text-blue-600 font-semibold">GK</span> and <span className="text-purple-600 font-semibold">Coding</span> exams conducted <b>online</b> with ease.
        </p>
      </motion.div>

      {/* Institute Information */}
      {/* <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-5 mb-6"
      >
        <h2 className="text-xl font-semibold text-blue-700">About Ram Institute</h2>
        <p className="text-gray-700 mt-2">
          Ram Institute is dedicated to enhancing student knowledge through online assessments. Our focus is to build general knowledge and strong programming foundations. Exams are conducted online with real-time results and performance tracking.
        </p>
      </motion.div> */}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Start Exam"
          description="Take your active exam now"
          icon={<BookOpenIcon className="w-6 h-6 text-green-900" />}
          color="bg-green-500"
          href='/student/exams-list'
        />
        <Card
          title="View Results"
          description="Check your exam performance"
          icon={<CheckCircleIcon className="w-6 h-6 text-indigo-900" />}
          color="bg-indigo-500"
          href="/student/exams"
        />
        <Card
          title="Upcoming Exams"
          description="View scheduled exams"
          icon={<CalendarDaysIcon className="w-6 h-6 text-yellow-800" />}
          color="bg-yellow-500"
          href="/student/exams-list"
        />
        <Card
          title="Exam Requests"
          description="View Request History"
          icon={<ExclamationCircleIcon className="w-6 h-6 text-purple-800" />}
          color="bg-purple-500"
        />
      </div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10 text-center"
      >
        <p className="text-lg text-gray-600 italic">
          "The expert in anything was once a beginner – keep learning, keep growing!"
        </p>
      </motion.div>
    </div>
  );
};

const Card = ({ title, description, icon, color, href, iconColor }) => (
  <Link to={href} className="block">
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`rounded-2xl p-6 shadow-lg ${color} flex items-center gap-4`}
    >
      <div className="bg-white p-3 rounded-full shadow-md">
        {React.cloneElement(icon, { className: `w-6 h-6 ${iconColor}` })}
      </div>
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm">{description}</p>
      </div>
    </motion.div>
  </Link>
);



export default StudentHomeDashboard;
