import React,{ useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const initialState = {
  current: 0,
  answers: {},
  reviewFlags: {},
  timer: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload, total: action.payload.length };
    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.qNo]: action.answer },
      };
    case 'REVIEW':
      return {
        ...state,
        reviewFlags: { ...state.reviewFlags, [action.qNo]: action.flag },
      };
    case 'NEXT':
      return { ...state, current: Math.min(state.current + 1, state.total - 1) };
    case 'PREV':
      return { ...state, current: Math.max(state.current - 1, 0) };
    case 'TICK':
      return { ...state, timer: state.timer + 1 };
    case 'RESET_TIMER':
      return { ...state, timer: 0 };
    default:
      return state;
  }
}

export default function StudentExamWritePage({ studentId }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);
const {examCode} = useParams();

  // Fetch exam questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`https://institute-backend-wro4.onrender.com/Question/student/exam/${examCode}`);
        dispatch({ type: 'SET_QUESTIONS', payload: res.data.questions });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      }
    };
    fetchQuestions();
  }, [examCode]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (qNo, answer) => {
    dispatch({ type: 'ANSWER', qNo, answer });
  };

  const handleReviewToggle = (qNo) => {
    const flag = !state.reviewFlags[qNo];
    dispatch({ type: 'REVIEW', qNo, flag });
  };

  const handleSubmit = async () => {
    const totalQuestions = state.total;
    const attempted = Object.keys(state.answers).length;
    const unanswered = totalQuestions - attempted;
    const reviewed = Object.values(state.reviewFlags).filter(Boolean).length;

    const payload = {
      examCode,
      studentId,
      totalQuestions,
      answers: state.answers,
      attemptedQuestions: attempted,
      unansweredQuestions: unanswered,
      reviewedQuestionsCount: reviewed,
      status: 'completed',
      endTime: new Date(),
    };

    try {
      await axios.post('/api/student-exam/submit', payload);
      alert('Exam submitted successfully!');
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Error submitting exam. Please try again.');
    }
  };

  if (loading) return <p className="p-4 text-center">Loading questions...</p>;

  const currentQuestion = state.questions[state.current];
  const selected = state.answers[currentQuestion.questionNumber];
console.log(currentQuestion,'question data');

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Question {currentQuestion.questionNumber}/{state.total}
        </h2>
        <span className="text-sm bg-gray-200 rounded px-2 py-1">
          Time: {Math.floor(state.timer / 60)}:{('0' + (state.timer % 60)).slice(-2)}
        </span>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-lg font-medium">{currentQuestion.questionText}</p>
       
        <div className="grid gap-2">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`q-${currentQuestion.questionNumber}`}
                value={key}
                checked={selected === key}
                onChange={() => handleAnswer(currentQuestion.questionNumber, key)}
              />
              {key}: {value}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button
          className="bg-gray-300 px-4 py-2 rounded"
          onClick={() => dispatch({ type: 'PREV' })}
        >
          Prev
        </button>
        <button
          className="bg-yellow-300 px-4 py-2 rounded"
          onClick={() => handleReviewToggle(currentQuestion.questionNumber)}
        >
          {state.reviewFlags[currentQuestion.questionNumber] ? 'Unmark Review' : 'Mark for Review'}
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => dispatch({ type: 'NEXT' })}
        >
          Next
        </button>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
}
