
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

export const ExamBrowser = () => {
  const { studentId } = useParams(); // from /student/reports/:studentId
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`https://institute-backend-wro4.onrender.com/Question/student/all-reports/${studentId}`);
        setReports(res.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [studentId]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  if (!reports.length) return <div className="p-4 text-center">No reports found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Exam Reports</h2>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Link
            key={report._id}
            to={`/student/exam-review/${report.examId._id}/${report.studentId}`}
            className="block border p-4 rounded hover:shadow transition"
          >
            <p className="font-semibold">{report.examId.examName}</p>
            <p className="text-sm text-gray-500">{report.examId.examCode} - {report.examId.category}</p>
            <p className="mt-1 text-sm">
              Score: {report.correctAnswers} / {report.totalQuestions} ({Math.round((report.correctAnswers / report.totalQuestions) * 100)}%)
            </p>
            <p className="text-xs text-gray-400">Submitted: {new Date(report.createdAt).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

