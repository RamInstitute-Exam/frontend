import React, { useState, useEffect } from "react";
import API from "../../config/API";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
const QuestionPerPage = 20;

export default function StudentExamPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const { examCode } = useParams();
  const navigate = useNavigate();

useEffect(() => {
  const fetchData = async () => {
    try {
      const studentId = localStorage.getItem("userId");
      if (!studentId) {
        alert("User not logged in");
        return;
      }

      // Check submission status
      const statusRes = await axios.get(
        `https://institute-backend-wro4.onrender.com/Student/student/${studentId}/exam/${examCode}/status`
      ,{withCredentials: true});

      if (statusRes.data?.isSubmitted) {
        setIsSubmitted(true);
        setScore(statusRes.data?.score || null);
        // ✅ Still fetch questions for total count
        const res = await axios.get(`https://institute-backend-wro4.onrender.com/Question/exams/${examCode}/questions`,{withCredentials: true});
        setQuestions(res.data.questions || []);
        return;
      }

      // Fetch questions if not submitted
      const res = await axios.get(`https://institute-backend-wro4.onrender.com/Question/exams/${examCode}/questions`,{withCredentials: true});
      const fetchedQuestions = res.data.questions || [];
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching exam data:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [examCode]);


  const handleChange = (Qno, option) => {
    setAnswers((prev) => ({ ...prev, [Qno]: option }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const studentId = localStorage.getItem("userId");
      const response = await axios.post(`https://institute-backend-wro4.onrender.com/Question/student/exam/submit`, {
        examCode,
        studentId,
        answers,
      },{withCredentials: true});

      const result = response.data.data;
      console.log(result,"result");
      
      setIsSubmitted(true);
      setScore(result?.score);
      alert(`✅ Your score: ${result?.score} / ${questions.length}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      if(error.response.status === 400){
        toast.error('Exam already Submitted')
      }
    }
  };

  const totalPages = Math.ceil(questions.length / QuestionPerPage);
  const startIndex = (currentPage - 1) * QuestionPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + QuestionPerPage);

  // ✅ Loading State
  if (loading && !isSubmitted) {
    return (
      <div className="text-center mt-40 text-gray-500 text-lg">
        Loading questions...
      </div>
    );
  }

  // ✅ Exam Already Submitted View
  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto mt-24 bg-white border border-green-300 rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Exam Completed Successfully!</h2>

        {score !== null && (
          <div className="text-xl font-semibold text-gray-800 mt-4">
            Your Score:
            <span className="text-blue-600 font-bold text-3xl ml-2">
              {score} / {questions.length || "N/A"}
            </span>
          </div>
        )}

        <p className="mt-4 text-gray-600">Great job! You’ve completed your test. 🎓</p>

        <button
          onClick={() => navigate("/student")}
          className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all"
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    );
  }

  // ✅ Exam UI
  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">📘 Exam: {examCode}</h2>

      <form onSubmit={handleSubmit}>
        {currentQuestions.map((q) => (
          <div
            key={q.questionNumber}
            className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-lg text-gray-800 mb-3">
              {q.questionNumber}. {q.questionText}
            </p>

            <div className="ml-4 grid gap-2">
              {Object.entries(q.options).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all"
                >
                  <input
                    type="radio"
                    name={`question-${q.questionNumber}`}
                    value={key}
                    checked={answers[q.questionNumber] === key}
                    onChange={() => handleChange(q.questionNumber, key)}
                    className="form-radio text-blue-600 h-5 w-5 mr-3"
                  />
                  <span className="text-gray-700 font-medium">
                    {key}) {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {/* Pagination + Buttons */}
{!isSubmitted && (
        <div className="flex justify-between items-center mt-10">
          <button
            type="button"
            onClick={() => {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            ⬅ Previous
          </button>

          <span className="text-gray-600 font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage === totalPages && currentQuestions.length >= 0 ? (
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              🚀 Submit Exam
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Next ➡
            </button>
          )}
        </div>
)}
      </form>
    </div>
  );
}
