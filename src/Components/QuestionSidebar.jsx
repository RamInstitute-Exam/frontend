import React, { useEffect, useState } from "react";
import axios from "axios";
import QuestionSidebar from "./QuestionSidebar";
import QuestionCard from "./QuestionCard";
import ExamTimer from "./ExamTimer";
import "./ExamPage.css";

const ExamPage = ({ batchId, examIndex }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`/api/batches/${batchId}`);
        const examData = res.data.exams[examIndex];
        setExam(examData);
        setQuestions(examData.questions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exam:", err);
      }
    };
    fetchExam();
  }, [batchId, examIndex]);

  const handleAnswer = (questionIndex, option) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleTimeUp = () => {
    alert("Time's up! Submitting your answers...");
    // Submit answers to backend here
  };

  if (loading) return <div>Loading exam...</div>;

  return (
    <div className="exam-page">
      <div className="sidebar">
        <QuestionSidebar
          totalQuestions={questions.length}
          current={currentQuestionIndex}
          onSelect={setCurrentQuestionIndex}
          answers={answers}
        />
      </div>

      <div className="main-area">
        <ExamTimer duration={exam.duration} onTimeUp={handleTimeUp} />
        <QuestionCard
          question={questions[currentQuestionIndex]}
          index={currentQuestionIndex}
          onAnswer={handleAnswer}
          selectedOption={answers[currentQuestionIndex]}
        />
        <div className="navigation-buttons">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1))}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
