StudentExamList
'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../config/API';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function StudentExamList() {
  const [exams, setExams] = useState([]);
  const [requests, setRequests] = useState({});
  const [statuses, setStatuses] = useState({});
  const [results, setResults] = useState({});
  const [loadingMap, setLoadingMap] = useState({});


  const router = useNavigate();
  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Pass studentId to filter exams by approval status
        const res = await API.get(`Question/exams/list?studentId=${studentId}`);
        setExams(res.data);
      } catch {
        toast.error('Failed to fetch exams');
      }
    };
    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  useEffect(() => {
    if (exams.length > 0) {
      fetchRequests();
      fetchStatusesAndResults();
    }
  }, [exams]);

  const fetchRequests = async () => {
    try {
      const res = await API.get(`Question/student/${studentId}/requests`);
      const map = {};
      res.data.requests?.forEach(req => {
        map[req.examCode] = req.status;
      });
      setRequests(map);
    } catch {
      toast.error('Failed to fetch access requests');
    }
  };

  const fetchStatusesAndResults = async () => {
    try {
      const statusMap = {};
      const resultMap = {};
      for (const exam of exams) {
        const res = await API.get(`Student/student/${studentId}/exam/${exam.examCode}/status`);
        statusMap[exam.examCode] = res.data.status;

        if (res.data.status === 'completed') {
          const resultRes = await API.get(`Student/student/${studentId}/exam/${exam.examCode}/result`);
          resultMap[exam.examCode] = resultRes.data;
        }
      }
      setStatuses(statusMap);
      setResults(resultMap);
    } catch {
      toast.error('Error fetching exam statuses/results');
    }
  };

  const handleRequest = async (examCode) => {
    try {
      setLoadingMap(prev => ({ ...prev, [examCode]: true }));
      await API.post('Question/exams/request', { examCode, studentId });
      toast.success('Request sent to admin.');
      fetchRequests();
    } catch {
      toast.error('Failed to send request.');
    } finally {
      setLoadingMap(prev => ({ ...prev, [examCode]: false }));
    }
  };

  const handleStartExam = async (exam) => {
    if (exam.examEndTime && new Date() > new Date(exam.examEndTime)) {
      toast.warning('Exam time has expired!');
      return;
    }

    // ✅ Check if student has approved access
    const reqStatus = exam.requestStatus || requests[exam.examCode];
    if (reqStatus !== 'approved') {
      toast.error('You do not have approved access to this exam. Please request access first.');
      return;
    }

    try {
      // ✅ Pass studentId in query to validate approval on backend
      const batchName = exam.batch?.batchName || '';
      const res = await API.get(`Question/student/exam/${exam.examCode}/${encodeURIComponent(batchName)}?studentId=${studentId}`);
      const { questions } = res.data;
      router(`/student/exam/${exam.examCode}/${encodeURIComponent(batchName)}`, {
        state: { questions, examEndTime: exam.examEndTime },
      });
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data?.message || 'Access denied. Please request approval first.');
      } else {
        toast.error('Failed to start the exam.');
      }
    }
  };

  const handleViewResult = (examCode) => {
    const result = results[examCode];
    if (result) {
      // setSelectedResult({ examCode, ...result });
      // setShowModal(true);
    } else {
      toast.warn('Result not available yet.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Available Exams</h2>

      {exams.length === 0 ? (
        <p className="text-center text-gray-600">No exams available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            // ✅ Use requestStatus from API response if available, otherwise fallback to requests map
            const reqStatus = exam.requestStatus || requests[exam.examCode];
            const examStatus = statuses[exam.examCode];
            const isCompleted = examStatus === 'completed';

            return (
              <div
                key={exam._id}
                className="bg-white border rounded-2xl shadow hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-purple-700">{exam.examName}</h3>
                  <p className="text-gray-600 mt-1">{exam.examDescription}</p>
                  <p className="text-sm text-gray-400 mt-2">Code: {exam.examCode}</p>
                  <p className="text-sm text-gray-400">Created: {new Date(exam.createdAt).toLocaleString()}</p>
                  {exam.examEndTime && (
                    <p className="text-sm text-red-600 font-semibold mt-1">
                      Ends: {new Date(exam.examEndTime).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* ✅ Status Badge */}
                <div className="mt-2 mb-3">
                  {isCompleted ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      ✅ Completed
                    </span>
                  ) : reqStatus === 'approved' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      ✅ Approved
                    </span>
                  ) : reqStatus === 'pending' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      ⏳ Pending Approval
                    </span>
                  ) : reqStatus === 'denied' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      ❌ Access Denied
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      📝 Not Requested
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {isCompleted ? (
                    <>
                      <button
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium"
                        onClick={() => handleViewResult(exam.examCode)}
                      >
                        View Result
                      </button>
                    </>
                  ) : reqStatus === 'approved' ? (
                    <>
                      <button
                        className="w-full bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
                        onClick={() => handleStartExam(exam)}
                      >
                        Start Exam
                      </button>
                    </>
                  ) : reqStatus === 'pending' ? (
                    <button
                      disabled
                      className="w-full bg-yellow-400 text-white px-3 py-2 rounded-md text-sm cursor-not-allowed font-medium"
                    >
                      ⏳ Waiting for Approval
                    </button>
                  ) : reqStatus === 'denied' ? (
                    <div className="space-y-2">
                      <p className="text-red-600 text-sm font-medium text-center">Your request was declined</p>
                      <button
                        onClick={() => handleRequest(exam.examCode)}
                        disabled={loadingMap[exam.examCode]}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                      >
                        {loadingMap[exam.examCode] ? 'Requesting...' : 'Request Again'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequest(exam.examCode)}
                      disabled={loadingMap[exam.examCode]}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                      {loadingMap[exam.examCode] ? 'Requesting...' : 'Request Access'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      
    </div>
  );
}
